// support/test-utilities.js
const fs = require('fs');
const path = require('path');

class TestUtilities {
  /**
   * Generate test report summary
   */
  static generateTestSummary(results) {
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passed: results.filter(r => r.status === 'PASSED').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      skipped: results.filter(r => r.status === 'SKIPPED').length,
      duration: this.calculateTotalDuration(results)
    };
    
    summary.passRate = ((summary.passed / summary.totalTests) * 100).toFixed(2);
    return summary;
  }

  /**
   * Calculate total test duration
   */
  static calculateTotalDuration(results) {
    return results.reduce((total, result) => {
      return total + (result.duration || 0);
    }, 0);
  }

  /**
   * Create test environment info
   */
  static getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      timestamp: new Date().toISOString(),
      userAgent: process.env.USER_AGENT || 'Test Automation',
      baseUrl: process.env.BASE_URL || 'https://www.e-bebek.com'
    };
  }

  /**
   * Validate test data
   */
  static validateTestData(data) {
    const errors = [];
    
    if (!data.products || !Array.isArray(data.products)) {
      errors.push('Products data is missing or invalid');
    }
    
    if (!data.users || !Array.isArray(data.users)) {
      errors.push('Users data is missing or invalid');
    }
    
    if (!data.searchTerms || !Array.isArray(data.searchTerms)) {
      errors.push('Search terms data is missing or invalid');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean up test artifacts
   */
  static async cleanupTestArtifacts() {
    const dirs = ['screenshots', 'videos', 'allure-results', 'reports'];
    
    for (const dir of dirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        try {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`✅ Cleaned up ${dir} directory`);
        } catch (error) {
          console.log(`⚠️ Could not clean up ${dir}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Create test data backup
   */
  static async backupTestData() {
    const testDataDir = path.join(process.cwd(), 'test-data');
    const backupDir = path.join(process.cwd(), 'test-data-backup');
    
    if (fs.existsSync(testDataDir)) {
      try {
        if (fs.existsSync(backupDir)) {
          fs.rmSync(backupDir, { recursive: true, force: true });
        }
        fs.cpSync(testDataDir, backupDir, { recursive: true });
        console.log('✅ Test data backed up successfully');
      } catch (error) {
        console.log(`⚠️ Could not backup test data: ${error.message}`);
      }
    }
  }

  /**
   * Generate random test data
   */
  static generateRandomData(type, count = 1) {
    const generators = {
      email: () => `test${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`,
      phone: () => `+90555${Math.floor(Math.random() * 10000000)}`,
      name: () => `Test User ${Math.floor(Math.random() * 1000)}`,
      product: () => ({
        name: `Test Product ${Math.floor(Math.random() * 1000)}`,
        price: Math.floor(Math.random() * 1000) + 10,
        category: 'test',
        description: `Test product description ${Math.floor(Math.random() * 1000)}`
      }),
      searchTerm: () => {
        const terms = ['test', 'product', 'item', 'sample', 'demo'];
        return terms[Math.floor(Math.random() * terms.length)] + Math.floor(Math.random() * 100);
      }
    };

    if (count === 1) {
      return generators[type] ? generators[type]() : null;
    }

    return Array.from({ length: count }, () => 
      generators[type] ? generators[type]() : null
    );
  }

  /**
   * Wait for condition with timeout
   */
  static async waitForCondition(condition, { timeout = 10000, interval = 1000 } = {}) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return true;
        }
      } catch (error) {
        // Continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Retry function with exponential backoff
   */
  static async retryWithBackoff(fn, { maxAttempts = 3, baseDelay = 1000 } = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw new Error(`Operation failed after ${maxAttempts} attempts: ${error.message}`);
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Format test results for reporting
   */
  static formatTestResults(results) {
    return results.map(result => ({
      name: result.name,
      status: result.status,
      duration: result.duration,
      error: result.error ? result.error.message : null,
      timestamp: result.timestamp
    }));
  }

  /**
   * Create test execution report
   */
  static createExecutionReport(testResults, environmentInfo) {
    const summary = this.generateTestSummary(testResults);
    
    return {
      summary,
      environment: environmentInfo,
      results: this.formatTestResults(testResults),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        framework: 'Cucumber + Playwright'
      }
    };
  }

  /**
   * Save test report to file
   */
  static async saveTestReport(report, filename = 'test-execution-report.json') {
    const reportsDir = path.join(process.cwd(), 'reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filePath = path.join(reportsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`✅ Test report saved: ${filePath}`);
    
    return filePath;
  }

  /**
   * Validate page performance
   */
  static async validatePagePerformance(page, { maxLoadTime = 5000 } = {}) {
    const startTime = Date.now();
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    return {
      loadTime,
      isAcceptable: loadTime <= maxLoadTime,
      maxAllowed: maxLoadTime
    };
  }

  /**
   * Check for console errors
   */
  static async checkConsoleErrors(page) {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return errors;
  }
}

module.exports = TestUtilities;
