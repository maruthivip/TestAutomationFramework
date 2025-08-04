import { FullConfig } from '@playwright/test';
import { cosmosDbClient } from './src/utils/CosmosDbClient';
import { AuthHelper } from './src/fixtures/auth.fixtures';

async function globalTeardown(config: FullConfig) {
  console.log('[Global Teardown] Starting cleanup...');

  try {
    // Clean up test data from database
    if (process.env.ENABLE_DATABASE_TESTS === 'true') {
      console.log('[Global Teardown] Cleaning up test data...');
      await cosmosDbClient.cleanupTestData();
      cosmosDbClient.dispose();
    }

    // Clear authentication states
    console.log('[Global Teardown] Clearing authentication states...');
    await AuthHelper.clearAllAuthStates();

    // Clean up temporary files (optional)
    if (process.env.CLEANUP_TEMP_FILES === 'true') {
      const fs = require('fs');
      const path = require('path');
      
      const tempDirs = ['screenshots', 'logs'];
      tempDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach((file: string) => {
            if (file.startsWith('temp_')) {
              fs.unlinkSync(path.join(dir, file));
            }
          });
        }
      });
      console.log('[Global Teardown] Cleaned up temporary files');
    }

    console.log('[Global Teardown] Cleanup completed successfully');
  } catch (error) {
    console.error('[Global Teardown] Cleanup failed:', error);
    // Don't throw error to avoid failing the test run
  }
}

export default globalTeardown;