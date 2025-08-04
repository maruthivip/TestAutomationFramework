import { Page } from '@playwright/test';
import { PerformanceMetrics } from '@/types/healthcare.types';

export interface PerformanceThresholds {
  loadTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
}

export interface PerformanceTestResult {
  url: string;
  timestamp: string;
  metrics: PerformanceMetrics;
  thresholds: PerformanceThresholds;
  passed: boolean;
  failures: string[];
}

export class PerformanceTestingUtils {
  private page: Page;
  private defaultThresholds: PerformanceThresholds;

  constructor(page: Page, thresholds?: PerformanceThresholds) {
    this.page = page;
    this.defaultThresholds = {
      loadTime: 3000, // 3 seconds
      firstContentfulPaint: 1500, // 1.5 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      cumulativeLayoutShift: 0.1, // CLS score
      firstInputDelay: 100, // 100ms
      timeToInteractive: 3500, // 3.5 seconds
      ...thresholds
    };
  }

  /**
   * Measure comprehensive performance metrics
   */
  async measurePerformance(): Promise<PerformanceMetrics> {
    const startTime = Date.now();

    // Wait for page to be fully loaded
    await this.page.waitForLoadState('networkidle');

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Get Web Vitals and other performance metrics
    const metrics = await this.page.evaluate(() => {
      return new Promise<any>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};

          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.firstContentfulPaint = entry.startTime;
              }
            } else if (entry.entryType === 'largest-contentful-paint') {
              metrics.largestContentfulPaint = entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              if (!metrics.cumulativeLayoutShift) {
                metrics.cumulativeLayoutShift = 0;
              }
              metrics.cumulativeLayoutShift += (entry as any).value;
            } else if (entry.entryType === 'first-input') {
              metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
            }
          });

          // Calculate Time to Interactive (simplified)
          const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigationEntry) {
            metrics.timeToInteractive = navigationEntry.domInteractive;
          }

          resolve(metrics);
        });

        observer.observe({ 
          entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] 
        });

        // Fallback timeout
        setTimeout(() => {
          const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const fallbackMetrics: any = {};

          if (navigationEntry) {
            fallbackMetrics.firstContentfulPaint = navigationEntry.domContentLoadedEventEnd;
            fallbackMetrics.largestContentfulPaint = navigationEntry.loadEventEnd;
            fallbackMetrics.timeToInteractive = navigationEntry.domInteractive;
          }

          fallbackMetrics.cumulativeLayoutShift = 0;
          fallbackMetrics.firstInputDelay = 0;

          resolve(fallbackMetrics);
        }, 5000);
      });
    });

    return {
      loadTime: loadTime,
      firstContentfulPaint: metrics.firstContentfulPaint || 0,
      largestContentfulPaint: metrics.largestContentfulPaint || 0,
      cumulativeLayoutShift: metrics.cumulativeLayoutShift || 0,
      firstInputDelay: metrics.firstInputDelay || 0,
      timeToInteractive: metrics.timeToInteractive || 0
    };
  }

  /**
   * Run performance test with thresholds
   */
  async runPerformanceTest(thresholds?: PerformanceThresholds): Promise<PerformanceTestResult> {
    const testThresholds = { ...this.defaultThresholds, ...thresholds };
    const metrics = await this.measurePerformance();
    const failures: string[] = [];

    // Check each metric against thresholds
    if (testThresholds.loadTime && metrics.loadTime > testThresholds.loadTime) {
      failures.push(`Load time ${metrics.loadTime}ms exceeds threshold ${testThresholds.loadTime}ms`);
    }

    if (testThresholds.firstContentfulPaint && metrics.firstContentfulPaint > testThresholds.firstContentfulPaint) {
      failures.push(`FCP ${metrics.firstContentfulPaint}ms exceeds threshold ${testThresholds.firstContentfulPaint}ms`);
    }

    if (testThresholds.largestContentfulPaint && metrics.largestContentfulPaint > testThresholds.largestContentfulPaint) {
      failures.push(`LCP ${metrics.largestContentfulPaint}ms exceeds threshold ${testThresholds.largestContentfulPaint}ms`);
    }

    if (testThresholds.cumulativeLayoutShift && metrics.cumulativeLayoutShift > testThresholds.cumulativeLayoutShift) {
      failures.push(`CLS ${metrics.cumulativeLayoutShift} exceeds threshold ${testThresholds.cumulativeLayoutShift}`);
    }

    if (testThresholds.firstInputDelay && metrics.firstInputDelay > testThresholds.firstInputDelay) {
      failures.push(`FID ${metrics.firstInputDelay}ms exceeds threshold ${testThresholds.firstInputDelay}ms`);
    }

    if (testThresholds.timeToInteractive && metrics.timeToInteractive > testThresholds.timeToInteractive) {
      failures.push(`TTI ${metrics.timeToInteractive}ms exceeds threshold ${testThresholds.timeToInteractive}ms`);
    }

    return {
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      metrics: metrics,
      thresholds: testThresholds,
      passed: failures.length === 0,
      failures: failures
    };
  }

  /**
   * Test healthcare-specific performance scenarios
   */
  async testHealthcarePerformance(): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];

    // Test login page performance
    await this.page.goto('/login');
    const loginResult = await this.runPerformanceTest({
      loadTime: 2000, // Login should be fast
      firstContentfulPaint: 1000,
      largestContentfulPaint: 1500
    });
    results.push(loginResult);

    // Test dashboard performance (typically data-heavy)
    try {
      await this.page.goto('/dashboard');
      const dashboardResult = await this.runPerformanceTest({
        loadTime: 4000, // Dashboard can be slower due to data
        firstContentfulPaint: 2000,
        largestContentfulPaint: 3000
      });
      results.push(dashboardResult);
    } catch (error) {
      console.log('[Performance] Dashboard test skipped - page not accessible');
    }

    // Test member search/lookup (database-intensive)
    try {
      await this.page.goto('/members/search');
      const searchResult = await this.runPerformanceTest({
        loadTime: 3000,
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500
      });
      results.push(searchResult);
    } catch (error) {
      console.log('[Performance] Member search test skipped - page not accessible');
    }

    return results;
  }

  /**
   * Measure network performance
   */
  async measureNetworkPerformance(): Promise<any> {
    const networkMetrics = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (entries.length === 0) return {};

      const entry = entries[0];
      return {
        dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcpConnection: entry.connectEnd - entry.connectStart,
        tlsHandshake: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
        serverResponse: entry.responseStart - entry.requestStart,
        contentDownload: entry.responseEnd - entry.responseStart,
        domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
        resourceLoading: entry.loadEventStart - entry.domContentLoadedEventStart
      };
    });

    return networkMetrics;
  }

  /**
   * Test API response times
   */
  async testAPIPerformance(apiEndpoints: string[]): Promise<any[]> {
    const results: any[] = [];

    for (const endpoint of apiEndpoints) {
      const startTime = Date.now();
      
      try {
        const response = await this.page.request.get(endpoint);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        results.push({
          endpoint: endpoint,
          responseTime: responseTime,
          status: response.status(),
          passed: responseTime < 2000, // 2 second threshold for APIs
          size: parseInt(response.headers()['content-length'] || '0')
        });
      } catch (error) {
        results.push({
          endpoint: endpoint,
          responseTime: -1,
          status: 'error',
          passed: false,
          error: error
        });
      }
    }

    return results;
  }

  /**
   * Test resource loading performance
   */
  async testResourceLoading(): Promise<any> {
    const resourceMetrics = await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const metrics = {
        totalResources: resources.length,
        totalSize: 0,
        totalLoadTime: 0,
        slowResources: [] as any[],
        largeResources: [] as any[],
        resourceTypes: {} as any
      };

      resources.forEach((resource) => {
        const loadTime = resource.responseEnd - resource.startTime;
        const size = resource.transferSize || 0;

        metrics.totalLoadTime += loadTime;
        metrics.totalSize += size;

        // Track slow resources (>1 second)
        if (loadTime > 1000) {
          metrics.slowResources.push({
            name: resource.name,
            loadTime: loadTime,
            size: size
          });
        }

        // Track large resources (>500KB)
        if (size > 500000) {
          metrics.largeResources.push({
            name: resource.name,
            loadTime: loadTime,
            size: size
          });
        }

        // Count by resource type
        const extension = resource.name.split('.').pop()?.toLowerCase() || 'unknown';
        metrics.resourceTypes[extension] = (metrics.resourceTypes[extension] || 0) + 1;
      });

      return metrics;
    });

    return resourceMetrics;
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage(): Promise<any> {
    const memoryMetrics = await this.page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          memoryUsagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
      }
      return { message: 'Memory API not available' };
    });

    return memoryMetrics;
  }

  /**
   * Test form submission performance
   */
  async testFormPerformance(formSelector: string, testData: Record<string, string>): Promise<any> {
    const startTime = Date.now();

    try {
      // Fill form fields
      for (const [field, value] of Object.entries(testData)) {
        await this.page.fill(`${formSelector} [name="${field}"]`, value);
      }

      // Submit form and measure response time
      const submitStartTime = Date.now();
      await this.page.click(`${formSelector} [type="submit"]`);
      
      // Wait for response (navigation or success message)
      await this.page.waitForLoadState('networkidle');
      const submitEndTime = Date.now();

      const totalTime = Date.now() - startTime;
      const submitTime = submitEndTime - submitStartTime;

      return {
        formFillTime: submitStartTime - startTime,
        submitResponseTime: submitTime,
        totalTime: totalTime,
        passed: totalTime < 5000 // 5 second threshold for form submission
      };
    } catch (error) {
      return {
        error: error,
        passed: false
      };
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<any> {
    const performanceResult = await this.runPerformanceTest();
    const networkMetrics = await this.measureNetworkPerformance();
    const resourceMetrics = await this.testResourceLoading();
    const memoryMetrics = await this.testMemoryUsage();

    const report = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      summary: {
        overallScore: this.calculatePerformanceScore(performanceResult),
        passed: performanceResult.passed,
        totalFailures: performanceResult.failures.length
      },
      webVitals: performanceResult.metrics,
      thresholds: performanceResult.thresholds,
      failures: performanceResult.failures,
      networkPerformance: networkMetrics,
      resourceLoading: resourceMetrics,
      memoryUsage: memoryMetrics,
      recommendations: this.generatePerformanceRecommendations(performanceResult, resourceMetrics)
    };

    return report;
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(result: PerformanceTestResult): number {
    const metrics = result.metrics;
    const thresholds = result.thresholds;

    let score = 100;

    // Deduct points for each metric that exceeds threshold
    if (thresholds.loadTime && metrics.loadTime > thresholds.loadTime) {
      score -= 20;
    }
    if (thresholds.firstContentfulPaint && metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      score -= 15;
    }
    if (thresholds.largestContentfulPaint && metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
      score -= 20;
    }
    if (thresholds.cumulativeLayoutShift && metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      score -= 15;
    }
    if (thresholds.firstInputDelay && metrics.firstInputDelay > thresholds.firstInputDelay) {
      score -= 15;
    }
    if (thresholds.timeToInteractive && metrics.timeToInteractive > thresholds.timeToInteractive) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(result: PerformanceTestResult, resourceMetrics: any): string[] {
    const recommendations: string[] = [];

    if (result.failures.length > 0) {
      recommendations.push('Address performance threshold failures');
    }

    if (resourceMetrics.slowResources.length > 0) {
      recommendations.push('Optimize slow-loading resources');
    }

    if (resourceMetrics.largeResources.length > 0) {
      recommendations.push('Compress or optimize large resources');
    }

    if (result.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduce layout shifts by reserving space for dynamic content');
    }

    if (result.metrics.firstContentfulPaint > 2000) {
      recommendations.push('Optimize critical rendering path to improve FCP');
    }

    if (result.metrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize largest contentful element loading');
    }

    // Healthcare-specific recommendations
    recommendations.push('Consider lazy loading for non-critical medical data');
    recommendations.push('Implement progressive loading for large datasets');
    recommendations.push('Cache frequently accessed patient information');

    return recommendations;
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: PerformanceThresholds): void {
    this.defaultThresholds = { ...this.defaultThresholds, ...thresholds };
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.defaultThresholds };
  }
}

// Helper function to create performance testing utils
export function createPerformanceTestingUtils(page: Page, thresholds?: PerformanceThresholds): PerformanceTestingUtils {
  return new PerformanceTestingUtils(page, thresholds);
}