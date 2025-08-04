import { chromium, FullConfig } from '@playwright/test';
import { testDataManager } from './src/data/TestDataManager';
import { cosmosDbClient } from './src/utils/CosmosDbClient';

async function globalSetup(config: FullConfig) {
  console.log('[Global Setup] Starting test environment setup...');

  try {
    // Initialize test data
    console.log('[Global Setup] Loading test data...');
    await testDataManager.loadTestData();

    // Initialize database connections (if enabled)
    if (process.env.ENABLE_DATABASE_TESTS === 'true') {
      console.log('[Global Setup] Initializing database connections...');
      await cosmosDbClient.initialize();
      
      // Test database connectivity
      const isConnected = await cosmosDbClient.testConnection();
      if (!isConnected) {
        console.warn('[Global Setup] Database connection test failed - database tests may be skipped');
      }
    }

    // Create auth storage directory
    const fs = require('fs');
    const authStorageDir = 'auth-storage';
    if (!fs.existsSync(authStorageDir)) {
      fs.mkdirSync(authStorageDir, { recursive: true });
      console.log('[Global Setup] Created auth storage directory');
    }

    // Create test results directories
    const directories = ['test-results', 'allure-results', 'screenshots', 'logs'];
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[Global Setup] Created ${dir} directory`);
      }
    });

    console.log('[Global Setup] Environment setup completed successfully');
  } catch (error) {
    console.error('[Global Setup] Setup failed:', error);
    throw error;
  }
}

export default globalSetup;