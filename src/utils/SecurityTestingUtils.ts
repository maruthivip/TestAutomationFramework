import { Page, expect } from '@playwright/test';
import { SecurityTestResult, SecurityVulnerability } from '@/types/healthcare.types';

export class SecurityTestingUtils {
  private page: Page;
  private vulnerabilities: SecurityVulnerability[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Run comprehensive security tests
   */
  async runSecurityTests(): Promise<SecurityTestResult> {
    this.vulnerabilities = [];

    await this.testXSSVulnerabilities();
    await this.testSQLInjection();
    await this.testCSRFProtection();
    await this.testAuthenticationSecurity();
    await this.testSessionManagement();
    await this.testHTTPSEnforcement();
    await this.testSecurityHeaders();
    await this.testInputValidation();
    await this.testHIPAACompliance();
    await this.testDataEncryption();

    return {
      testType: 'comprehensive_security',
      passed: this.vulnerabilities.length === 0,
      vulnerabilities: this.vulnerabilities
    };
  }

  /**
   * Test for XSS vulnerabilities
   */
  async testXSSVulnerabilities(): Promise<void> {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '\'><script>alert("XSS")</script>'
    ];

    for (const payload of xssPayloads) {
      try {
        // Test input fields
        const inputs = await this.page.locator('input[type="text"], input[type="search"], textarea').all();
        
        for (const input of inputs) {
          await input.fill(payload);
          await this.page.keyboard.press('Enter');
          
          // Check if script executed (would indicate XSS vulnerability)
          const alertHandled = await this.checkForAlert();
          if (alertHandled) {
            this.addVulnerability({
              type: 'XSS',
              severity: 'high',
              description: `XSS vulnerability found in input field with payload: ${payload}`,
              recommendation: 'Implement proper input sanitization and output encoding'
            });
          }
        }
      } catch (error) {
        // Continue testing other payloads
      }
    }
  }

  /**
   * Test for SQL injection vulnerabilities
   */
  async testSQLInjection(): Promise<void> {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1 --"
    ];

    for (const payload of sqlPayloads) {
      try {
        // Test login form
        const usernameField = this.page.locator('input[type="text"], input[type="email"]').first();
        const passwordField = this.page.locator('input[type="password"]').first();
        
        if (await usernameField.isVisible() && await passwordField.isVisible()) {
          await usernameField.fill(payload);
          await passwordField.fill('password');
          
          const submitButton = this.page.locator('button[type="submit"], input[type="submit"]').first();
          await submitButton.click();
          
          // Check for SQL error messages
          const errorMessages = await this.page.locator('text=/SQL|database|mysql|oracle|error/i').all();
          if (errorMessages.length > 0) {
            this.addVulnerability({
              type: 'SQL_INJECTION',
              severity: 'critical',
              description: `Potential SQL injection vulnerability with payload: ${payload}`,
              recommendation: 'Use parameterized queries and input validation'
            });
          }
        }
      } catch (error) {
        // Continue testing
      }
    }
  }

  /**
   * Test CSRF protection
   */
  async testCSRFProtection(): Promise<void> {
    try {
      // Check for CSRF tokens in forms
      const forms = await this.page.locator('form').all();
      
      for (const form of forms) {
        const csrfToken = await form.locator('input[name*="csrf"], input[name*="token"]').count();
        const method = await form.getAttribute('method');
        
        if (method && method.toLowerCase() !== 'get' && csrfToken === 0) {
          this.addVulnerability({
            type: 'CSRF',
            severity: 'medium',
            description: 'Form without CSRF protection found',
            recommendation: 'Implement CSRF tokens for all state-changing operations'
          });
        }
      }
    } catch (error) {
      console.error('CSRF test error:', error);
    }
  }

  /**
   * Test authentication security
   */
  async testAuthenticationSecurity(): Promise<void> {
    try {
      // Test password field visibility
      const passwordFields = await this.page.locator('input[type="password"]').all();
      
      for (const field of passwordFields) {
        const type = await field.getAttribute('type');
        if (type !== 'password') {
          this.addVulnerability({
            type: 'AUTHENTICATION',
            severity: 'medium',
            description: 'Password field not properly masked',
            recommendation: 'Ensure password fields use type="password"'
          });
        }
      }

      // Test for autocomplete on sensitive fields
      const sensitiveFields = await this.page.locator('input[type="password"], input[name*="ssn"], input[name*="credit"]').all();
      
      for (const field of sensitiveFields) {
        const autocomplete = await field.getAttribute('autocomplete');
        if (autocomplete !== 'off' && autocomplete !== 'new-password') {
          this.addVulnerability({
            type: 'AUTHENTICATION',
            severity: 'low',
            description: 'Sensitive field allows autocomplete',
            recommendation: 'Set autocomplete="off" for sensitive fields'
          });
        }
      }
    } catch (error) {
      console.error('Authentication security test error:', error);
    }
  }

  /**
   * Test session management
   */
  async testSessionManagement(): Promise<void> {
    try {
      // Check for secure session cookies
      const cookies = await this.page.context().cookies();
      
      for (const cookie of cookies) {
        if (cookie.name.toLowerCase().includes('session') || cookie.name.toLowerCase().includes('auth')) {
          if (!cookie.secure) {
            this.addVulnerability({
              type: 'SESSION_MANAGEMENT',
              severity: 'high',
              description: `Session cookie ${cookie.name} is not secure`,
              recommendation: 'Set Secure flag on session cookies'
            });
          }
          
          if (!cookie.httpOnly) {
            this.addVulnerability({
              type: 'SESSION_MANAGEMENT',
              severity: 'medium',
              description: `Session cookie ${cookie.name} is not HttpOnly`,
              recommendation: 'Set HttpOnly flag on session cookies'
            });
          }
        }
      }
    } catch (error) {
      console.error('Session management test error:', error);
    }
  }

  /**
   * Test HTTPS enforcement
   */
  async testHTTPSEnforcement(): Promise<void> {
    try {
      const currentUrl = this.page.url();
      
      if (!currentUrl.startsWith('https://')) {
        this.addVulnerability({
          type: 'HTTPS',
          severity: 'high',
          description: 'Application not using HTTPS',
          recommendation: 'Enforce HTTPS for all pages, especially those handling sensitive data'
        });
      }

      // Test HTTP to HTTPS redirect
      const httpUrl = currentUrl.replace('https://', 'http://');
      try {
        const response = await this.page.goto(httpUrl);
        if (response && response.status() !== 301 && response.status() !== 302) {
          this.addVulnerability({
            type: 'HTTPS',
            severity: 'medium',
            description: 'HTTP requests not redirected to HTTPS',
            recommendation: 'Implement HTTP to HTTPS redirects'
          });
        }
      } catch (error) {
        // HTTP might be blocked, which is good
      }
    } catch (error) {
      console.error('HTTPS test error:', error);
    }
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders(): Promise<void> {
    try {
      const response = await this.page.goto(this.page.url());
      if (!response) return;

      const headers = response.headers();
      
      // Check for security headers
      const requiredHeaders = {
        'x-frame-options': 'DENY or SAMEORIGIN',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': 'HSTS header',
        'content-security-policy': 'CSP header'
      };

      for (const [header, description] of Object.entries(requiredHeaders)) {
        if (!headers[header]) {
          this.addVulnerability({
            type: 'SECURITY_HEADERS',
            severity: 'medium',
            description: `Missing security header: ${header}`,
            recommendation: `Implement ${description} for better security`
          });
        }
      }
    } catch (error) {
      console.error('Security headers test error:', error);
    }
  }

  /**
   * Test input validation
   */
  async testInputValidation(): Promise<void> {
    try {
      const inputs = await this.page.locator('input, textarea, select').all();
      
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        const maxLength = await input.getAttribute('maxlength');
        const pattern = await input.getAttribute('pattern');
        const required = await input.getAttribute('required');
        
        // Test for missing validation on sensitive fields
        const name = await input.getAttribute('name') || '';
        const id = await input.getAttribute('id') || '';
        
        if ((name.includes('email') || id.includes('email')) && type !== 'email') {
          this.addVulnerability({
            type: 'INPUT_VALIDATION',
            severity: 'low',
            description: 'Email field without proper type validation',
            recommendation: 'Use type="email" for email fields'
          });
        }
        
        if ((name.includes('phone') || id.includes('phone')) && !pattern) {
          this.addVulnerability({
            type: 'INPUT_VALIDATION',
            severity: 'low',
            description: 'Phone field without pattern validation',
            recommendation: 'Add pattern validation for phone numbers'
          });
        }
      }
    } catch (error) {
      console.error('Input validation test error:', error);
    }
  }

  /**
   * Test HIPAA compliance requirements
   */
  async testHIPAACompliance(): Promise<void> {
    try {
      // Check for privacy notices
      const privacyNotice = await this.page.locator('text=/privacy|hipaa/i').count();
      if (privacyNotice === 0) {
        this.addVulnerability({
          type: 'HIPAA_COMPLIANCE',
          severity: 'high',
          description: 'No visible privacy notice or HIPAA information',
          recommendation: 'Display HIPAA privacy notice prominently'
        });
      }

      // Check for data masking in logs/console
      const logs = await this.page.evaluate(() => {
        return console.log.toString();
      });
      
      if (logs.includes('ssn') || logs.includes('social') || logs.includes('dob')) {
        this.addVulnerability({
          type: 'HIPAA_COMPLIANCE',
          severity: 'critical',
          description: 'Potential PHI exposure in client-side logs',
          recommendation: 'Remove or mask PHI from client-side logging'
        });
      }

      // Check for minimum necessary access controls
      const adminLinks = await this.page.locator('a[href*="admin"], button:has-text("admin")').count();
      if (adminLinks > 0) {
        // This would need role-based testing to verify proper access controls
        console.log('[HIPAA] Admin functionality detected - verify role-based access controls');
      }
    } catch (error) {
      console.error('HIPAA compliance test error:', error);
    }
  }

  /**
   * Test data encryption indicators
   */
  async testDataEncryption(): Promise<void> {
    try {
      // Check for TLS version
      const response = await this.page.goto(this.page.url());
      if (response) {
        const securityDetails = await response.securityDetails();
        if (securityDetails) {
          const protocol = securityDetails.protocol();
          if (protocol && protocol < 'TLSv1.2') {
            this.addVulnerability({
              type: 'ENCRYPTION',
              severity: 'high',
              description: `Weak TLS version: ${protocol}`,
              recommendation: 'Use TLS 1.2 or higher'
            });
          }
        }
      }

      // Check for mixed content
      const mixedContentWarnings = await this.page.locator('text=/mixed content|insecure/i').count();
      if (mixedContentWarnings > 0) {
        this.addVulnerability({
          type: 'ENCRYPTION',
          severity: 'medium',
          description: 'Mixed content warnings detected',
          recommendation: 'Ensure all resources are loaded over HTTPS'
        });
      }
    } catch (error) {
      console.error('Data encryption test error:', error);
    }
  }

  /**
   * Test for sensitive data exposure
   */
  async testSensitiveDataExposure(): Promise<void> {
    try {
      const pageContent = await this.page.content();
      
      // Check for exposed sensitive patterns
      const sensitivePatterns = [
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card pattern
        /password\s*[:=]\s*[^\s]+/i, // Password in source
        /api[_-]?key\s*[:=]\s*[^\s]+/i, // API key in source
        /secret\s*[:=]\s*[^\s]+/i // Secret in source
      ];

      for (const pattern of sensitivePatterns) {
        if (pattern.test(pageContent)) {
          this.addVulnerability({
            type: 'DATA_EXPOSURE',
            severity: 'critical',
            description: `Sensitive data pattern found in page source: ${pattern.source}`,
            recommendation: 'Remove sensitive data from client-side code'
          });
        }
      }
    } catch (error) {
      console.error('Sensitive data exposure test error:', error);
    }
  }

  /**
   * Test authentication bypass attempts
   */
  async testAuthenticationBypass(): Promise<void> {
    try {
      // Test direct access to protected pages
      const protectedPaths = [
        '/admin',
        '/dashboard',
        '/profile',
        '/settings',
        '/reports'
      ];

      for (const path of protectedPaths) {
        try {
          const response = await this.page.goto(this.page.url().replace(/\/[^\/]*$/, path));
          
          if (response && response.status() === 200) {
            const currentUrl = this.page.url();
            if (!currentUrl.includes('/login') && !currentUrl.includes('/unauthorized')) {
              this.addVulnerability({
                type: 'AUTHENTICATION_BYPASS',
                severity: 'critical',
                description: `Direct access to protected path: ${path}`,
                recommendation: 'Implement proper authentication checks for protected routes'
              });
            }
          }
        } catch (error) {
          // Expected for protected routes
        }
      }
    } catch (error) {
      console.error('Authentication bypass test error:', error);
    }
  }

  /**
   * Helper method to check for JavaScript alerts
   */
  private async checkForAlert(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 1000);
      
      this.page.once('dialog', async (dialog) => {
        clearTimeout(timeout);
        await dialog.dismiss();
        resolve(true);
      });
    });
  }

  /**
   * Add vulnerability to the list
   */
  private addVulnerability(vulnerability: SecurityVulnerability): void {
    this.vulnerabilities.push(vulnerability);
    console.log(`[Security] ${vulnerability.severity.toUpperCase()}: ${vulnerability.description}`);
  }

  /**
   * Get all found vulnerabilities
   */
  getVulnerabilities(): SecurityVulnerability[] {
    return this.vulnerabilities;
  }

  /**
   * Get vulnerabilities by severity
   */
  getVulnerabilitiesBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): SecurityVulnerability[] {
    return this.vulnerabilities.filter(v => v.severity === severity);
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalVulnerabilities: this.vulnerabilities.length,
      severityBreakdown: {
        critical: this.getVulnerabilitiesBySeverity('critical').length,
        high: this.getVulnerabilitiesBySeverity('high').length,
        medium: this.getVulnerabilitiesBySeverity('medium').length,
        low: this.getVulnerabilitiesBySeverity('low').length
      },
      vulnerabilities: this.vulnerabilities
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Clear all vulnerabilities
   */
  clearVulnerabilities(): void {
    this.vulnerabilities = [];
  }
}

// Helper function to create security testing utils
export function createSecurityTestingUtils(page: Page): SecurityTestingUtils {
  return new SecurityTestingUtils(page);
}