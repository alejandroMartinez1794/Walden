/**
 * 📊 CLINICAL METRICS SERVICE
 * 
 * Service for collecting and exposing clinical metrics
 * including business KPIs and operational metrics
 */

import logger from '../utils/logger.js';
import { clinicalMetrics } from './ClinicalMetrics.js';

class ClinicalMetricsService {
  constructor() {
    this.metrics = {
      // Business metrics
      appointmentsScheduled: 0,
      assessmentsCompleted: 0,
      alertsDelivered: 0,
      crisisInterventions: 0,
      
      // Clinical metrics
      phq9HighRiskCount: 0,
      gad7HighRiskCount: 0,
      clinicalFlowAbandonment: 0,
      
      // Operational metrics
      requestCounts: {},
      responseTimes: [],
      errorRates: {},
      
      // Users
      activePatients: new Set(),
      activeDoctors: new Set(),
      
      // Timestamp
      lastUpdated: new Date()
    };
    
    // Histograms for latency tracking
    this.latencyHistograms = {
      p50: [],
      p90: [],
      p95: [],
      p99: []
    };
    
    // Start periodic metrics collection
    this.startCollection();
  }

  /**
   * Start periodic metrics collection
   */
  startCollection() {
    // Collect metrics every minute
    setInterval(() => {
      this.updateTimestamp();
      this.cleanupInactiveUsers();
    }, 60000);
  }

  /**
   * Update timestamp
   */
  updateTimestamp() {
    this.metrics.lastUpdated = new Date();
  }

  /**
   * Cleanup inactive users
   */
  cleanupInactiveUsers() {
    // In a real implementation, this would remove users who haven't been active
    // for a certain period
  }

  /**
   * Increment appointment scheduled counter
   */
  incrementAppointmentScheduled() {
    this.metrics.appointmentsScheduled++;
    clinicalMetrics.incrementSuccess('appointment_scheduled');
  }

  /**
   * Increment assessment completed counter
   */
  incrementAssessmentCompleted() {
    this.metrics.assessmentsCompleted++;
    clinicalMetrics.incrementSuccess('assessment_completed');
  }

  /**
   * Increment alert delivered counter
   */
  incrementAlertDelivered(alertType) {
    this.metrics.alertsDelivered++;
    clinicalMetrics.incrementSuccess(`alert_delivered_${alertType}`);
  }

  /**
   * Increment crisis intervention counter
   */
  incrementCrisisIntervention() {
    this.metrics.crisisInterventions++;
    clinicalMetrics.incrementSuccess('crisis_intervention');
  }

  /**
   * Increment PHQ-9 high risk counter
   */
  incrementPhq9HighRisk() {
    this.metrics.phq9HighRiskCount++;
    clinicalMetrics.incrementSuccess('phq9_high_risk');
  }

  /**
   * Increment GAD-7 high risk counter
   */
  incrementGad7HighRisk() {
    this.metrics.gad7HighRiskCount++;
    clinicalMetrics.incrementSuccess('gad7_high_risk');
  }

  /**
   * Increment clinical flow abandonment counter
   */
  incrementClinicalFlowAbandonment(flowType) {
    this.metrics.clinicalFlowAbandonment++;
    clinicalMetrics.incrementFailure(`abandoned_${flowType}`);
  }

  /**
   * Record request count for a specific endpoint
   */
  recordRequest(endpoint) {
    if (!this.metrics.requestCounts[endpoint]) {
      this.metrics.requestCounts[endpoint] = 0;
    }
    this.metrics.requestCounts[endpoint]++;
    
    clinicalMetrics.incrementSuccess(`request_${endpoint}`);
  }

  /**
   * Record response time
   */
  recordResponseTime(durationMs) {
    this.metrics.responseTimes.push({
      duration: durationMs,
      timestamp: new Date()
    });
    
    // Maintain histogram buckets
    if (durationMs <= 100) {
      this.latencyHistograms.p50.push(durationMs);
    } else if (durationMs <= 500) {
      this.latencyHistograms.p90.push(durationMs);
    } else if (durationMs <= 1000) {
      this.latencyHistograms.p95.push(durationMs);
    } else {
      this.latencyHistograms.p99.push(durationMs);
    }
    
    // Keep only last 1000 measurements
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
    }
    
    // Keep histogram buckets manageable
    ['p50', 'p90', 'p95', 'p99'].forEach(bucket => {
      if (this.latencyHistograms[bucket].length > 1000) {
        this.latencyHistograms[bucket] = this.latencyHistograms[bucket].slice(-1000);
      }
    });
  }

  /**
   * Record error for an endpoint
   */
  recordError(endpoint) {
    if (!this.metrics.errorRates[endpoint]) {
      this.metrics.errorRates[endpoint] = 0;
    }
    this.metrics.errorRates[endpoint]++;
    
    clinicalMetrics.incrementFailure(`error_${endpoint}`);
  }

  /**
   * Add active patient
   */
  addActivePatient(patientId) {
    this.metrics.activePatients.add(patientId);
  }

  /**
   * Add active doctor
   */
  addActiveDoctor(doctorId) {
    this.metrics.activeDoctors.add(doctorId);
  }

  /**
   * Get current metrics snapshot
   */
  getMetricsSnapshot() {
    // Calculate derived metrics
    const activePatientCount = this.metrics.activePatients.size;
    const activeDoctorCount = this.metrics.activeDoctors.size;
    
    // Calculate average response time
    const totalResponseTime = this.metrics.responseTimes.reduce((sum, rt) => sum + rt.duration, 0);
    const avgResponseTime = this.metrics.responseTimes.length > 0 
      ? totalResponseTime / this.metrics.responseTimes.length 
      : 0;
    
    // Calculate P95 latency
    const p95Latencies = [...this.latencyHistograms.p95].sort((a, b) => a - b);
    const p95Latency = p95Latencies.length > 0 
      ? p95Latencies[Math.floor(p95Latencies.length * 0.95)] 
      : 0;
    
    // Calculate error rate
    const totalRequests = Object.values(this.metrics.requestCounts).reduce((sum, count) => sum + count, 0);
    const totalErrors = Object.values(this.metrics.errorRates).reduce((sum, count) => sum + count, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    return {
      business: {
        appointmentsScheduled: this.metrics.appointmentsScheduled,
        assessmentsCompleted: this.metrics.assessmentsCompleted,
        alertsDelivered: this.metrics.alertsDelivered,
        crisisInterventions: this.metrics.crisisInterventions
      },
      clinical: {
        phq9HighRiskCount: this.metrics.phq9HighRiskCount,
        gad7HighRiskCount: this.metrics.gad7HighRiskCount,
        clinicalFlowAbandonment: this.metrics.clinicalFlowAbandonment
      },
      operational: {
        activePatientCount,
        activeDoctorCount,
        totalRequests,
        totalErrors,
        errorRate: parseFloat(errorRate.toFixed(2)),
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        p95Latency: parseFloat(p95Latency.toFixed(2))
      },
      timestamps: {
        lastUpdated: this.metrics.lastUpdated
      }
    };
  }
}

// Export singleton instance
export const clinicalMetricsService = new ClinicalMetricsService();

export default clinicalMetricsService;