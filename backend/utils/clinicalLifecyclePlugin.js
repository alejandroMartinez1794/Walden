import mongoose from 'mongoose';
import logger from './logger.js';

const DEFAULT_RETENTION_YEARS = 8;

export const sanitizeClinicalText = (value) => {
  if (typeof value !== 'string') return value;

  return value
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const isPlainObject = (value) => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  !(value instanceof mongoose.Types.ObjectId)
);

const deepClone = (value) => {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
};

const getPathValue = (source, path) => path.split('.').reduce((acc, segment) => (
  acc == null ? undefined : acc[segment]
), source);

const flattenPaths = (value, prefix = '') => {
  if (!isPlainObject(value)) {
    return prefix ? [prefix] : [];
  }

  const paths = [];

  Object.entries(value).forEach(([key, nestedValue]) => {
    if (nestedValue === undefined) return;

    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(nestedValue) || nestedValue instanceof Date || nestedValue instanceof mongoose.Types.ObjectId) {
      paths.push(path);
      return;
    }

    if (isPlainObject(nestedValue)) {
      const childPaths = flattenPaths(nestedValue, path);
      if (childPaths.length > 0) {
        paths.push(...childPaths);
        return;
      }
    }

    paths.push(path);
  });

  return paths;
};

const buildChanges = (before, after, paths) => {
  const uniquePaths = [...new Set(paths.filter(Boolean))];

  return uniquePaths
    .map((path) => {
      const previousValue = deepClone(getPathValue(before, path));
      const newValue = deepClone(getPathValue(after, path));

      if (JSON.stringify(previousValue) === JSON.stringify(newValue)) {
        return null;
      }

      return {
        path,
        previousValue: previousValue ?? null,
        newValue: newValue ?? null,
      };
    })
    .filter(Boolean);
};

const addYears = (date, years) => {
  const output = new Date(date);
  output.setFullYear(output.getFullYear() + years);
  return output;
};

const resolveActor = (context = {}) => ({
  userId: context.userId || null,
  role: context.role || 'unknown',
  email: context.email || null,
  ip: context.ip || null,
  userAgent: context.userAgent || null,
});

const writeAuditLog = async (payload) => {
  try {
    const { default: ClinicalAuditLog } = await import('../models/ClinicalAuditLogSchema.js');
    return await ClinicalAuditLog.create(payload);
  } catch (error) {
    logger.error('Failed to write clinical audit log:', error);
    return null;
  }
};

const getAuditContext = (doc, source = {}) => ({
  userId: source.userId || doc?.$locals?.clinicalAuditActor?.userId || null,
  role: source.role || doc?.$locals?.clinicalAuditActor?.role || 'unknown',
  email: source.email || doc?.$locals?.clinicalAuditActor?.email || null,
  ip: source.ip || doc?.$locals?.clinicalAuditActor?.ip || null,
  userAgent: source.userAgent || doc?.$locals?.clinicalAuditActor?.userAgent || null,
});

const collectRelevantPaths = (schema, doc, additionalPaths = []) => {
  const modifiedPaths = typeof doc.modifiedPaths === 'function' ? doc.modifiedPaths() : [];
  const schemaAuditPaths = schema.options?.clinicalAuditPaths || [];
  return [...new Set([...modifiedPaths, ...schemaAuditPaths, ...additionalPaths])];
};

const getUpdateObject = (update = {}) => {
  if (update.$set || update.$unset || update.$inc || update.$push) {
    return {
      ...update.$set,
      ...update.$unset,
      ...update.$inc,
      ...update.$push,
    };
  }

  return update;
};

const defaultFilter = function () {
  const options = this.getOptions?.() || {};
  const query = this.getQuery?.() || {};

  if (options.includeDeleted || query.isDeleted !== undefined) {
    return;
  }

  this.where({ isDeleted: { $ne: true } });
};

const blockHardDelete = function (next) {
  const options = this.getOptions?.() || {};

  if (options.hardDelete === true || options.clinicalHardDelete === true) {
    return next();
  }

  return next(new Error('Clinical records use soft delete. Hard delete requires explicit policy override.'));
};

export const applyClinicalLifecycle = (schema, options = {}) => {
  const entityName = options.entityName || schema.options.collection || schema.options.name || 'ClinicalRecord';
  const retentionYears = options.retentionYears ?? DEFAULT_RETENTION_YEARS;

  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId },
    deletedByRole: { type: String },
    deletionReason: { type: String, trim: true, maxlength: 1000, set: sanitizeClinicalText },
    legalHold: { type: Boolean, default: false, index: true },
    legalHoldReason: { type: String, trim: true, maxlength: 1000, set: sanitizeClinicalText },
    legalHoldAt: { type: Date },
    retentionExpiresAt: { type: Date, index: true },
  });

  schema.index({ isDeleted: 1, legalHold: 1, retentionExpiresAt: 1 });

  schema.pre(/^find/, defaultFilter);
  schema.pre('countDocuments', defaultFilter);
  schema.pre('findOne', defaultFilter);
  schema.pre('findOneAndUpdate', defaultFilter);
  schema.pre('findOneAndDelete', defaultFilter);
  schema.pre('deleteOne', { document: false, query: true }, blockHardDelete);
  schema.pre('deleteMany', { document: false, query: true }, blockHardDelete);

  schema.pre('aggregate', function () {
    const options = this.options || {};
    if (options.includeDeleted) return;
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  });

  schema.methods.softDelete = async function (actor = {}, reason = 'Soft delete') {
    if (this.legalHold) {
      throw new Error('Record is under legal hold and cannot be deleted');
    }

    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = actor.userId || null;
    this.deletedByRole = actor.role || 'unknown';
    this.deletionReason = sanitizeClinicalText(reason);
    this.retentionExpiresAt = this.retentionExpiresAt || addYears(this.createdAt || new Date(), retentionYears);

    this.$locals = this.$locals || {};
    this.$locals.clinicalAuditActor = actor;
    this.$locals.clinicalAuditAction = 'DELETE';

    return this.save();
  };

  schema.methods.restore = async function (actor = {}, reason = 'Restore record') {
    this.isDeleted = false;
    this.deletedAt = undefined;
    this.deletedBy = undefined;
    this.deletedByRole = undefined;
    this.deletionReason = sanitizeClinicalText(reason);

    this.$locals = this.$locals || {};
    this.$locals.clinicalAuditActor = actor;
    this.$locals.clinicalAuditAction = 'RESTORE';

    return this.save();
  };

  schema.pre('save', async function (next) {
    try {
      if (this.isNew && !this.retentionExpiresAt) {
        this.retentionExpiresAt = addYears(new Date(), retentionYears);
      }

      if (this.legalHold && !this.legalHoldAt) {
        this.legalHoldAt = new Date();
      }

      if (this.isNew) {
        this.$locals = this.$locals || {};
        this.$locals.clinicalAuditSnapshot = {
          wasNew: true,
          previous: null,
          changedPaths: collectRelevantPaths(schema, this),
        };
        return next();
      }

      if (!this.isModified()) {
        return next();
      }

      const previous = await this.constructor.findById(this._id).setOptions({ includeDeleted: true }).lean();
      this.$locals = this.$locals || {};
      this.$locals.clinicalAuditSnapshot = {
        wasNew: false,
        previous,
        changedPaths: collectRelevantPaths(schema, this),
      };

      return next();
    } catch (error) {
      return next(error);
    }
  });

  schema.post('save', async function (doc, next) {
    const snapshot = doc.$locals?.clinicalAuditSnapshot;
    if (!snapshot) return next();

    try {
      const current = doc.toObject({ depopulate: true, getters: false, virtuals: false });
      const changes = buildChanges(snapshot.previous, current, snapshot.changedPaths);
      const action = snapshot.wasNew
        ? 'CREATE'
        : doc.isDeleted
          ? 'DELETE'
          : 'UPDATE';

      if (changes.length === 0 && !snapshot.wasNew) {
        return next();
      }

      await writeAuditLog({
        actor: resolveActor(getAuditContext(doc)),
        action,
        resource: {
          entity: entityName,
          entityId: doc._id,
        },
        changes,
        previousValue: snapshot.previous,
        newValue: current,
        context: {
          status: 'SUCCESS',
          reason: doc.$locals?.clinicalAuditReason || null,
        },
      });

      return next();
    } catch (error) {
      logger.error(`Clinical audit post-save failed for ${entityName}:`, error);
      return next();
    }
  });

  schema.pre('findOneAndUpdate', async function (next) {
    try {
      const options = this.getOptions?.() || {};
      if (options.includeDeleted) {
        return next();
      }

      this.where({ isDeleted: { $ne: true } });

      const update = getUpdateObject(this.getUpdate() || {});
      const previous = await this.model.findOne(this.getQuery()).setOptions({ includeDeleted: true }).lean();

      this.$locals = this.$locals || {};
      this.$locals.clinicalAuditSnapshot = {
        previous,
        update,
        actor: options.clinicalAuditActor || null,
        wasUpsert: Boolean(options.upsert),
      };

      if (update.isDeleted === true && !update.deletedAt) {
        update.deletedAt = new Date();
      }

      if (update.legalHold === true && !update.legalHoldAt) {
        update.legalHoldAt = new Date();
      }

      return next();
    } catch (error) {
      return next(error);
    }
  });

  schema.post('findOneAndUpdate', async function (doc, next) {
    const snapshot = this.$locals?.clinicalAuditSnapshot;
    if (!snapshot || !doc) return next();

    try {
      const current = doc.toObject ? doc.toObject({ depopulate: true, getters: false, virtuals: false }) : doc;
      const paths = flattenPaths(snapshot.update);
      const changes = buildChanges(snapshot.previous, current, paths);
      const action = snapshot.previous ? 'UPDATE' : 'CREATE';

      if (changes.length === 0 && snapshot.previous) {
        return next();
      }

      await writeAuditLog({
        actor: resolveActor(getAuditContext(doc, snapshot.actor || {})),
        action,
        resource: {
          entity: entityName,
          entityId: doc._id,
        },
        changes,
        previousValue: snapshot.previous,
        newValue: current,
        context: {
          status: 'SUCCESS',
        },
      });

      return next();
    } catch (error) {
      logger.error(`Clinical audit post-findOneAndUpdate failed for ${entityName}:`, error);
      return next();
    }
  });
};

export default applyClinicalLifecycle;
