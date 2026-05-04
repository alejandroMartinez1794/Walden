import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/UserSchema.js';
import Doctor from '../../models/DoctorSchema.js';
import MedicalRecord from '../../models/MedicalRecordSchema.js';
import PsychologicalPatient from '../../models/PsychologicalPatientSchema.js';
import PsychologicalClinicalHistory from '../../models/PsychologicalClinicalHistorySchema.js';
import TreatmentPlan from '../../models/TreatmentPlanSchema.js';
import ClinicalAuditLog from '../../models/ClinicalAuditLogSchema.js';
import ARCORequest from '../../models/ARCORequestSchema.js';
import { buildArcoExportBundle, executeArcoRectification, recordArcoMetric, getArcoMetricsSnapshot, resetArcoMetrics } from '../../utils/arcoWorkflow.js';

let mongoServer;
let performanceResults = {
  exportBuild: [],
  rectificationBatch: [],
  softDeleteFilter: [],
  metricsSnapshot: [],
};

// Helper: Measure operation in milliseconds
const measureOperation = (fn) => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};

// Helper: Calculate percentiles
const calculatePercentiles = (timings) => {
  const sorted = [...timings].sort((a, b) => a - b);
  return {
    min: sorted[0],
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    max: sorted[sorted.length - 1],
    avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
  };
};

describe('ARCO Performance Benchmarks', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    resetArcoMetrics();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ===== BENCHMARK 1: Export Bundle Building (10K records) =====
  describe('Export Bundle Building', () => {
    it('should build export bundle with 10K clinical records in acceptable time', async () => {
      // Create a patient user
      const patientUser = await User.create({
        name: 'Benchmark Patient',
        email: 'benchmark.patient@test.com',
        password: 'hash_placeholder',
        role: 'paciente',
        isVerified: true,
      });

      // Create 10K medical records (simulate production scale)
      const medicalRecords = Array.from({ length: 10000 }, (_, i) => ({
        patient: patientUser._id,
        diagnosis: `Condition ${i}`,
        treatment: `Treatment ${i}`,
        notes: `Clinical notes for record ${i}`,
        createdAt: new Date(),
        isDeleted: false,
      }));
      await MedicalRecord.insertMany(medicalRecords, { ordered: false });

      // Measure export bundle build
      let bundleTimings = [];
      for (let i = 0; i < 5; i++) {
        const duration = await new Promise((resolve) => {
          const start = performance.now();
          buildArcoExportBundle({
            subjectUserId: patientUser._id.toString(),
            requestedFields: ['diagnosis', 'treatment', 'notes', 'createdAt'],
          }).then(() => {
            const elapsed = performance.now() - start;
            resolve(elapsed);
          });
        });
        bundleTimings.push(duration);
        recordArcoMetric({
          operation: 'export_bundle_build',
          requestType: 'ACCESS',
          outcome: 'success',
          durationMs: duration,
        });
      }

      const percentiles = calculatePercentiles(bundleTimings);
      performanceResults.exportBuild = percentiles;

      console.log('\n📊 Export Bundle Build Performance (10K records, 5 iterations):');
      console.log(`  Min: ${percentiles.min.toFixed(2)}ms`);
      console.log(`  P50: ${percentiles.p50.toFixed(2)}ms`);
      console.log(`  P95: ${percentiles.p95.toFixed(2)}ms`);
      console.log(`  P99: ${percentiles.p99.toFixed(2)}ms`);
      console.log(`  Max: ${percentiles.max.toFixed(2)}ms`);
      console.log(`  Avg: ${percentiles.avg.toFixed(2)}ms`);

      // Assertions: P95 should be under 2000ms for 10K records
      expect(percentiles.p95).toBeLessThan(2000);
      expect(percentiles.avg).toBeLessThan(1500);
    });
  });

  // ===== BENCHMARK 2: Rectification Batch Updates =====
  describe('Rectification Batch Updates', () => {
    it('should apply rectifications to 5K records efficiently', async () => {
      // Create a patient with psychological records
      const patientUser = await User.create({
        name: 'Rectify Patient',
        email: 'rectify.patient@test.com',
        password: 'hash_placeholder',
        role: 'paciente',
        isVerified: true,
      });

      // Create 5K psychological patient records
      const psychRecords = Array.from({ length: 5000 }, (_, i) => ({
        patient: patientUser._id,
        psychologist: new mongoose.Types.ObjectId(),
        diagnosis: `Psych condition ${i}`,
        notes: `Initial notes ${i}`,
        createdAt: new Date(),
        isDeleted: false,
      }));
      await PsychologicalPatient.insertMany(psychRecords, { ordered: false });

      // Measure rectification with batch updates
      let rectTimings = [];
      for (let i = 0; i < 3; i++) {
        const duration = await new Promise((resolve) => {
          const start = performance.now();
          executeArcoRectification({
            subjectUserId: patientUser._id.toString(),
            requestedChanges: {
              psychologicalPatient: {
                notes: `Rectified notes ${i}`,
              },
            },
            actor: 'admin@test.com',
            requestId: new mongoose.Types.ObjectId().toString(),
          }).then(() => {
            const elapsed = performance.now() - start;
            resolve(elapsed);
          });
        });
        rectTimings.push(duration);
        recordArcoMetric({
          operation: 'rectification_batch_apply',
          requestType: 'RECTIFICATION',
          outcome: 'success',
          durationMs: duration,
        });
      }

      const percentiles = calculatePercentiles(rectTimings);
      performanceResults.rectificationBatch = percentiles;

      console.log('\n📊 Rectification Batch Update Performance (5K records, 3 iterations):');
      console.log(`  Min: ${percentiles.min.toFixed(2)}ms`);
      console.log(`  P50: ${percentiles.p50.toFixed(2)}ms`);
      console.log(`  P95: ${percentiles.p95.toFixed(2)}ms`);
      console.log(`  P99: ${percentiles.p99.toFixed(2)}ms`);
      console.log(`  Max: ${percentiles.max.toFixed(2)}ms`);
      console.log(`  Avg: ${percentiles.avg.toFixed(2)}ms`);

      // Assertions: P95 should be under 3000ms for 5K batch updates
      expect(percentiles.p95).toBeLessThan(3000);
      expect(percentiles.avg).toBeLessThan(2000);
    });
  });

  // ===== BENCHMARK 3: Soft-Delete Filtering Performance =====
  describe('Soft-Delete Filtering Performance', () => {
    it('should filter soft-deleted records efficiently with large dataset', async () => {
      const doctorUser = await Doctor.create({
        name: 'Dr. Benchmark Filter',
        email: 'dr.benchmark@test.com',
        password: 'hash_placeholder',
        role: 'doctor',
        specialty: 'Cardiology',
        isVerified: true,
      });

      // Create 20K medical records with mixed deleted/active
      const records = Array.from({ length: 20000 }, (_, i) => ({
        patient: new mongoose.Types.ObjectId(),
        doctor: doctorUser._id,
        diagnosis: `Condition ${i}`,
        isDeleted: i % 3 === 0, // 1/3 deleted
        createdAt: new Date(),
      }));
      await MedicalRecord.insertMany(records, { ordered: false });

      // Measure filtering (active records only)
      let filterTimings = [];
      for (let i = 0; i < 5; i++) {
        const duration = await new Promise((resolve) => {
          const start = performance.now();
          MedicalRecord.find({ doctor: doctorUser._id, isDeleted: false })
            .lean()
            .exec()
            .then(() => {
              const elapsed = performance.now() - start;
              resolve(elapsed);
            });
        });
        filterTimings.push(duration);
        recordArcoMetric({
          operation: 'soft_delete_filter_query',
          requestType: 'QUERY',
          outcome: 'success',
          durationMs: duration,
        });
      }

      const percentiles = calculatePercentiles(filterTimings);
      performanceResults.softDeleteFilter = percentiles;

      console.log('\n📊 Soft-Delete Filtering Performance (20K records, 5 queries):');
      console.log(`  Min: ${percentiles.min.toFixed(2)}ms`);
      console.log(`  P50: ${percentiles.p50.toFixed(2)}ms`);
      console.log(`  P95: ${percentiles.p95.toFixed(2)}ms`);
      console.log(`  P99: ${percentiles.p99.toFixed(2)}ms`);
      console.log(`  Max: ${percentiles.max.toFixed(2)}ms`);
      console.log(`  Avg: ${percentiles.avg.toFixed(2)}ms`);

      // Assertions: P95 should be under 500ms for 20K records
      expect(percentiles.p95).toBeLessThan(500);
      expect(percentiles.avg).toBeLessThan(300);
    });
  });

  // ===== BENCHMARK 4: Metrics Snapshot Generation =====
  describe('Metrics Snapshot Performance', () => {
    it('should generate metrics snapshot rapidly', async () => {
      // Record 1000 metric operations
      for (let i = 0; i < 1000; i++) {
        recordArcoMetric({
          operation: 'test_operation',
          requestType: i % 4 === 0 ? 'ACCESS' : i % 4 === 1 ? 'RECTIFICATION' : i % 4 === 2 ? 'CANCELLATION' : 'OPPOSITION',
          outcome: i % 20 === 0 ? 'failure' : 'success',
          durationMs: Math.random() * 500,
        });
      }

      // Measure snapshot generation
      let snapshotTimings = [];
      for (let i = 0; i < 10; i++) {
        const duration = await new Promise((resolve) => {
          const start = performance.now();
          const snapshot = getArcoMetricsSnapshot();
          const elapsed = performance.now() - start;
          resolve(elapsed);
        });
        snapshotTimings.push(duration);
      }

      const percentiles = calculatePercentiles(snapshotTimings);
      performanceResults.metricsSnapshot = percentiles;

      console.log('\n📊 Metrics Snapshot Generation Performance (1000 operations, 10 snapshots):');
      console.log(`  Min: ${percentiles.min.toFixed(2)}ms`);
      console.log(`  P50: ${percentiles.p50.toFixed(2)}ms`);
      console.log(`  P95: ${percentiles.p95.toFixed(2)}ms`);
      console.log(`  P99: ${percentiles.p99.toFixed(2)}ms`);
      console.log(`  Max: ${percentiles.max.toFixed(2)}ms`);
      console.log(`  Avg: ${percentiles.avg.toFixed(2)}ms`);

      // Assertions: Snapshots should be instant (< 10ms)
      expect(percentiles.p95).toBeLessThan(10);
      expect(percentiles.avg).toBeLessThan(5);
    });
  });

  // ===== BENCHMARK 5: Overall ARCO Workflow End-to-End =====
  describe('Overall ARCO Workflow Performance', () => {
    it('should complete full ARCO workflow within SLA', async () => {
      const patient = await User.create({
        name: 'E2E Performance',
        email: 'e2e.perf@test.com',
        password: 'hash_placeholder',
        role: 'paciente',
        isVerified: true,
      });

      // Create 10K mixed clinical records
      const records = Array.from({ length: 10000 }, (_, i) => ({
        patient: patient._id,
        diagnosis: `Condition ${i}`,
        treatment: `Treatment ${i}`,
        createdAt: new Date(),
        isDeleted: false,
      }));
      await MedicalRecord.insertMany(records, { ordered: false });

      // Measure full workflow: export + rectification + metrics
      let workflowTimings = [];
      for (let i = 0; i < 3; i++) {
        const duration = await new Promise((resolve) => {
          const start = performance.now();
          Promise.all([
            buildArcoExportBundle({ subjectUserId: patient._id.toString(), requestedFields: ['diagnosis', 'treatment'] }),
            executeArcoRectification({
              subjectUserId: patient._id.toString(),
              requestedChanges: { medicalRecord: { treatment: `Updated ${i}` } },
              actor: 'admin@test.com',
              requestId: new mongoose.Types.ObjectId().toString(),
            }),
            getArcoMetricsSnapshot(),
          ]).then(() => {
            const elapsed = performance.now() - start;
            resolve(elapsed);
          });
        });
        workflowTimings.push(duration);
        recordArcoMetric({
          operation: 'e2e_workflow',
          requestType: 'COMBINED',
          outcome: 'success',
          durationMs: duration,
        });
      }

      const percentiles = calculatePercentiles(workflowTimings);

      console.log('\n📊 End-to-End ARCO Workflow Performance (10K records, 3 iterations):');
      console.log(`  Min: ${percentiles.min.toFixed(2)}ms`);
      console.log(`  P50: ${percentiles.p50.toFixed(2)}ms`);
      console.log(`  P95: ${percentiles.p95.toFixed(2)}ms`);
      console.log(`  P99: ${percentiles.p99.toFixed(2)}ms`);
      console.log(`  Max: ${percentiles.max.toFixed(2)}ms`);
      console.log(`  Avg: ${percentiles.avg.toFixed(2)}ms`);

      // Assertion: Full workflow should complete in < 5s
      expect(percentiles.p95).toBeLessThan(5000);
    });
  });

  // ===== SUMMARY REPORT =====
  it('should generate performance summary', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ARCO PERFORMANCE BENCHMARK SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✅ Export Bundle Building:');
    console.log(`   P95 Latency: ${performanceResults.exportBuild.p95?.toFixed(2) || 'N/A'}ms (target: <2000ms)`);
    console.log('\n✅ Rectification Batch Updates:');
    console.log(`   P95 Latency: ${performanceResults.rectificationBatch.p95?.toFixed(2) || 'N/A'}ms (target: <3000ms)`);
    console.log('\n✅ Soft-Delete Filtering:');
    console.log(`   P95 Latency: ${performanceResults.softDeleteFilter.p95?.toFixed(2) || 'N/A'}ms (target: <500ms)`);
    console.log('\n✅ Metrics Snapshot:');
    console.log(`   P95 Latency: ${performanceResults.metricsSnapshot.p95?.toFixed(2) || 'N/A'}ms (target: <10ms)`);
    console.log('\n' + '='.repeat(60));

    // All benchmarks should pass their SLA targets
    expect(performanceResults.exportBuild.p95).toBeLessThan(2000);
    expect(performanceResults.rectificationBatch.p95).toBeLessThan(3000);
    expect(performanceResults.softDeleteFilter.p95).toBeLessThan(500);
    expect(performanceResults.metricsSnapshot.p95).toBeLessThan(10);
  });
});
