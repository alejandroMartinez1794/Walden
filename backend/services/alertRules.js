/**
 * 🚨 CLINICAL ALERT RULES SERVICE
 * 
 * Rules engine for clinical threshold-based monitoring and alerts
 */

import logger from '../utils/logger.js';
import { clinicalMetricsService } from './ClinicalMetricsService.js';

class AlertRulesService {
  constructor() {
    this.rules = [];
    this.activeAlerts = new Map();
    this.thresholds = {
      // Clinical metrics thresholds
      phq9HighRiskThreshold: 20,  // PHQ-9 score indicating high risk
      gad7HighRiskThreshold: 15,  // GAD-7 score indicating high risk
      clinicalFlowAbandonmentThreshold: 5, // Max abandonment rate %
      
      // Operational thresholds
      responseTimeP95Threshold: 2000, // 2 seconds
      errorRateThreshold: 5, // 5% error rate
      availabilityThreshold: 95, // 95% availability
      
      // Alert delivery thresholds
      alertDeliveryFailureThreshold: 3, // Max failures before escalation
      alertLatencyThreshold: 5000, // 5 seconds to deliver alert
    };
    
    this.severityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    
    this.initDefaultRules();
    this.startMonitoring();
  }

  /**
   * Initialize default clinical alert rules
   */
  initDefaultRules() {
    // Rule: High PHQ-9 scores
    this.addRule({
      id: 'high-phq9-score',
      name: 'High PHQ-9 Score Detected',
      description: 'When PHQ-9 score exceeds threshold',
      condition: (metrics) => metrics.clinical.phq9HighRiskCount > 0,
      severity: 'high',
      action: 'escalate_to_clinical_supervisor',
      frequency: 'immediate'
    });

    // Rule: High GAD-7 scores
    this.addRule({
      id: 'high-gad7-score',
      name: 'High GAD-7 Score Detected',
      description: 'When GAD-7 score exceeds threshold',
      condition: (metrics) => metrics.clinical.gad7HighRiskCount > 0,
      severity: 'high',
      action: 'escalate_to_clinical_supervisor',
      frequency: 'immediate'
    });

    // Rule: High clinical flow abandonment
    this.addRule({
      id: 'high-abandonment-rate',
      name: 'High Clinical Flow Abandonment',
      description: 'When clinical flow abandonment rate exceeds threshold',
      condition: (metrics) => {
        const totalAssessments = metrics.business.assessmentsCompleted;
        const abandoned = metrics.clinical.clinicalFlowAbandonment;
        return totalAssessments > 0 && (abandoned / totalAssessments) * 100 > this.thresholds.clinicalFlowAbandonmentThreshold;
      },
      severity: 'medium',
      action: 'notify_operations_team',
      frequency: 'hourly'
    });

    // Rule: High response time P95
    this.addRule({
      id: 'high-response-time',
      name: 'High Response Time P95',
      description: 'When 95th percentile response time exceeds threshold',
      condition: (metrics) => metrics.operational.p95Latency > this.thresholds.responseTimeP95Threshold,
      severity: 'medium',
      action: 'notify_devops_team',
      frequency: 'immediate'
    });

    // Rule: High error rate
    this.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'When error rate exceeds threshold',
      condition: (metrics) => metrics.operational.errorRate > this.thresholds.errorRateThreshold,
      severity: 'high',
      action: 'notify_devops_team',
      frequency: 'immediate'
    });

    // Rule: Low availability
    this.addRule({
      id: 'low-availability',
      name: 'Low Availability',
      description: 'When availability falls below threshold',
      condition: (metrics) => {
        // This would be calculated based on uptime data
        // For now, we'll use a placeholder
        return false;
      },
      severity: 'critical',
      action: 'page_on_call_engineer',
      frequency: 'immediate'
    });

    // Rule: Alert delivery failure
    this.addRule({
      id: 'alert-delivery-failure',
      name: 'Alert Delivery Failure',
      description: 'When alert delivery fails repeatedly',
      condition: (metrics) => {
        // This would check for failed alert deliveries
        // For now, we'll use a placeholder
        return false;
      },
      severity: 'high',
      action: 'notify_clinical_admin',
      frequency: 'immediate'
    });
  }

  /**
   * Add a new alert rule
   */
  addRule(rule) {
    this.rules.push(rule);
    logger.info(`Added alert rule: ${rule.name}`, { ruleId: rule.id });
  }

  /**
   * Evaluate all rules against current metrics
   */
  evaluateRules(metrics) {
    const triggeredAlerts = [];

    for (const rule of this.rules) {
      try {
        if (rule.condition(metrics)) {
          const alertId = `${rule.id}-${Date.now()}`;
          
          // Check if we've already triggered this alert recently
          if (this.shouldTriggerAlert(rule, alertId)) {
            const alert = {
              id: alertId,
              ruleId: rule.id,
              name: rule.name,
              description: rule.description,
              severity: rule.severity,
              timestamp: new Date().toISOString(),
              metrics
            };
            
            triggeredAlerts.push(alert);
            this.recordAlert(alert);
            
            logger.warn(`Alert triggered: ${rule.name}`, {
              alertId: alert.id,
              severity: rule.severity,
              ruleId: rule.id
            });
          }
        }
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.id}`, { error: error.message });
      }
    }

    return triggeredAlerts;
  }

  /**
   * Check if an alert should be triggered (considering frequency)
   */
  shouldTriggerAlert(rule, alertId) {
    if (!this.activeAlerts.has(rule.id)) {
      this.activeAlerts.set(rule.id, []);
    }

    const ruleAlerts = this.activeAlerts.get(rule.id);
    
    // Remove alerts older than 1 hour for frequency control
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentAlerts = ruleAlerts.filter(alert => alert.timestamp > oneHourAgo);
    
    // Check frequency constraint
    if (rule.frequency === 'immediate') {
      return true; // Always trigger immediate alerts
    } else if (rule.frequency === 'hourly' && recentAlerts.length === 0) {
      return true;
    }
    
    // Update the active alerts list
    this.activeAlerts.set(rule.id, recentAlerts);
    
    return false;
  }

  /**
   * Record an alert in metrics
   */
  recordAlert(alert) {
    clinicalMetricsService.recordError(`alert_${alert.ruleId}`);
    
    // Log the alert with traceability
    logger.error(`CLINICAL ALERT: ${alert.name}`, {
      alertId: alert.id,
      ruleId: alert.ruleId,
      severity: alert.severity,
      timestamp: alert.timestamp,
      traceId: alert.metrics.traceId || 'unknown'
    });
  }

  /**
   * Start periodic monitoring
   */
  startMonitoring() {
    // Evaluate rules every minute
    setInterval(() => {
      try {
        const metrics = clinicalMetricsService.getMetricsSnapshot();
        metrics.traceId = `monitor-${Date.now()}`; // Add trace ID for monitoring
        
        const triggeredAlerts = this.evaluateRules(metrics);
        
        if (triggeredAlerts.length > 0) {
          logger.info(`Triggered ${triggeredAlerts.length} alerts`, {
            alertCount: triggeredAlerts.length,
            traceId: metrics.traceId
          });
        }
      } catch (error) {
        logger.error('Error in alert rules evaluation', { error: error.message });
      }
    }, 60000); // Every minute
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    const active = [];
    for (const [ruleId, alerts] of this.activeAlerts) {
      active.push(...alerts);
    }
    return active;
  }

  /**
   * Get all rules
   */
  getRules() {
    return this.rules;
  }

  /**
   * Update a threshold value
   */
  updateThreshold(thresholdName, newValue) {
    if (this.thresholds.hasOwnProperty(thresholdName)) {
      const oldValue = this.thresholds[thresholdName];
      this.thresholds[thresholdName] = newValue;
      
      logger.info(`Threshold updated: ${thresholdName}`, {
        oldValue,
        newValue
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Get current thresholds
   */
  getThresholds() {
    return { ...this.thresholds };
  }
}

// Export singleton instance
export const alertRulesService = new AlertRulesService();

export default alertRulesService;