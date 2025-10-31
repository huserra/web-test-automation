// allure.config.js
module.exports = {
  // Allure configuration
  resultsDir: 'allure-results',
  reportDir: 'allure-report',
  
  // Test environment info
  environment: {
    browser: 'Chromium',
    version: '1.47.2',
    platform: process.platform,
    node_version: process.version,
    test_framework: 'Cucumber + Playwright'
  },
  
  // Categories for test results
  categories: [
    {
      name: 'Test Results',
      matchedStatuses: ['passed', 'failed', 'broken', 'skipped']
    },
    {
      name: 'Product Issues',
      matchedStatuses: ['failed'],
      messageRegex: '.*product.*not.*found.*|.*add.*to.*cart.*failed.*'
    },
    {
      name: 'UI Issues', 
      matchedStatuses: ['broken'],
      messageRegex: '.*element.*not.*found.*|.*timeout.*|.*selector.*'
    }
  ],
  
  // Links to external systems
  links: [
    {
      type: 'issue',
      urlTemplate: 'https://example.com/issues/%s',
      nameTemplate: 'Issue #%s'
    },
    {
      type: 'tms',
      urlTemplate: 'https://example.com/features/%s',
      nameTemplate: 'Feature: %s'
    }
  ]
};
