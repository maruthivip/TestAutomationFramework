import { Page, Route, Request } from '@playwright/test';

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
  delay?: number;
}

export interface MockRule {
  url: string | RegExp;
  method?: string;
  response: MockResponse;
  times?: number;
  condition?: (request: Request) => boolean;
}

export class NetworkMockingUtils {
  private page: Page;
  private mockRules: Map<string, MockRule> = new Map();
  private requestCounts: Map<string, number> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Add a mock rule for network requests
   */
  async addMockRule(id: string, rule: MockRule): Promise<void> {
    this.mockRules.set(id, rule);
    this.requestCounts.set(id, 0);

    await this.page.route(rule.url, async (route: Route, request: Request) => {
      const currentCount = this.requestCounts.get(id) || 0;
      
      // Check if we've exceeded the allowed times
      if (rule.times && currentCount >= rule.times) {
        await route.continue();
        return;
      }

      // Check method if specified
      if (rule.method && request.method() !== rule.method.toUpperCase()) {
        await route.continue();
        return;
      }

      // Check custom condition if provided
      if (rule.condition && !rule.condition(request)) {
        await route.continue();
        return;
      }

      // Increment request count
      this.requestCounts.set(id, currentCount + 1);

      // Add delay if specified
      if (rule.response.delay) {
        await new Promise(resolve => setTimeout(resolve, rule.response.delay));
      }

      // Fulfill the request with mock response
      await route.fulfill({
        status: rule.response.status || 200,
        headers: rule.response.headers || {},
        body: typeof rule.response.body === 'string' 
          ? rule.response.body 
          : JSON.stringify(rule.response.body)
      });

      console.log(`[Network Mock] Intercepted ${request.method()} ${request.url()}`);
    });
  }

  /**
   * Remove a mock rule
   */
  async removeMockRule(id: string): Promise<void> {
    const rule = this.mockRules.get(id);
    if (rule) {
      await this.page.unroute(rule.url);
      this.mockRules.delete(id);
      this.requestCounts.delete(id);
      console.log(`[Network Mock] Removed mock rule: ${id}`);
    }
  }

  /**
   * Clear all mock rules
   */
  async clearAllMockRules(): Promise<void> {
    for (const [id] of this.mockRules) {
      await this.removeMockRule(id);
    }
    console.log('[Network Mock] Cleared all mock rules');
  }

  /**
   * Healthcare-specific mock methods
   */

  /**
   * Mock member eligibility API
   */
  async mockEligibilityAPI(memberId: string, isEligible: boolean = true): Promise<void> {
    await this.addMockRule('eligibility', {
      url: /\/api\/eligibility\/verify/,
      method: 'POST',
      response: {
        status: 200,
        body: {
          success: true,
          data: {
            memberId: memberId,
            isEligible: isEligible,
            effectiveDate: '2024-01-01',
            terminationDate: isEligible ? '2024-12-31' : '2024-01-01',
            benefits: isEligible ? [
              {
                serviceType: 'Medical',
                coverage: '80%',
                deductible: 1000,
                copay: 25,
                coinsurance: 20,
                outOfPocketMax: 5000,
                remainingDeductible: 500,
                remainingOutOfPocket: 2500
              }
            ] : [],
            limitations: [],
            exclusions: []
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock claims submission API
   */
  async mockClaimsAPI(claimId: string, status: 'approved' | 'denied' | 'pending' = 'approved'): Promise<void> {
    await this.addMockRule('claims', {
      url: /\/api\/claims/,
      method: 'POST',
      response: {
        status: 200,
        body: {
          success: true,
          data: {
            claimId: claimId,
            status: status,
            submissionDate: new Date().toISOString(),
            processedDate: status !== 'pending' ? new Date().toISOString() : null,
            amount: {
              billed: 150.00,
              allowed: 120.00,
              paid: status === 'approved' ? 95.00 : 0.00,
              memberResponsibility: status === 'approved' ? 25.00 : 0.00
            },
            reasonCodes: status === 'denied' ? ['INVALID_DIAGNOSIS'] : []
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock payment processing API
   */
  async mockPaymentAPI(paymentId: string, success: boolean = true): Promise<void> {
    await this.addMockRule('payment', {
      url: /\/api\/payments/,
      method: 'POST',
      response: {
        status: success ? 200 : 400,
        body: success ? {
          success: true,
          data: {
            paymentId: paymentId,
            status: 'completed',
            amount: 250.00,
            paymentMethod: 'credit_card',
            transactionId: `txn_${Date.now()}`,
            processedDate: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        } : {
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: 'Payment processing failed',
            details: {
              reason: 'Insufficient funds'
            }
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock authentication API
   */
  async mockAuthAPI(success: boolean = true, role: string = 'member'): Promise<void> {
    await this.addMockRule('auth', {
      url: /\/api\/auth\/login/,
      method: 'POST',
      response: {
        status: success ? 200 : 401,
        body: success ? {
          success: true,
          data: {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            tokenType: 'Bearer',
            expiresIn: 3600,
            user: {
              id: 'user_123',
              username: `test.${role}@uhc.com`,
              role: role,
              firstName: 'Test',
              lastName: 'User',
              permissions: ['view_dashboard']
            }
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        } : {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock provider search API
   */
  async mockProviderSearchAPI(providers: any[] = []): Promise<void> {
    const defaultProviders = providers.length > 0 ? providers : [
      {
        providerId: 'PRV_001',
        npi: '1234567890',
        name: 'Dr. John Smith',
        specialty: 'Primary Care',
        address: {
          street1: '123 Medical Center Dr',
          city: 'Healthcare City',
          state: 'HC',
          zipCode: '12345'
        },
        phone: '555-0001',
        isInNetwork: true,
        acceptingNewPatients: true,
        distance: 2.5
      }
    ];

    await this.addMockRule('provider-search', {
      url: /\/api\/providers\/search/,
      method: 'GET',
      response: {
        status: 200,
        body: {
          success: true,
          data: {
            providers: defaultProviders,
            totalCount: defaultProviders.length,
            page: 1,
            pageSize: 10
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock plan information API
   */
  async mockPlanInfoAPI(plans: any[] = []): Promise<void> {
    const defaultPlans = plans.length > 0 ? plans : [
      {
        planId: 'PLAN_001',
        planName: 'UHC Basic Plan',
        planType: 'HMO',
        premiums: {
          individual: 250.00,
          family: 750.00
        },
        deductibles: {
          individual: 1000.00,
          family: 2000.00
        },
        copays: {
          primaryCare: 25.00,
          specialist: 50.00,
          urgentCare: 75.00,
          emergencyRoom: 200.00
        },
        outOfPocketMax: 5000.00,
        isActive: true
      }
    ];

    await this.addMockRule('plan-info', {
      url: /\/api\/plans/,
      method: 'GET',
      response: {
        status: 200,
        body: {
          success: true,
          data: {
            plans: defaultPlans,
            totalCount: defaultPlans.length
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock error responses for testing error handling
   */
  async mockAPIError(apiPath: string, errorCode: number = 500, errorMessage: string = 'Internal Server Error'): Promise<void> {
    await this.addMockRule(`error-${apiPath}`, {
      url: new RegExp(apiPath),
      response: {
        status: errorCode,
        body: {
          success: false,
          error: {
            code: errorCode.toString(),
            message: errorMessage
          },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        }
      }
    });
  }

  /**
   * Mock slow API responses for performance testing
   */
  async mockSlowAPI(apiPath: string, delay: number = 5000): Promise<void> {
    await this.addMockRule(`slow-${apiPath}`, {
      url: new RegExp(apiPath),
      response: {
        status: 200,
        body: {
          success: true,
          data: { message: 'Slow response' },
          timestamp: new Date().toISOString(),
          requestId: `req_${Date.now()}`
        },
        delay: delay
      }
    });
  }

  /**
   * Intercept and log all network requests
   */
  async enableRequestLogging(): Promise<void> {
    await this.page.route('**/*', async (route: Route, request: Request) => {
      console.log(`[Network] ${request.method()} ${request.url()}`);
      
      // Log request headers and body for API calls
      if (request.url().includes('/api/')) {
        console.log(`[Network] Headers:`, request.headers());
        
        if (request.method() !== 'GET') {
          try {
            const postData = request.postData();
            if (postData) {
              console.log(`[Network] Body:`, postData);
            }
          } catch (error) {
            // Ignore errors when getting post data
          }
        }
      }
      
      await route.continue();
    });
  }

  /**
   * Disable request logging
   */
  async disableRequestLogging(): Promise<void> {
    await this.page.unroute('**/*');
  }

  /**
   * Get request count for a mock rule
   */
  getRequestCount(id: string): number {
    return this.requestCounts.get(id) || 0;
  }

  /**
   * Wait for a specific number of requests to a mocked endpoint
   */
  async waitForRequests(id: string, expectedCount: number, timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const currentCount = this.getRequestCount(id);
      if (currentCount >= expectedCount) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Timeout waiting for ${expectedCount} requests to ${id}. Got ${this.getRequestCount(id)}`);
  }

  /**
   * Mock SOAP API responses
   */
  async mockSOAPAPI(endpoint: string, soapAction: string, response: string): Promise<void> {
    await this.addMockRule(`soap-${soapAction}`, {
      url: new RegExp(endpoint),
      method: 'POST',
      condition: (request) => {
        const soapActionHeader = request.headers()['soapaction'];
        return soapActionHeader === soapAction;
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8'
        },
        body: response
      }
    });
  }

  /**
   * Mock file upload responses
   */
  async mockFileUpload(uploadPath: string, success: boolean = true): Promise<void> {
    await this.addMockRule('file-upload', {
      url: new RegExp(uploadPath),
      method: 'POST',
      response: {
        status: success ? 200 : 400,
        body: success ? {
          success: true,
          data: {
            fileId: `file_${Date.now()}`,
            fileName: 'test-document.pdf',
            fileSize: 1024,
            uploadDate: new Date().toISOString()
          }
        } : {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: 'File upload failed'
          }
        }
      }
    });
  }
}

// Helper function to create network mocking utils
export function createNetworkMockingUtils(page: Page): NetworkMockingUtils {
  return new NetworkMockingUtils(page);
}