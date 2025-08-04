import { Page } from '@playwright/test';
import { AccessibilityViolation, AccessibilityNode } from '@/types/healthcare.types';

export interface AccessibilityTestOptions {
  includeTags?: string[];
  excludeTags?: string[];
  rules?: Record<string, any>;
  runOnly?: string[];
  reporter?: 'v1' | 'v2' | 'raw';
}

export class AccessibilityTestingUtils {
  private page: Page;
  private violations: AccessibilityViolation[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Inject axe-core accessibility testing library
   */
  async injectAxe(): Promise<void> {
    try {
      await this.page.addScriptTag({
        url: 'https://unpkg.com/axe-core@4.8.2/axe.min.js'
      });
      console.log('[A11y] Axe-core injected successfully');
    } catch (error) {
      console.error('[A11y] Failed to inject axe-core:', error);
      throw error;
    }
  }

  /**
   * Run accessibility tests on the current page
   */
  async runAccessibilityTests(options: AccessibilityTestOptions = {}): Promise<AccessibilityViolation[]> {
    try {
      await this.injectAxe();

      const axeOptions = {
        tags: options.includeTags || ['wcag2a', 'wcag2aa', 'wcag21aa'],
        exclude: options.excludeTags || [],
        rules: options.rules || {},
        runOnly: options.runOnly || undefined,
        reporter: options.reporter || 'v2'
      };

      const results = await this.page.evaluate((opts) => {
        return new Promise((resolve, reject) => {
          // @ts-ignore - axe is injected globally
          window.axe.run(document, opts, (err: any, results: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      }, axeOptions);

      this.violations = this.parseAxeResults(results as any);
      return this.violations;
    } catch (error) {
      console.error('[A11y] Accessibility test failed:', error);
      throw error;
    }
  }

  /**
   * Parse axe-core results into our format
   */
  private parseAxeResults(results: any): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    if (results.violations) {
      for (const violation of results.violations) {
        const nodes: AccessibilityNode[] = violation.nodes.map((node: any) => ({
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary || ''
        }));

        violations.push({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: nodes
        });
      }
    }

    return violations;
  }

  /**
   * Test specific accessibility requirements for healthcare applications
   */
  async testHealthcareAccessibility(): Promise<AccessibilityViolation[]> {
    const healthcareRules = {
      // Focus management for screen readers
      'focus-order-semantics': { enabled: true },
      'tabindex': { enabled: true },
      'focus-trap': { enabled: true },
      
      // Color contrast for medical information
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true },
      
      // Form accessibility for patient data entry
      'label': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'required-attr': { enabled: true },
      'aria-required-attr': { enabled: true },
      
      // Navigation for complex healthcare workflows
      'landmark-one-main': { enabled: true },
      'landmark-complementary-is-top-level': { enabled: true },
      'page-has-heading-one': { enabled: true },
      
      // Data table accessibility for medical records
      'table-fake-caption': { enabled: true },
      'td-headers-attr': { enabled: true },
      'th-has-data-cells': { enabled: true },
      
      // Image accessibility for medical images/charts
      'image-alt': { enabled: true },
      'image-redundant-alt': { enabled: true },
      
      // ARIA for complex healthcare UI components
      'aria-valid-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'aria-roles': { enabled: true }
    };

    return await this.runAccessibilityTests({
      includeTags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'section508'],
      rules: healthcareRules
    });
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Test tab navigation
      const focusableElements = await this.page.locator(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();

      if (focusableElements.length === 0) {
        issues.push('No focusable elements found on the page');
        return issues;
      }

      // Test tab order
      await this.page.keyboard.press('Tab');
      let previousElement = await this.page.locator(':focus').first();
      
      for (let i = 1; i < Math.min(focusableElements.length, 10); i++) {
        await this.page.keyboard.press('Tab');
        const currentElement = await this.page.locator(':focus').first();
        
        if (await currentElement.count() === 0) {
          issues.push(`Focus lost after ${i} tab presses`);
          break;
        }
        
        // Check if focus is visible
        const focusVisible = await currentElement.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return styles.outline !== 'none' || styles.boxShadow.includes('inset') || 
                 el.matches(':focus-visible');
        });
        
        if (!focusVisible) {
          issues.push(`Focus not visible on element: ${await currentElement.getAttribute('tagName')}`);
        }
        
        previousElement = currentElement;
      }

      // Test escape key functionality
      await this.page.keyboard.press('Escape');
      
      // Test enter key on buttons
      const buttons = await this.page.locator('button').all();
      for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
        await button.focus();
        // Note: We don't actually press Enter to avoid side effects
        const isButton = await button.evaluate((el) => el.tagName === 'BUTTON');
        if (!isButton) {
          issues.push('Non-button element styled as button may not be keyboard accessible');
        }
      }

    } catch (error) {
      issues.push(`Keyboard navigation test failed: ${error}`);
    }

    return issues;
  }

  /**
   * Test screen reader compatibility
   */
  async testScreenReaderCompatibility(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Check for proper heading structure
      const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
      let previousLevel = 0;
      
      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName);
        const currentLevel = parseInt(tagName.charAt(1));
        
        if (currentLevel > previousLevel + 1) {
          issues.push(`Heading level skipped: ${tagName} after H${previousLevel}`);
        }
        
        const text = await heading.textContent();
        if (!text || text.trim().length === 0) {
          issues.push(`Empty heading found: ${tagName}`);
        }
        
        previousLevel = currentLevel;
      }

      // Check for alt text on images
      const images = await this.page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        if (alt === null) {
          issues.push(`Image missing alt attribute: ${src}`);
        } else if (alt === '' && !await img.evaluate((el) => el.hasAttribute('role'))) {
          // Empty alt is okay for decorative images, but should have role="presentation"
          issues.push(`Decorative image should have role="presentation": ${src}`);
        }
      }

      // Check for form labels
      const inputs = await this.page.locator('input, select, textarea').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = await this.page.locator(`label[for="${id}"]`).count();
          if (label === 0 && !ariaLabel && !ariaLabelledBy) {
            issues.push(`Input field missing label: ${id}`);
          }
        } else if (!ariaLabel && !ariaLabelledBy) {
          issues.push('Input field without id or aria-label');
        }
      }

      // Check for ARIA landmarks
      const main = await this.page.locator('main, [role="main"]').count();
      if (main === 0) {
        issues.push('Page missing main landmark');
      }

      const nav = await this.page.locator('nav, [role="navigation"]').count();
      if (nav === 0) {
        issues.push('Page missing navigation landmark');
      }

    } catch (error) {
      issues.push(`Screen reader compatibility test failed: ${error}`);
    }

    return issues;
  }

  /**
   * Test color contrast
   */
  async testColorContrast(): Promise<string[]> {
    const issues: string[] = [];

    try {
      const results = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const contrastIssues: string[] = [];

        elements.forEach((element) => {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Skip elements with no text content
          if (!element.textContent?.trim()) return;
          
          // This is a simplified check - in practice, you'd use a proper contrast calculation
          if (color === backgroundColor) {
            contrastIssues.push(`Element with same text and background color: ${element.tagName}`);
          }
          
          // Check for very light text on light backgrounds (simplified)
          if (color.includes('rgb(255') && backgroundColor.includes('rgb(255')) {
            contrastIssues.push(`Potentially low contrast: ${element.tagName}`);
          }
        });

        return contrastIssues;
      });

      issues.push(...results);
    } catch (error) {
      issues.push(`Color contrast test failed: ${error}`);
    }

    return issues;
  }

  /**
   * Test healthcare-specific accessibility requirements
   */
  async testHealthcareSpecificRequirements(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Test for medical form accessibility
      const medicalForms = await this.page.locator('form').all();
      for (const form of medicalForms) {
        // Check for fieldsets in complex forms
        const inputs = await form.locator('input, select, textarea').count();
        const fieldsets = await form.locator('fieldset').count();
        
        if (inputs > 5 && fieldsets === 0) {
          issues.push('Complex medical form should use fieldsets for grouping');
        }

        // Check for required field indicators
        const requiredFields = await form.locator('[required], [aria-required="true"]').all();
        for (const field of requiredFields) {
          const label = await field.evaluate((el) => {
            const id = el.getAttribute('id');
            if (id) {
              const labelEl = document.querySelector(`label[for="${id}"]`);
              return labelEl?.textContent || '';
            }
            return el.getAttribute('aria-label') || '';
          });
          
          if (label && !label.includes('*') && !label.toLowerCase().includes('required')) {
            issues.push('Required field not clearly marked in label');
          }
        }
      }

      // Test for data table accessibility (medical records, test results)
      const tables = await this.page.locator('table').all();
      for (const table of tables) {
        const caption = await table.locator('caption').count();
        const headers = await table.locator('th').count();
        
        if (caption === 0) {
          issues.push('Data table missing caption for context');
        }
        
        if (headers === 0) {
          issues.push('Data table missing header cells');
        }
      }

      // Test for error message accessibility
      const errorMessages = await this.page.locator('[role="alert"], .error, .alert-danger').all();
      for (const error of errorMessages) {
        const ariaLive = await error.getAttribute('aria-live');
        if (!ariaLive) {
          issues.push('Error message should have aria-live attribute');
        }
      }

      // Test for progress indicators (for multi-step processes)
      const progressBars = await this.page.locator('[role="progressbar"], progress').all();
      for (const progress of progressBars) {
        const ariaValueNow = await progress.getAttribute('aria-valuenow');
        const ariaValueMax = await progress.getAttribute('aria-valuemax');
        
        if (!ariaValueNow || !ariaValueMax) {
          issues.push('Progress indicator missing aria-valuenow or aria-valuemax');
        }
      }

    } catch (error) {
      issues.push(`Healthcare accessibility test failed: ${error}`);
    }

    return issues;
  }

  /**
   * Generate comprehensive accessibility report
   */
  async generateAccessibilityReport(): Promise<any> {
    const violations = await this.testHealthcareAccessibility();
    const keyboardIssues = await this.testKeyboardNavigation();
    const screenReaderIssues = await this.testScreenReaderCompatibility();
    const contrastIssues = await this.testColorContrast();
    const healthcareIssues = await this.testHealthcareSpecificRequirements();

    const report = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      summary: {
        totalViolations: violations.length,
        keyboardIssues: keyboardIssues.length,
        screenReaderIssues: screenReaderIssues.length,
        contrastIssues: contrastIssues.length,
        healthcareSpecificIssues: healthcareIssues.length,
        overallScore: this.calculateAccessibilityScore(violations, keyboardIssues, screenReaderIssues, contrastIssues, healthcareIssues)
      },
      violations: {
        axeViolations: violations,
        keyboardNavigation: keyboardIssues,
        screenReaderCompatibility: screenReaderIssues,
        colorContrast: contrastIssues,
        healthcareSpecific: healthcareIssues
      },
      recommendations: this.generateRecommendations(violations, keyboardIssues, screenReaderIssues, contrastIssues, healthcareIssues)
    };

    return report;
  }

  /**
   * Calculate accessibility score (0-100)
   */
  private calculateAccessibilityScore(
    violations: AccessibilityViolation[],
    keyboardIssues: string[],
    screenReaderIssues: string[],
    contrastIssues: string[],
    healthcareIssues: string[]
  ): number {
    const totalIssues = violations.length + keyboardIssues.length + screenReaderIssues.length + 
                       contrastIssues.length + healthcareIssues.length;
    
    // Weight critical issues more heavily
    const criticalIssues = violations.filter(v => v.impact === 'critical').length;
    const weightedIssues = totalIssues + (criticalIssues * 2);
    
    // Calculate score (max deduction of 100 points for 20+ weighted issues)
    const score = Math.max(0, 100 - (weightedIssues * 5));
    return Math.round(score);
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(
    violations: AccessibilityViolation[],
    keyboardIssues: string[],
    screenReaderIssues: string[],
    contrastIssues: string[],
    healthcareIssues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length > 0) {
      recommendations.push('Address axe-core violations, prioritizing critical and serious issues');
    }

    if (keyboardIssues.length > 0) {
      recommendations.push('Improve keyboard navigation and focus management');
    }

    if (screenReaderIssues.length > 0) {
      recommendations.push('Enhance screen reader compatibility with proper ARIA labels and landmarks');
    }

    if (contrastIssues.length > 0) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards');
    }

    if (healthcareIssues.length > 0) {
      recommendations.push('Address healthcare-specific accessibility requirements for medical forms and data');
    }

    // Add general healthcare accessibility recommendations
    recommendations.push('Ensure all medical information is accessible to users with disabilities');
    recommendations.push('Test with actual assistive technologies used by patients');
    recommendations.push('Consider cognitive accessibility for complex medical workflows');

    return recommendations;
  }

  /**
   * Get violations by impact level
   */
  getViolationsByImpact(impact: 'minor' | 'moderate' | 'serious' | 'critical'): AccessibilityViolation[] {
    return this.violations.filter(v => v.impact === impact);
  }

  /**
   * Clear all violations
   */
  clearViolations(): void {
    this.violations = [];
  }
}

// Helper function to create accessibility testing utils
export function createAccessibilityTestingUtils(page: Page): AccessibilityTestingUtils {
  return new AccessibilityTestingUtils(page);
}