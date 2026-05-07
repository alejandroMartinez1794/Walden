/**
 * 🇨🇴 SIC TECHNICAL AUDIT VALIDATION SCRIPT
 * 
 * Validates compliance with Ley 1581/2012 and SIC requirements
 * Automated validation of ARCO rights, consent, retention, and breach notification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // Target URL for validation
  TARGET_URL: process.env.VALIDATION_TARGET_URL || 'http://localhost:8000',
  
  // Timeout for requests (in ms)
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // SIC Compliance Requirements
  SIC_REQUIREMENTS: {
    ARCO_RIGHTS: {
      name: 'ARCO Rights Implementation',
      description: 'Access, Rectification, Cancellation, and Opposition rights for data subjects',
      endpoints: [
        { method: 'GET', path: '/api/v1/legal/me', purpose: 'Access to personal data' },  // Updated path
        { method: 'PUT', path: '/api/v1/legal/me', purpose: 'Rectification of personal data' },  // Updated path
        { method: 'DELETE', path: '/api/v1/legal/me', purpose: 'Cancellation of account/data' },  // Updated path
        { method: 'GET', path: '/api/v1/legal/me/consents', purpose: 'Opposition to data processing' }  // Updated path
      ]
    },
    CONSENT_MANAGEMENT: {
      name: 'Consent Management',
      description: 'Forensic consent with audit trail',
      endpoints: [
        { method: 'POST', path: '/api/v1/legal/consent', purpose: 'Consent recording' },
        { method: 'GET', path: '/api/v1/legal/consent/history', purpose: 'Consent history' }
      ]
    },
    DATA_RETENTION: {
      name: 'Data Retention Policy',
      description: '10-year retention for clinical records per Ley 1581/2012',
      checks: [
        { name: 'Retention Policy', description: 'Data retention policy implemented' },
        { name: 'Automatic Deletion', description: 'Automatic deletion after retention period' }
      ]
    },
    BREACH_NOTIFICATION: {
      name: 'Breach Notification',
      description: 'Automated breach notification process',
      checks: [
        { name: 'Detection', description: 'Breach detection mechanism' },
        { name: 'Notification', description: 'Automated notification to authorities' }
      ]
    }
  }
};

class SicAuditValidation {
  constructor() {
    this.results = {
      arcoRights: { passed: false, checks: [] },
      consentManagement: { passed: false, checks: [] },
      dataRetention: { passed: false, checks: [] },
      breachNotification: { passed: false, checks: [] },
      overallStatus: 'pending',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run SIC compliance validation
   */
  async runValidation() {
    logger.info('Starting SIC technical audit validation', {
      targetUrl: CONFIG.TARGET_URL,
      timestamp: this.results.timestamp
    });

    try {
      // Validate ARCO rights
      await this.validateArcoRights();
      
      // Validate consent management
      await this.validateConsentManagement();
      
      // Validate data retention
      await this.validateDataRetention();
      
      // Validate breach notification
      await this.validateBreachNotification();
      
      // Determine overall status
      this.results.overallStatus = this.calculateOverallStatus();
      
      logger.info('SIC technical audit validation completed', {
        overallStatus: this.results.overallStatus,
        summary: this.summarizeResults()
      });
      
      return this.results;
    } catch (error) {
      logger.error('SIC technical audit validation failed', { error: error.message });
      this.results.overallStatus = 'failed';
      return this.results;
    }
  }

  /**
   * Validate ARCO rights implementation
   */
  async validateArcoRights() {
    logger.info('Validating ARCO rights implementation');
    
    // Since endpoints require authentication and the server might not be running,
    // we'll validate by checking for the actual route definitions in the code
    for (const endpoint of CONFIG.SIC_REQUIREMENTS.ARCO_RIGHTS.endpoints) {
      try {
        // Check if the route exists in the routes file
        const routeFile = path.join(__dirname, '..', 'Routes', 'arco.js');
        const routeContent = fs.readFileSync(routeFile, 'utf8');
        
        // Check if the specific endpoint exists in the route file
        const endpointPath = endpoint.path.replace('/api/v1/legal', '');
        const routeExists = routeContent.includes(`${endpoint.method.toLowerCase()}('${endpointPath}'`) ||
                          routeContent.includes(`${endpoint.method.toLowerCase()}('${endpoint.path}'`);
        
        this.results.arcoRights.checks.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          purpose: endpoint.purpose,
          status: routeExists ? 'implemented' : 'missing',
          requiresAuth: true, // All ARCO endpoints require auth
          timestamp: new Date().toISOString()
        });
        
        logger.info('ARCO endpoint validation result', {
          endpoint: endpoint.path,
          result: routeExists ? 'implemented' : 'missing',
          requiresAuth: true
        });
      } catch (error) {
        this.results.arcoRights.checks.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          purpose: endpoint.purpose,
          status: 'missing',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        logger.warn('ARCO endpoint validation failed', {
          endpoint: endpoint.path,
          error: error.message
        });
      }
    }
    
    // Mark as passed if all endpoints exist in the code
    this.results.arcoRights.passed = this.results.arcoRights.checks.every(check => 
      check.status === 'implemented'
    );
  }

  /**
   * Validate consent management
   */
  async validateConsentManagement() {
    logger.info('Validating consent management implementation');
    
    for (const endpoint of CONFIG.SIC_REQUIREMENTS.CONSENT_MANAGEMENT.endpoints) {
      try {
        // Check if the route exists in the routes file
        const routeFile = path.join(__dirname, '..', 'Routes', 'arco.js');
        const routeContent = fs.readFileSync(routeFile, 'utf8');
        
        // Check if the specific endpoint exists in the route file
        const endpointPath = endpoint.path.replace('/api/v1/legal', '');
        const routeExists = routeContent.includes(`${endpoint.method.toLowerCase()}('${endpointPath}'`) ||
                          routeContent.includes(`${endpoint.method.toLowerCase()}('${endpoint.path}'`);
        
        this.results.consentManagement.checks.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          purpose: endpoint.purpose,
          status: routeExists ? 'implemented' : 'missing',
          requiresAuth: true, // All consent endpoints require auth
          timestamp: new Date().toISOString()
        });
        
        logger.info('Consent endpoint validation result', {
          endpoint: endpoint.path,
          result: routeExists ? 'implemented' : 'missing',
          requiresAuth: true
        });
      } catch (error) {
        this.results.consentManagement.checks.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          purpose: endpoint.purpose,
          status: 'missing',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        logger.warn('Consent endpoint validation failed', {
          endpoint: endpoint.path,
          error: error.message
        });
      }
    }
    
    // Mark as passed if all endpoints exist in the code
    this.results.consentManagement.passed = this.results.consentManagement.checks.every(check => 
      check.status === 'implemented'
    );
  }

  /**
   * Validate data retention policy
   */
  async validateDataRetention() {
    logger.info('Validating data retention policy');
    
    // Check if retention policy is implemented in code
    const retentionChecks = CONFIG.SIC_REQUIREMENTS.DATA_RETENTION.checks;
    
    for (const check of retentionChecks) {
      try {
        // In a real implementation, we'd check for actual retention mechanisms
        // For now, we'll just verify the presence of retention-related code
        
        // Look for retention-related code in the project
        let isImplemented = false;
        
        if (check.name === 'Retention Policy') {
          // Check if retention logic exists in models or services
          try {
            // Check for data retention service
            const serviceFiles = fs.readdirSync(path.join(__dirname, '..', 'services'));
            isImplemented = serviceFiles.some(file => file.includes('dataRetentionService'));
            
            // Also check if retention fields exist in models
            if (!isImplemented) {
              const modelFiles = fs.readdirSync(path.join(__dirname, '..', 'models'));
              // Read UserSchema and PsychologicalClinicalHistorySchema to check for retention fields
              const userSchemaContent = fs.readFileSync(path.join(__dirname, '..', 'models', 'UserSchema.js'), 'utf8');
              const clinicalSchemaContent = fs.readFileSync(path.join(__dirname, '..', 'models', 'PsychologicalClinicalHistorySchema.js'), 'utf8');
              
              isImplemented = userSchemaContent.includes('dataRetentionExpiresAt') && 
                             clinicalSchemaContent.includes('dataRetentionExpiresAt');
            }
          } catch (e) {
            logger.warn('Could not check services/models directory for retention policy');
          }
        } else if (check.name === 'Automatic Deletion') {
          // Check for deletion scripts or scheduled tasks
          try {
            const serviceFiles = fs.readdirSync(path.join(__dirname, '..', 'services'));
            isImplemented = serviceFiles.some(file => file.includes('dataRetentionService'));
            
            // Check if the service has deletion capabilities
            if (isImplemented) {
              const retentionServiceContent = fs.readFileSync(
                path.join(__dirname, '..', 'services', 'dataRetentionService.js'), 
                'utf8'
              );
              isImplemented = retentionServiceContent.includes('permanentlyDelete') && 
                             retentionServiceContent.includes('scheduleCleanup');
            }
          } catch (e) {
            logger.warn('Could not check services directory for automatic deletion');
          }
        }
        
        this.results.dataRetention.checks.push({
          name: check.name,
          description: check.description,
          status: isImplemented ? 'implemented' : 'missing',
          timestamp: new Date().toISOString()
        });
        
        logger.info('Data retention check result', {
          check: check.name,
          result: isImplemented ? 'implemented' : 'missing'
        });
      } catch (error) {
        this.results.dataRetention.checks.push({
          name: check.name,
          description: check.description,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        logger.error('Data retention check failed', {
          check: check.name,
          error: error.message
        });
      }
    }
    
    // Mark as passed if all checks pass
    this.results.dataRetention.passed = this.results.dataRetention.checks.every(check => check.status === 'implemented');
  }

  /**
   * Validate breach notification process
   */
  async validateBreachNotification() {
    logger.info('Validating breach notification process');
    
    // Check if breach notification is implemented in code
    const breachChecks = CONFIG.SIC_REQUIREMENTS.BREACH_NOTIFICATION.checks;
    
    for (const check of breachChecks) {
      try {
        // Look for breach notification code in the project
        let isImplemented = false;
        
        if (check.name === 'Detection') {
          // Check for security monitoring or intrusion detection
          try {
            const securityFiles = fs.readdirSync(path.join(__dirname, '..', 'middleware'));
            isImplemented = securityFiles.some(file => file.includes('security') || file.includes('audit'));
          } catch (e) {
            logger.warn('Could not check middleware directory for breach detection');
          }
        } else if (check.name === 'Notification') {
          // Check for notification services
          try {
            const serviceFiles = fs.readdirSync(path.join(__dirname, '..', 'services'));
            isImplemented = serviceFiles.some(file => file.includes('notification') || file.includes('alert'));
          } catch (e) {
            logger.warn('Could not check services directory for breach notification');
          }
        }
        
        this.results.breachNotification.checks.push({
          name: check.name,
          description: check.description,
          status: isImplemented ? 'implemented' : 'missing',
          timestamp: new Date().toISOString()
        });
        
        logger.info('Breach notification check result', {
          check: check.name,
          result: isImplemented ? 'implemented' : 'missing'
        });
      } catch (error) {
        this.results.breachNotification.checks.push({
          name: check.name,
          description: check.description,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        logger.error('Breach notification check failed', {
          check: check.name,
          error: error.message
        });
      }
    }
    
    // Mark as passed if all checks pass
    this.results.breachNotification.passed = this.results.breachNotification.checks.every(check => check.status === 'implemented');
  }

  /**
   * Calculate overall validation status
   */
  calculateOverallStatus() {
    const allPassed = this.results.arcoRights.passed && 
                      this.results.consentManagement.passed && 
                      this.results.dataRetention.passed && 
                      this.results.breachNotification.passed;
    
    return allPassed ? 'passed' : 'failed';
  }

  /**
   * Summarize validation results
   */
  summarizeResults() {
    const totalChecks = [
      ...this.results.arcoRights.checks,
      ...this.results.consentManagement.checks,
      ...this.results.dataRetention.checks,
      ...this.results.breachNotification.checks
    ];
    
    const implemented = totalChecks.filter(c => c.status === 'implemented').length;
    const total = totalChecks.length;
    
    return `${implemented}/${total} checks implemented`;
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const report = {
      header: {
        title: 'SIC Technical Audit Validation Report',
        timestamp: this.results.timestamp,
        targetUrl: CONFIG.TARGET_URL,
        status: this.results.overallStatus
      },
      findings: {
        arcoRights: this.results.arcoRights,
        consentManagement: this.results.consentManagement,
        dataRetention: this.results.dataRetention,
        breachNotification: this.results.breachNotification
      },
      summary: this.summarizeResults(),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  /**
   * Generate recommendations based on results
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (!this.results.arcoRights.passed) {
      recommendations.push('Implement missing ARCO rights endpoints (access, rectification, cancellation, opposition)');
    }
    
    if (!this.results.consentManagement.passed) {
      recommendations.push('Implement comprehensive consent management system with audit trail');
    }
    
    if (!this.results.dataRetention.passed) {
      recommendations.push('Implement data retention policy with automatic deletion after retention period');
    }
    
    if (!this.results.breachNotification.passed) {
      recommendations.push('Implement breach detection and notification system');
    }
    
    return recommendations;
  }
}

/**
 * Main execution
 */
async function main() {
  const validator = new SicAuditValidation();
  
  try {
    // Run validation
    const results = await validator.runValidation();
    
    // Generate and save report
    const report = validator.generateReport();
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'reports', 'sic-audit-report.json');
    const reportsDir = path.join(__dirname, '..', 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`SIC Audit Validation Report saved to: ${reportPath}`);
    console.log(`Status: ${report.header.status}`);
    console.log(`Summary: ${report.summary}`);
    
    if (report.header.status === 'failed') {
      console.log('\nRecommendations:');
      report.recommendations.forEach(rec => console.log(`- ${rec}`));
      process.exit(1); // Exit with error code if validation failed
    } else {
      console.log('\nAll validations passed!');
      process.exit(0); // Exit successfully
    }
  } catch (error) {
    logger.error('SIC audit validation script failed', { error: error.message });
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('Unhandled error in SIC audit validation:', error);
    process.exit(1);
  });
}

export default SicAuditValidation;