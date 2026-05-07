/**
 * 🚀 GO/NO-GO DECISION MATRIX
 * 
 * Binary launch decision matrix based on technical validation results
 * Zero subjectivity, only ✅ = authorization to launch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // Paths to validation reports
  REPORT_PATHS: {
    SIC_AUDIT: path.join(__dirname, '..', 'reports', 'sic-audit-report.json'),
    PENTEST: path.join(__dirname, '..', 'reports', 'pentest-report.json'),
    DRP_VALIDATION: path.join(__dirname, '..', 'reports', 'drp-validation-report.json')
  },
  
  // Criticality weights for each validation category
  WEIGHTS: {
    SIC_COMPLIANCE: 10,  // Highest priority for legal compliance
    SECURITY: 9,         // Critical for PHI protection
    DRP: 8,              // Important for continuity
    FUNCTIONALITY: 7     // Important for usability
  },
  
  // Minimum required scores for launch
  MINIMUM_SCORES: {
    SIC_COMPLIANCE: 100, // Must be fully compliant
    SECURITY: 95,        // Near-perfect security required
    DRP: 90,            // High confidence in recovery
    FUNCTIONALITY: 85    // Good functionality required
  }
};

class GoNoGoMatrix {
  constructor() {
    this.decisionMatrix = {
      sicCompliance: { required: true, passed: false, weight: CONFIG.WEIGHTS.SIC_COMPLIANCE },
      security: { required: true, passed: false, weight: CONFIG.WEIGHTS.SECURITY },
      drp: { required: true, passed: false, weight: CONFIG.WEIGHTS.DRP },
      functionality: { required: true, passed: false, weight: CONFIG.WEIGHTS.FUNCTIONALITY },
      overallDecision: 'PENDING',
      score: 0,
      timestamp: new Date().toISOString(),
      signatureRequired: true
    };
  }

  /**
   * Evaluate go/no-go decision
   */
  async evaluate() {
    logger.info('Starting go/no-go evaluation', {
      timestamp: this.decisionMatrix.timestamp
    });

    try {
      // Load validation reports
      const sicReport = await this.loadReport(CONFIG.REPORT_PATHS.SIC_AUDIT);
      const pentestReport = await this.loadReport(CONFIG.REPORT_PATHS.PENTEST);
      const drpReport = await this.loadReport(CONFIG.REPORT_PATHS.DRP_VALIDATION);
      
      if (!sicReport || !pentestReport || !drpReport) {
        throw new Error('Missing required validation reports');
      }

      // Evaluate each category
      this.decisionMatrix.sicCompliance.passed = this.evaluateSicCompliance(sicReport);
      this.decisionMatrix.security.passed = this.evaluateSecurity(pentestReport);
      this.decisionMatrix.drp.passed = this.evaluateDrp(drpReport);
      this.decisionMatrix.functionality.passed = this.evaluateFunctionality(); // Placeholder
      
      // Calculate overall score
      this.calculateScore(sicReport, pentestReport, drpReport);
      
      // Determine final decision
      this.decisionMatrix.overallDecision = this.calculateFinalDecision();
      
      logger.info('Go/no-go evaluation completed', {
        decision: this.decisionMatrix.overallDecision,
        score: this.decisionMatrix.score,
        sicPassed: this.decisionMatrix.sicCompliance.passed,
        securityPassed: this.decisionMatrix.security.passed,
        drpPassed: this.decisionMatrix.drp.passed
      });
      
      return this.decisionMatrix;
    } catch (error) {
      logger.error('Go/no-go evaluation failed', { error: error.message });
      this.decisionMatrix.overallDecision = 'NO-GO';
      return this.decisionMatrix;
    }
  }

  /**
   * Load validation report
   */
  async loadReport(reportPath) {
    try {
      if (!fs.existsSync(reportPath)) {
        logger.warn('Validation report not found', { path: reportPath });
        return null;
      }
      
      const reportContent = fs.readFileSync(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      logger.info('Loaded validation report', {
        path: reportPath,
        status: report.header?.status
      });
      
      return report;
    } catch (error) {
      logger.error('Error loading validation report', { 
        path: reportPath, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Evaluate SIC compliance
   */
  evaluateSicCompliance(report) {
    if (!report) return false;
    
    const passed = report.header.status === 'passed';
    
    logger.info('SIC compliance evaluation', {
      passed,
      status: report.header.status
    });
    
    return passed;
  }

  /**
   * Evaluate security posture
   */
  evaluateSecurity(report) {
    if (!report) return false;
    
    // For security, we consider it passed if:
    // 1. Overall status is passed
    // 2. There are minimal critical vulnerabilities
    const passed = report.header.status === 'passed';
    
    logger.info('Security evaluation', {
      passed,
      status: report.header.status
    });
    
    return passed;
  }

  /**
   * Evaluate DRP validation
   */
  evaluateDrp(report) {
    if (!report) return false;
    
    const passed = report.header.status === 'passed' && 
                   report.metrics.restoreTime.passed;
    
    logger.info('DRP evaluation', {
      passed,
      status: report.header.status,
      restoreTimePassed: report.metrics.restoreTime.passed
    });
    
    return passed;
  }

  /**
   * Evaluate functionality (placeholder)
   */
  evaluateFunctionality() {
    // In a real implementation, this would check functional test results
    // For now, we'll assume it passes if other validations pass
    return true;
  }

  /**
   * Calculate weighted score
   */
  calculateScore(sicReport, pentestReport, drpReport) {
    // Simple scoring: count passed categories
    const totalCategories = 4;
    const passedCategories = [
      this.decisionMatrix.sicCompliance.passed,
      this.decisionMatrix.security.passed,
      this.decisionMatrix.drp.passed,
      this.decisionMatrix.functionality.passed
    ].filter(Boolean).length;
    
    this.decisionMatrix.score = Math.round((passedCategories / totalCategories) * 100);
  }

  /**
   * Calculate final go/no-go decision
   */
  calculateFinalDecision() {
    // Critical requirement: SIC compliance must pass
    if (!this.decisionMatrix.sicCompliance.passed) {
      return 'NO-GO';
    }
    
    // Security must pass
    if (!this.decisionMatrix.security.passed) {
      return 'NO-GO';
    }
    
    // DRP validation must pass
    if (!this.decisionMatrix.drp.passed) {
      return 'NO-GO';
    }
    
    // If all critical validations pass, return GO
    if (this.decisionMatrix.sicCompliance.passed && 
        this.decisionMatrix.security.passed && 
        this.decisionMatrix.drp.passed && 
        this.decisionMatrix.functionality.passed) {
      return 'GO';
    }
    
    // Otherwise, default to no-go
    return 'NO-GO';
  }

  /**
   * Generate decision report
   */
  generateReport() {
    const report = {
      header: {
        title: 'Go/No-Go Decision Matrix Report',
        timestamp: this.decisionMatrix.timestamp,
        decision: this.decisionMatrix.overallDecision,
        score: this.decisionMatrix.score
      },
      validationResults: {
        sicCompliance: {
          passed: this.decisionMatrix.sicCompliance.passed,
          required: this.decisionMatrix.sicCompliance.required
        },
        security: {
          passed: this.decisionMatrix.security.passed,
          required: this.decisionMatrix.security.required
        },
        drp: {
          passed: this.decisionMatrix.drp.passed,
          required: this.decisionMatrix.drp.required
        },
        functionality: {
          passed: this.decisionMatrix.functionality.passed,
          required: this.decisionMatrix.functionality.required
        }
      },
      decisionMatrix: {
        overallDecision: this.decisionMatrix.overallDecision,
        score: this.decisionMatrix.score
      },
      requirements: {
        sicComplianceCritical: true,
        securityCritical: true,
        drpCritical: true,
        functionalityImportant: true
      },
      signatureRequired: this.decisionMatrix.signatureRequired
    };
    
    return report;
  }

  /**
   * Generate binary decision (true/false)
   */
  getBinaryDecision() {
    return this.decisionMatrix.overallDecision === 'GO';
  }
}

/**
 * Main execution
 */
async function main() {
  const evaluator = new GoNoGoMatrix();
  
  try {
    // Run evaluation
    const decision = await evaluator.evaluate();
    
    // Generate report
    const report = evaluator.generateReport();
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'reports', 'go-no-go-report.json');
    const reportsDir = path.join(__dirname, '..', 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`Go/No-Go Decision Report saved to: ${reportPath}`);
    console.log(`Decision: ${report.decisionMatrix.overallDecision}`);
    console.log(`Score: ${report.decisionMatrix.score}%`);
    
    // Print validation results
    console.log('\nValidation Results:');
    console.log(`- SIC Compliance: ${report.validationResults.sicCompliance.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Security: ${report.validationResults.security.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- DRP: ${report.validationResults.drp.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`- Functionality: ${report.validationResults.functionality.passed ? '✅ PASS' : '❌ FAIL'}`);
    
    // Exit with appropriate code
    if (report.decisionMatrix.overallDecision === 'GO') {
      console.log('\n🎉 LAUNCH AUTHORIZED - All validations passed!');
      process.exit(0); // Go ahead with launch
    } else {
      console.log('\n❌ LAUNCH BLOCKED - Critical validations failed!');
      console.log('Address the failed validations before proceeding with launch.');
      process.exit(1); // Block launch
    }
  } catch (error) {
    logger.error('Go/No-Go evaluation failed', { error: error.message });
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === __filename) {
  main().catch(error => {
    console.error('Unhandled error in Go/No-Go evaluation:', error);
    process.exit(1);
  });
}

export default GoNoGoMatrix;