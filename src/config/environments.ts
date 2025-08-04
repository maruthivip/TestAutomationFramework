export interface Environment {
  name: string;
  baseUrl: string;
  apiBaseUrl: string;
  soapBaseUrl: string;
  database: {
    cosmosDb: {
      endpoint: string;
      database: string;
      container: string;
    };
    oracleDb: {
      host: string;
      port: number;
      service: string;
    };
  };
  auth: {
    oauth2: {
      tokenUrl: string;
      clientId: string;
      scope: string;
    };
  };
  features: {
    enableSecurityTests: boolean;
    enableAccessibilityTests: boolean;
    enablePerformanceTests: boolean;
    hipaaComplianceMode: boolean;
  };
  performance: {
    budgetLoadTime: number;
    budgetFCP: number;
    budgetLCP: number;
  };
}

export const environments: Record<string, Environment> = {
  qa: {
    name: 'QA',
    baseUrl: 'https://qa.yourprojecthost',
    apiBaseUrl: 'https://api-qa.yourprojecthost',
    soapBaseUrl: 'https://soap-qa.yourprojecthost',
    database: {
      cosmosDb: {
        endpoint: 'https://testautomation-qa.documents.azure.com:443/',
        database: 'testautomationdb_qa',
        container: 'test_data'
      },
      oracleDb: {
        host: 'oracle-qa.testautomationhost.com',
        port: 1521,
        service: 'TESTAUTOMATION'
      }
    },
    auth: {
      oauth2: {
        tokenUrl: 'https://auth-qa.yourprojecthost/oauth2/token',
        clientId: process.env.OAUTH2_CLIENT_ID || '',
        scope: 'read write'
      }
    },
    features: {
      enableSecurityTests: true,
      enableAccessibilityTests: true,
      enablePerformanceTests: true,
      hipaaComplianceMode: true
    },
    performance: {
      budgetLoadTime: 5000,
      budgetFCP: 2000,
      budgetLCP: 3500
    }
  },
  uat: {
    name: 'UAT',
    baseUrl: 'https://uat.yourprojecthost',
    apiBaseUrl: 'https://api-uat.yourprojecthost',
    soapBaseUrl: 'https://soap-uat.yourprojecthost',
    database: {
      cosmosDb: {
        endpoint: 'https://testautomation-uat.documents.azure.com:443/',
        database: 'testautomationdb_uat',
        container: 'test_data'
      },
      oracleDb: {
        host: 'oracle-uat.testautomationhost.com',
        port: 1521,
        service: 'TESTAUTOMATION'
      }
    },
    auth: {
      oauth2: {
        tokenUrl: 'https://auth-uat.yourprojecthost/oauth2/token',
        clientId: process.env.OAUTH2_CLIENT_ID || '',
        scope: 'read write'
      }
    },
    features: {
      enableSecurityTests: true,
      enableAccessibilityTests: true,
      enablePerformanceTests: true,
      hipaaComplianceMode: true
    },
    performance: {
      budgetLoadTime: 4000,
      budgetFCP: 1800,
      budgetLCP: 3000
    }
  },
  prod: {
    name: 'Production',
    baseUrl: 'https://yourprojecthost',
    apiBaseUrl: 'https://api.yourprojecthost',
    soapBaseUrl: 'https://soap.yourprojecthost',
    database: {
      cosmosDb: {
        endpoint: 'https://testautomation-prod.documents.azure.com:443/',
        database: 'testautomationdb_prod',
        container: 'production_data'
      },
      oracleDb: {
        host: 'oracle-prod.testautomationhost.com',
        port: 1521,
        service: 'TESTAUTOMATION'
      }
    },
    auth: {
      oauth2: {
        tokenUrl: 'https://auth.yourprojecthost/oauth2/token',
        clientId: process.env.OAUTH2_CLIENT_ID || '',
        scope: 'read'
      }
    },
    features: {
      enableSecurityTests: false,
      enableAccessibilityTests: false,
      enablePerformanceTests: true,
      hipaaComplianceMode: true
    },
    performance: {
      budgetLoadTime: 3000,
      budgetFCP: 1500,
      budgetLCP: 2500
    }
  }
};

export function getEnvironment(envName?: string): Environment {
  const env = envName || process.env.TEST_ENV || 'qa';
  const environment = environments[env];
  
  if (!environment) {
    throw new Error(`Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }
  
  return environment;
}

export function getCurrentEnvironment(): Environment {
  return getEnvironment();
}