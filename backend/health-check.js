/**
 * 🏥 DOCKER HEALTH CHECK SCRIPT
 * 
 * Performs quick health checks for Docker container health monitoring
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

async function healthCheck() {
  try {
    // Check if the process is responding
    const response = await axios.get('http://localhost:8000/health/live', {
      timeout: 5000 // 5 seconds timeout
    });
    
    if (response.status === 200) {
      process.exit(0); // Healthy
    } else {
      console.error(`Health check failed with status: ${response.status}`);
      process.exit(1); // Unhealthy
    }
  } catch (error) {
    console.error(`Health check error: ${error.message}`);
    process.exit(1); // Unhealthy
  }
}

// Run health check
healthCheck();