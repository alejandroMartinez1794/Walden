/**
 * 🔍 DEPLOYMENT VERIFICATION SCRIPT
 * 
 * Validates deployment by checking critical endpoints and functionality
 * Implements automated rollback if verification fails
 */

import axios from 'axios';
import { execSync } from 'child_process';
import logger from '../utils/logger.js';

// Configuration
const CONFIG = {
  // Target URL for verification
  TARGET_URL: process.env.DEPLOY_TARGET_URL || 'http://localhost:8000',
  
  // Timeout for requests (in ms)
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Critical endpoints to verify
  CRITICAL_ENDPOINTS: [
    { 
      name: 'health-live', 
      url: '/health/live', 
      method: 'GET',
      expectedStatus: 200 
    },
    { 
      name: 'health-ready', 
      url: '/health/ready', 
      method: 'GET',
      expectedStatus: 200 
    },
    { 
      name: 'internal-metrics', 
      url: '/internal/metrics', 
      method: 'GET',
      expectedStatus: 200,
      requiresAuth: true
    },
    { 
      name: 'api-health', 
      url: '/api/v1/health', 
      method: 'GET',
      expectedStatus: 200 
    }
  ],
  
  // Clinical functionality to verify
  CLINICAL_CHECKS: [
    {
      name: 'crypto-functional',
      description: 'Verify encryption/decryption works',
      test: async () => {
        const { encrypt, decrypt } = await import('../utils/clinicalCrypto.js');
        const testString = 'health-check-test';
        const encrypted = encrypt(testString);
        const decrypted = decrypt(encrypted);
        return decrypted === testString;
      }
    }
  ],
  
  // Verification timeout (in ms)
  VERIFICATION_TIMEOUT: 60000, // 1 minute
  
  // Rollback command
  ROLLBACK_COMMAND: process.env.ROLLBACK_COMMAND || 'echo "Rollback command not configured"'
};

class DeploymentVerifier {
  constructor() {
    this.results = {
      endpoints: {},
      clinicalChecks: {},
      overallStatus: 'pending',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Run verification checks
   */
  async runVerification() {
    logger.info('Starting deployment verification', {
      targetUrl: CONFIG.TARGET_URL,
      timestamp: this.results.timestamp
    });

    try {
      // Verify critical endpoints
      await this.verifyEndpoints();
      
      // Run clinical checks
      await this.runClinicalChecks();
      
      // Determine overall status
      this.results.overallStatus = this.calculateOverallStatus();
      
      logger.info('Deployment verification completed', {
        overallStatus: this.results.overallStatus,
        endpointResults: this.summarizeEndpointResults(),
        clinicalCheckResults: this.summarizeClinicalCheckResults()
      });
      
      return this.results;
    } catch (error) {
      logger.error('Deployment verification failed', { error: error.message });
      this.results.overallStatus = 'failed';
      return this.results;
    }
  }

  /**
   * Verify critical endpoints
   */
  async verifyEndpoints() {
    for (const endpoint of CONFIG.CRITICAL_ENDPOINTS) {
      try {
        logger.info('Verifying endpoint', { endpoint: endpoint.name, url: endpoint.url });
        
        // Prepare request config
        const requestConfig = {
          method: endpoint.method,
          url: `${CONFIG.TARGET_URL}${endpoint.url}`,
          timeout: CONFIG.REQUEST_TIMEOUT,
          headers: {
            'User-Agent': 'Deployment-Verification-Bot/1.0'
          }
        };
        
        // Add auth header if required
        if (endpoint.requiresAuth) {
          // For internal endpoints, we might need a special token
          // In a real implementation, this would come from a secure source
          requestConfig.headers.Authorization = `Bearer ${process.env.INTERNAL_API_TOKEN || 'fake-token'}`;
        }
        
        // Make request
        const response = await axios(requestConfig);
        
        // Check if status matches expectation
        const isSuccessful = response.status === endpoint.expectedStatus;
        
        this.results.endpoints[endpoint.name] = {
          status: isSuccessful ? 'passed' : 'failed',
          expectedStatus: endpoint.expectedStatus,
          actualStatus: response.status,
          responseTime: response.headers['x-response-time'] || 'N/A',
          timestamp: new Date().toISOString()
        };
        
        logger.info('Endpoint verification result', {
          endpoint: endpoint.name,
          result: this.results.endpoints[endpoint.name].status,
          status: response.status
        });
      } catch (error) {
        this.results.endpoints[endpoint.name] = {
          status: 'failed',
          expectedStatus: endpoint.expectedStatus,
          actualStatus: error.response?.status || 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        logger.error('Endpoint verification failed', {
          endpoint: endpoint.name,
          error: error.message,
          status: error.response?.status
        });
      }
    }
  }

  /**
   * Run clinical functionality checks
   */
  async runClinicalChecks() {
    for (const check of CONFIG.CLINICAL_CHECKS) {
      try {
        logger.info('Running clinical check', { check: check.name });
        
        const result = await check.test();
        
        this.results.clinicalChecks[check.name] = {
          status: result ? 'passed' : 'failed',
          description: check.description,
          timestamp: new Date().toISOString()
        };
        
        logger.info('Clinical check result', {
          check: check.name,
          result: this.results.clinicalChecks[check.name].status
        });
      } catch (error) {
        this.results.clinicalChecks[check.name] = {
          status: 'failed',
          description: check.description,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        logger.error('Clinical check failed', {
          check: check.name,
          error: error.message
        });
      }
    }
  }

  /**
   * Calculate overall verification status
   */
  calculateOverallStatus() {
    const endpointResults = Object.values(this.results.endpoints);
    const clinicalResults = Object.values(this.results.clinicalChecks);
    
    const allPassed = endpointResults.every(r => r.status === 'passed') && 
                     clinicalResults.every(r => r.status === 'passed');
    
    return allPassed ? 'passed' : 'failed';
  }

  /**
   * Summarize endpoint results
   */
  summarizeEndpointResults() {
    const passed = Object.values(this.results.endpoints).filter(r => r.status === 'passed').length;
    const total = Object.keys(this.results.endpoints).length;
    return `${passed}/${total} endpoints passed`;
  }

  /**
   * Summarize clinical check results
   */
  summarizeClinicalCheckResults() {
    const passed = Object.values(this.results.clinicalChecks).filter(r => r.status === 'passed').length;
    const total = Object.keys(this.results.clinicalChecks).length;
    return `${passed}/${total} clinical checks passed`;
  }

  /**
   * Execute rollback if verification failed
   */
  async executeRollback() {
    if (this.results.overallStatus === 'passed') {
      logger.info('Verification passed, no rollback needed');
      return { rollbackExecuted: false, reason: 'Verification passed' };
    }

    logger.warn('Verification failed, initiating rollback', {
      rollbackCommand: CONFIG.ROLLBACK_COMMAND
    });

    try {
      // Execute rollback command
      const rollbackOutput = execSync(CONFIG.ROLLBACK_COMMAND, { encoding: 'utf-8' });
      
      logger.info('Rollback executed successfully', {
        output: rollbackOutput
      });
      
      return {
        rollbackExecuted: true,
        reason: 'Verification failed',
        output: rollbackOutput
      };
    } catch (error) {
      logger.error('Rollback failed', {
        error: error.message,
        command: CONFIG.ROLLBACK_COMMAND
      });
      
      return {
        rollbackExecuted: false,
        reason: 'Rollback execution failed',
        error: error.message
      };
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const verifier = new DeploymentVerifier();
  
  try {
    // Run verification
    const results = await verifier.runVerification();
    
    // Check if rollback is needed
    if (results.overallStatus === 'failed') {
      logger.error('Deployment verification failed, initiating rollback');
      await verifier.executeRollback();
      process.exit(1); // Exit with error code to signal CI/CD pipeline
    } else {
      logger.info('Deployment verification passed');
      process.exit(0); // Exit successfully
    }
  } catch (error) {
    logger.error('Deployment verification script failed', { error: error.message });
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(error => {
    console.error('Unhandled error in deployment verification:', error);
    process.exit(1);
  });
}

export default DeploymentVerifier;