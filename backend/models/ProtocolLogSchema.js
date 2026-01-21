import mongoose from "mongoose";

/**
 * ProtocolLog Schema - Formal Protocol Execution Audit Trail
 * 
 * This schema documents the execution of clinical protocols.
 * It serves legal/ethical/compliance purposes and ensures traceability.
 * 
 * Protocol Types:
 * - SUICIDE_PROTOCOL: Step-by-step response to suicide risk (Columbia Scale)
 * - CRISIS_PROTOCOL: Immediate crisis intervention
 * - REFERRAL_PROTOCOL: Formal referral to another provider
 * - ABANDONMENT_PROTOCOL: Steps taken when patient drops out
 * - NON_ADHERENCE_PROTOCOL: Intervention for treatment non-compliance
 * - BREACH_PROTOCOL: Response to confidentiality breach or ethical violation
 * - TECH_FAILURE_PROTOCOL: Telepsychology technology failure response
 * 
 * Every protocol must:
 * 1. Document each step taken
 * 2. Require clinical justification
 * 3. Be immutable once completed
 * 4. Be available for audit/legal review
 */

const ProtocolLogSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Types.ObjectId,
      ref: "ClinicalAlert",
      required: true,
    },
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    treatmentPlanId: {
      type: mongoose.Types.ObjectId,
      ref: "TreatmentPlan",
      required: true,
    },
    activatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Protocol Classification
    protocolType: {
      type: String,
      enum: [
        "SUICIDE_PROTOCOL",
        "CRISIS_PROTOCOL",
        "REFERRAL_PROTOCOL",
        "ABANDONMENT_PROTOCOL",
        "NON_ADHERENCE_PROTOCOL",
        "BREACH_PROTOCOL",
        "TECH_FAILURE_PROTOCOL",
      ],
      required: true,
      index: true,
    },
    protocolVersion: {
      type: String,
      required: true,
      // e.g., "v2.1" - Important for tracking which protocol guidelines were followed
    },

    // Activation Context
    activatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    activationReason: {
      type: String,
      required: true,
      // Clinical justification for activating this protocol
    },
    immediateContext: {
      type: String,
      // What was happening at the moment of activation
      // e.g., "Patient sent message stating 'I can't go on anymore' at 10:45 PM"
    },

    // Protocol Execution Steps
    steps: [
      {
        stepNumber: { type: Number, required: true },
        stepName: { type: String, required: true },
        // e.g., "Assess Lethality", "Contact Emergency Contact", "Document Safety Plan"
        description: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        completedBy: { type: mongoose.Types.ObjectId, ref: "Doctor" },
        notes: String, // What happened during this step
        evidence: [
          {
            type: { type: String, enum: ["NOTE", "CALL_LOG", "EMAIL", "DOCUMENT"] },
            content: String,
            timestamp: { type: Date, default: Date.now },
          },
        ],
        outcome: {
          type: String,
          enum: ["SUCCESS", "PARTIAL", "FAILED", "NOT_APPLICABLE"],
        },
      },
    ],

    // Risk Assessment (for suicide/crisis protocols)
    columbiaScale: {
      // Columbia-Suicide Severity Rating Scale
      suicidalIdeation: { type: Number, min: 0, max: 5 },
      intensityOfIdeation: { type: Number, min: 0, max: 5 },
      suicidalBehavior: { type: Number, min: 0, max: 5 },
      actualAttempts: { type: Number, min: 0 },
      assessedAt: Date,
      assessedBy: { type: mongoose.Types.ObjectId, ref: "Doctor" },
    },

    // Safety Plan (for suicide/crisis protocols)
    safetyPlanActivated: { type: Boolean, default: false },
    safetyPlanDetails: {
      warningSignsIdentified: [String],
      copingStrategiesReviewed: [String],
      supportContactsReached: [
        {
          name: String,
          relationship: String,
          contactAttemptTime: Date,
          reached: Boolean,
          notes: String,
        },
      ],
      emergencyServicesContacted: { type: Boolean, default: false },
      emergencyServicesDetails: String,
    },

    // Clinical Decision & Outcome
    clinicalDecision: {
      type: String,
      required: true,
      // The final clinical judgment after protocol execution
      // e.g., "Patient is safe to continue outpatient treatment with enhanced monitoring"
      // e.g., "Referral to inpatient crisis center initiated"
    },
    clinicalJustification: {
      type: String,
      required: true,
      // Detailed reasoning behind the clinical decision
      // This field is MANDATORY for legal/ethical compliance
    },
    outcome: {
      type: String,
      enum: [
        "RESOLVED", // Crisis resolved, treatment continues
        "ESCALATED", // Escalated to higher level of care
        "REFERRED_OUT", // Patient referred to another provider
        "HOSPITALIZED", // Patient required inpatient admission
        "PATIENT_DECLINED", // Patient refused recommended intervention
        "ONGOING", // Protocol still active
      ],
      required: true,
    },

    // Follow-Up
    followUpRequired: { type: Boolean, default: true },
    followUpPlan: {
      nextContactDate: Date,
      contactMethod: { type: String, enum: ["SESSION", "CALL", "EMAIL", "TEXT"] },
      monitoringFrequency: String, // e.g., "Daily check-ins for 7 days"
      additionalActions: [String],
    },
    followUpCompleted: { type: Boolean, default: false },
    followUpNotes: String,

    // Protocol Status
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    completedAt: Date,
    completedBy: { type: mongoose.Types.ObjectId, ref: "Doctor" },
    cancellationReason: String, // If protocol was cancelled (rare, must be justified)

    // Supervision & Review
    supervisorReview: {
      reviewedBy: { type: mongoose.Types.ObjectId, ref: "Doctor" },
      reviewedAt: Date,
      approved: Boolean,
      reviewNotes: String,
    },

    // Legal/Compliance
    isSigned: {
      type: Boolean,
      default: false,
      // Once signed, the record becomes immutable
    },
    signedAt: Date,
    digitalSignature: String, // Hash of document for integrity verification

    // Amendments (if protocol record needs updating after signing)
    amendments: [
      {
        amendedAt: { type: Date, default: Date.now },
        amendedBy: { type: mongoose.Types.ObjectId, ref: "Doctor" },
        reason: { type: String, required: true },
        changes: String,
        previousVersion: mongoose.Schema.Types.Mixed, // Snapshot before amendment
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
ProtocolLogSchema.index({ patientId: 1, protocolType: 1, activatedAt: -1 });
ProtocolLogSchema.index({ activatedBy: 1, status: 1 });
ProtocolLogSchema.index({ status: 1, followUpRequired: 1 });

// Virtual: Protocol duration
ProtocolLogSchema.virtual("durationHours").get(function () {
  const end = this.completedAt || new Date();
  return Math.floor((end - this.activatedAt) / (1000 * 60 * 60));
});

// Virtual: Completion percentage
ProtocolLogSchema.virtual("completionPercentage").get(function () {
  if (!this.steps || this.steps.length === 0) return 0;
  const completed = this.steps.filter((s) => s.completed).length;
  return Math.round((completed / this.steps.length) * 100);
});

// Method: Complete a step
ProtocolLogSchema.methods.completeStep = function (stepNumber, clinicianId, notes, outcome) {
  const step = this.steps.find((s) => s.stepNumber === stepNumber);
  if (!step) throw new Error(`Step ${stepNumber} not found`);
  if (this.isSigned) throw new Error("Cannot modify signed protocol log");

  step.completed = true;
  step.completedAt = new Date();
  step.completedBy = clinicianId;
  step.notes = notes;
  step.outcome = outcome;

  return this.save();
};

// Method: Sign and lock the protocol
ProtocolLogSchema.methods.sign = function (clinicianId) {
  if (this.isSigned) throw new Error("Protocol already signed");
  if (this.status !== "COMPLETED") throw new Error("Can only sign completed protocols");

  // Verify all required steps are completed
  const incompleteSteps = this.steps.filter((s) => !s.completed);
  if (incompleteSteps.length > 0) {
    throw new Error(`Cannot sign: ${incompleteSteps.length} steps incomplete`);
  }

  this.isSigned = true;
  this.signedAt = new Date();
  this.completedBy = clinicianId;

  // Generate simple hash for integrity (in production, use proper cryptographic signature)
  const crypto = require("crypto");
  const content = JSON.stringify(this.toObject());
  this.digitalSignature = crypto.createHash("sha256").update(content).digest("hex");

  return this.save();
};

// Method: Amend a signed protocol (creates audit trail)
ProtocolLogSchema.methods.amend = function (clinicianId, reason, changes) {
  if (!this.isSigned) throw new Error("Can only amend signed protocols");

  const previousVersion = this.toObject();
  delete previousVersion._id;
  delete previousVersion.__v;

  this.amendments.push({
    amendedBy: clinicianId,
    reason,
    changes,
    previousVersion,
  });

  return this.save();
};

// Middleware: Prevent modification of signed protocols
ProtocolLogSchema.pre("save", function (next) {
  if (this.isSigned && !this.isNew && this.isModified()) {
    // Only allow amendments array to be modified
    const modifiedPaths = this.modifiedPaths();
    const allowedPaths = ["amendments", "supervisorReview"];
    const illegalMods = modifiedPaths.filter((path) => !allowedPaths.some((ap) => path.startsWith(ap)));

    if (illegalMods.length > 0) {
      return next(new Error(`Cannot modify signed protocol. Use amend() method. Attempted: ${illegalMods.join(", ")}`));
    }
  }
  next();
});

// Static: Get active protocols requiring follow-up
ProtocolLogSchema.statics.getFollowUpRequired = async function (psychologistId) {
  return this.find({
    activatedBy: psychologistId,
    status: "COMPLETED",
    followUpRequired: true,
    followUpCompleted: false,
    "followUpPlan.nextContactDate": { $lte: new Date() },
  })
    .populate("patientId", "name email phone")
    .sort({ "followUpPlan.nextContactDate": 1 })
    .lean();
};

export default mongoose.model("ProtocolLog", ProtocolLogSchema);
