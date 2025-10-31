// support/test-data.js
const fs = require('fs');
const path = require('path');

class TestDataManager {
  constructor() {
    this.testData = this.loadTestData();
    this.currentTestData = {};
  }

  /**
   * Load test data from JSON files
   */
  loadTestData() {
    const dataDir = path.join(__dirname, '..', 'test-data');
    
    // Create test-data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const testData = {
      products: this.loadJsonFile(path.join(dataDir, 'products.json')),
      users: this.loadJsonFile(path.join(dataDir, 'users.json')),
      searchTerms: this.loadJsonFile(path.join(dataDir, 'search-terms.json')),
      config: this.loadJsonFile(path.join(dataDir, 'config.json'))
    };

    return testData;
  }

  /**
   * Load JSON file with fallback to default data
   */
  loadJsonFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (error) {
      console.log(`⚠️ Could not load ${filePath}, using default data`);
    }
    return this.getDefaultData(path.basename(filePath, '.json'));
  }

  /**
   * Get default test data
   */
  getDefaultData(dataType) {
    const defaults = {
      products: [
        { name: 'biberon', category: 'feeding', expectedResults: 10 },
        { name: 'oyuncak', category: 'toys', expectedResults: 15 },
        { name: 'giyim', category: 'clothing', expectedResults: 20 },
        { name: 'bebek arabası', category: 'strollers', expectedResults: 5 }
      ],
      users: [
        { email: 'test@example.com', password: 'testpassword123', role: 'customer' },
        { email: 'premium@example.com', password: 'premiumpass123', role: 'premium' }
      ],
      searchTerms: [
        'biberon',
        'oyuncak',
        'bebek giyim',
        'bebek arabası',
        'emzik',
        'bebek bezi'
      ],
      config: {
        timeouts: {
          short: 5000,
          medium: 15000,
          long: 30000
        },
        retry: {
          maxAttempts: 3,
          delay: 1000
        },
        browser: {
          viewport: { width: 1280, height: 720 },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    };
    return defaults[dataType] || {};
  }

  /**
   * Get random product for testing
   */
  getRandomProduct() {
    const products = this.testData.products;
    return products[Math.floor(Math.random() * products.length)];
  }

  /**
   * Get random search term
   */
  getRandomSearchTerm() {
    const terms = this.testData.searchTerms;
    return terms[Math.floor(Math.random() * terms.length)];
  }

  /**
   * Get user by role
   */
  getUserByRole(role = 'customer') {
    const users = this.testData.users;
    return users.find(user => user.role === role) || users[0];
  }

  /**
   * Get configuration value
   */
  getConfig(key) {
    return this.testData.config[key];
  }

  /**
   * Set current test data
   */
  setCurrentTestData(data) {
    this.currentTestData = { ...this.currentTestData, ...data };
  }

  /**
   * Get current test data
   */
  getCurrentTestData() {
    return this.currentTestData;
  }

  /**
   * Clear current test data
   */
  clearCurrentTestData() {
    this.currentTestData = {};
  }

  /**
   * Generate test data dynamically
   */
  generateTestData(type, count = 1) {
    const generators = {
      email: () => `test${Date.now()}@example.com`,
      phone: () => `+90555${Math.floor(Math.random() * 10000000)}`,
      name: () => `Test User ${Math.floor(Math.random() * 1000)}`,
      product: () => ({
        name: `Test Product ${Math.floor(Math.random() * 1000)}`,
        price: Math.floor(Math.random() * 1000) + 10,
        category: 'test'
      })
    };

    if (count === 1) {
      return generators[type] ? generators[type]() : null;
    }

    return Array.from({ length: count }, () => generators[type] ? generators[type]() : null);
  }
}

// Create singleton instance
const testDataManager = new TestDataManager();

module.exports = testDataManager;
