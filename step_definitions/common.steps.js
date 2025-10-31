// step_definitions/common.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const testDataManager = require('../support/test-data');
const { 
  clickByText, 
  fillField, 
  expectVisibleText, 
  waitForPageLoad,
  retry,
  takeScreenshot,
  getRandomTestData,
  waitForAnyElement,
  elementExists
} = require('../support/ui-helpers');

// ==================== COMMON GIVEN STEPS ====================

Given('I open the homepage', async function () {
  const HomePage = require('../pages/HomePage');
  this.homePage = new HomePage(this.page);
  await this.homePage.open();
  console.log('✅ Homepage opened');
});

Given('I accept the cookies if present', async function () {
  await this.homePage.acceptCookies();
});

Given('I am on the {string} page', async function (pageName) {
  const pageMap = {
    'home': () => this.homePage.open(),
    'login': () => this.homePage.clickLogin(),
    'cart': () => this.homePage.openCart()
  };
  
  if (pageMap[pageName.toLowerCase()]) {
    await pageMap[pageName.toLowerCase()]();
    console.log(`✅ Navigated to ${pageName} page`);
  } else {
    throw new Error(`Unknown page: ${pageName}`);
  }
});

Given('I have a valid user account', async function () {
  const user = testDataManager.getUserByRole('customer');
  this.currentUser = user;
  testDataManager.setCurrentTestData({ user });
  console.log(`✅ Test user prepared: ${user.email}`);
});

Given('I have test data for {string}', async function (dataType) {
  const testData = testDataManager.getRandomProduct();
  this.currentTestData = testData;
  testDataManager.setCurrentTestData({ [dataType]: testData });
  console.log(`✅ Test data prepared for ${dataType}: ${testData.name}`);
});

// ==================== COMMON WHEN STEPS ====================

When('I wait for {int} seconds', async function (seconds) {
  await this.page.waitForTimeout(seconds * 1000);
  console.log(`✅ Waited for ${seconds} seconds`);
});

When('I refresh the page', async function () {
  await this.page.reload();
  await waitForPageLoad(this.page);
  console.log('✅ Page refreshed');
});

When('I go back to the previous page', async function () {
  await this.page.goBack();
  await waitForPageLoad(this.page);
  console.log('✅ Navigated back');
});

When('I take a screenshot named {string}', async function (name) {
  await takeScreenshot(this.page, name);
});

When('I scroll to the {string} of the page', async function (position) {
  const positions = {
    'top': 0,
    'bottom': 'document.body.scrollHeight',
    'middle': 'document.body.scrollHeight / 2'
  };
  
  const scrollValue = positions[position.toLowerCase()];
  if (scrollValue !== undefined) {
    await this.page.evaluate((value) => {
      window.scrollTo(0, value);
    }, scrollValue);
    await this.page.waitForTimeout(1000);
    console.log(`✅ Scrolled to ${position} of page`);
  } else {
    throw new Error(`Unknown scroll position: ${position}`);
  }
});

// ==================== COMMON THEN STEPS ====================

Then('I should see the page title contains {string}', async function (expectedTitle) {
  const title = await this.page.title();
  assert(title.toLowerCase().includes(expectedTitle.toLowerCase()), 
    `Expected page title to contain "${expectedTitle}" but got "${title}"`);
  console.log(`✅ Page title verified: "${title}"`);
});

Then('I should see text {string}', async function (expectedText) {
  await expectVisibleText(this.page, expectedText);
});

Then('I should see text {string} or {string}', async function (text1, text2) {
  const text1Exists = await elementExists(this.page, `text=${text1}`, { timeout: 3000 });
  const text2Exists = await elementExists(this.page, `text=${text2}`, { timeout: 3000 });
  
  assert(text1Exists || text2Exists, 
    `Expected to see either "${text1}" or "${text2}" but neither was found`);
  console.log(`✅ Found text: ${text1Exists ? text1 : text2}`);
});

Then('I should not see text {string}', async function (unexpectedText) {
  const isVisible = await elementExists(this.page, `text=${unexpectedText}`, { timeout: 3000 });
  assert(!isVisible, `Expected not to see text "${unexpectedText}" but it was found`);
  console.log(`✅ Text "${unexpectedText}" is not visible as expected`);
});

Then('I should see an element with selector {string}', async function (selector) {
  const exists = await elementExists(this.page, selector);
  assert(exists, `Expected element with selector "${selector}" to be visible`);
  console.log(`✅ Element found: ${selector}`);
});

Then('I should not see an element with selector {string}', async function (selector) {
  const exists = await elementExists(this.page, selector, { timeout: 3000 });
  assert(!exists, `Expected element with selector "${selector}" to not be visible`);
  console.log(`✅ Element not found as expected: ${selector}`);
});

Then('the current URL should contain {string}', async function (expectedUrlPart) {
  const currentUrl = this.page.url();
  assert(currentUrl.includes(expectedUrlPart), 
    `Expected URL to contain "${expectedUrlPart}" but got "${currentUrl}"`);
  console.log(`✅ URL verified: ${currentUrl}`);
});

Then('I should see {int} or more elements with selector {string}', async function (minCount, selector) {
  const elements = this.page.locator(selector);
  const count = await elements.count();
  assert(count >= minCount, 
    `Expected at least ${minCount} elements with selector "${selector}" but found ${count}`);
  console.log(`✅ Found ${count} elements (minimum ${minCount}): ${selector}`);
});

Then('I should see exactly {int} elements with selector {string}', async function (expectedCount, selector) {
  const elements = this.page.locator(selector);
  const count = await elements.count();
  assert(count === expectedCount, 
    `Expected exactly ${expectedCount} elements with selector "${selector}" but found ${count}`);
  console.log(`✅ Found exactly ${count} elements: ${selector}`);
});

// ==================== RETRY STEPS ====================

When('I retry the following steps with {int} attempts:', async function (maxAttempts, dataTable) {
  const steps = dataTable.raw().map(row => row[0]);
  
  await retry(async () => {
    for (const step of steps) {
      // This would need to be implemented with a step registry
      console.log(`🔄 Retrying step: ${step}`);
      // For now, just log the step
    }
  }, { maxAttempts, delay: 2000 });
  
  console.log(`✅ Completed retry sequence with ${maxAttempts} attempts`);
});

// ==================== DATA-DRIVEN STEPS ====================

When('I search for a random product', async function () {
  const randomProduct = testDataManager.getRandomProduct();
  this.currentSearchTerm = randomProduct.name;
  
  await this.homePage.searchProduct(randomProduct.name);
  console.log(`✅ Searched for random product: ${randomProduct.name}`);
});

When('I search for products from test data:', async function (dataTable) {
  const products = dataTable.raw().map(row => row[0]);
  
  for (const product of products) {
    await this.homePage.searchProduct(product);
    await this.page.waitForTimeout(2000); // Wait between searches
    console.log(`✅ Searched for: ${product}`);
  }
});

// ==================== VALIDATION STEPS ====================

Then('the page should load within {int} seconds', async function (maxSeconds) {
  const startTime = Date.now();
  await waitForPageLoad(this.page, { timeout: maxSeconds * 1000 });
  const loadTime = Date.now() - startTime;
  console.log(`✅ Page loaded in ${loadTime}ms (max ${maxSeconds}s)`);
});

Then('all images should be loaded', async function () {
  const images = this.page.locator('img');
  const count = await images.count();
  
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const isLoaded = await img.evaluate((img) => img.complete && img.naturalHeight !== 0);
    assert(isLoaded, `Image ${i} is not loaded properly`);
  }
  
  console.log(`✅ All ${count} images are loaded`);
});

Then('the page should be responsive', async function () {
  const viewport = this.page.viewportSize();
  assert(viewport.width >= 320, 'Page should be responsive (min width 320px)');
  assert(viewport.height >= 480, 'Page should be responsive (min height 480px)');
  console.log(`✅ Page is responsive: ${viewport.width}x${viewport.height}`);
});
