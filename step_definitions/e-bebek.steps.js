// step_definitions/e-bebek.steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const testDataManager = require('../support/test-data');
const { 
  retry,
  takeScreenshot,
  waitForPageLoad,
  elementExists
} = require('../support/ui-helpers');

// Import page objects
const HomePage = require('../pages/HomePage');
const LoginPage = require('../pages/LoginPage');
const ProductListPage = require('../pages/ProductListPage');
const ProductDetailPage = require('../pages/ProductDetailPage');
const CartPage = require('../pages/CartPage');

// Initialize page objects
let homePage;
let loginPage;
let productListPage;
let productDetailPage;
let cartPage;

// Helper function to get cart count
async function getCartCount(page) {
  const candidates = [
    page.locator('[data-testid*="cart"] [data-testid*="badge"]').first(),
    page.locator('.cart-count, .cart-badge, [class*="cart"] [class*="count"]').first(),
    page.getByText(/Sepetim\s*\((\d+)\)/i).first(),
  ];
  
  for (const c of candidates) {
    try {
      if (await c.isVisible()) {
        const t = await c.textContent();
        const m = t && t.match(/\d+/);
        if (m) return parseInt(m[0], 10);
      }
    } catch {}
  }
  return 0;
}

// ==================== GIVEN STEPS ====================
// Note: Common steps are defined in common.steps.js

// ==================== WHEN STEPS ====================

When('I open login', async function () {
  await this.homePage.clickLogin();
  this.loginPage = new LoginPage(this.page);
});

When('I sign in with valid credentials', async function () {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;
  
  assert(email && password, 'USER_EMAIL or USER_PASSWORD not set in .env');
  
  await this.loginPage.login(email, password);
});

When('I search for {string}', async function (searchTerm) {
  // Store search term for later use
  this.currentSearchTerm = searchTerm;
  testDataManager.setCurrentTestData({ searchTerm });
  
  // Use the homePage from common steps
  await this.homePage.searchProduct(searchTerm);
  this.productListPage = new ProductListPage(this.page);
  await this.productListPage.waitForResults();
  console.log(`✅ Searched for: ${searchTerm}`);
});

When('I add the first product to the cart', async function () {
  await retry(async () => {
    const startCount = await getCartCount(this.page);
    console.log(` Starting cart count: ${startCount}`);
    
    // Get first product
    const firstProduct = await this.productListPage.getFirstProduct();
    const productTitle = await this.productListPage.getProductTitle(firstProduct);
    console.log(` Product: ${productTitle}`);
    
    // Store product info for later use
    this.currentProduct = { title: productTitle };
    testDataManager.setCurrentTestData({ product: { title: productTitle } });
    
    // Try to add from product card first
    const addedFromCard = await this.productListPage.tryAddToCartFromCard(firstProduct);
    
    if (addedFromCard) {
      // Wait for cart count to increase
      await this.page.waitForTimeout(2000);
      const newCount = await getCartCount(this.page);
      if (newCount > startCount) {
        console.log(`✅ Product added from card! New count: ${newCount}`);
        return;
      }
    }
    
    // If card add failed, go to product detail page
    console.log('🔄 Card add failed, opening product detail page...');
    const newPage = await this.productListPage.clickProduct(firstProduct);
    
    // Create product detail page object
    this.productDetailPage = new ProductDetailPage(newPage);
    await this.productDetailPage.waitForPageLoad();
    
    // Add to cart from detail page
    const success = await this.productDetailPage.addToCart();
    
    if (!success) {
      await takeScreenshot(newPage, 'add-to-cart-failed');
      throw new Error('Failed to add product to cart');
    }
    
    // Verify cart count increased
    const finalCount = await getCartCount(this.page);
    if (finalCount <= startCount) {
      throw new Error(`Cart count did not increase. Start: ${startCount}, End: ${finalCount}`);
    }
    
    console.log(`✅ Product successfully added to cart! Final count: ${finalCount}`);
    
  }, { maxAttempts: 2, delay: 2000 });
});

When('I open the cart', async function () {
  await this.homePage.openCart();
  this.cartPage = new CartPage(this.page);
  await this.cartPage.waitForPageLoad();
});

When('I log out', async function () {
  await this.homePage.logout();
});

When('I navigate back to homepage', async function () {
  await this.homePage.open();
  console.log('✅ Navigated back to homepage');
});

// ==================== THEN STEPS ====================

Then('I should be logged in', async function () {
  const isLoggedIn = await this.homePage.isLoggedIn();
  assert(isLoggedIn, 'User should be logged in but login confirmation not found');
  console.log('✅ Login confirmed');
});

Then('I should see text {string} in results', async function (expectedText) {
  const containsText = await this.productListPage.containsSearchResults(expectedText);
  assert(containsText, `Expected to see text "${expectedText}" in search results`);
  console.log(`✅ Found "${expectedText}" in search results`);
});

Then('the cart counter should be at least {int}', async function (minCount) {
  const cartCount = await getCartCount(this.page);
  assert(cartCount >= minCount, `Expected cart count >= ${minCount} but got ${cartCount}`);
  console.log(`✅ Cart count verified: ${cartCount} >= ${minCount}`);
});

Then('I should see items in the cart', async function () {
  const hasItems = await this.cartPage.hasItems();
  assert(hasItems, 'Cart should contain items but appears to be empty');
  
  const itemCount = await this.cartPage.getItemCount();
  console.log(`✅ Cart contains ${itemCount} items`);
});

Then('I should see the login button', async function () {
  const loginButton = this.page.locator('a:has-text("Giriş Yap"), a:has-text("Üye Girişi"), a:has-text("Login")').first();
  const isVisible = await loginButton.isVisible({ timeout: 5000 });
  assert(isVisible, 'Login button should be visible after logout');
  console.log('✅ Login button is visible after logout');
});

// ==================== ADDITIONAL STEPS ====================

When('I click on the first product', async function () {
  const firstProduct = await productListPage.getFirstProduct();
  const newPage = await productListPage.clickProduct(firstProduct);
  productDetailPage = new ProductDetailPage(newPage);
  await productDetailPage.waitForPageLoad();
  console.log('✅ First product clicked and detail page opened');
});

Then('I should see the product detail page', async function () {
  const title = await productDetailPage.getProductTitle();
  const price = await productDetailPage.getProductPrice();
  console.log(`✅ Product detail page loaded - Title: ${title}, Price: ${price}`);
});

When('I select product variants', async function () {
  await productDetailPage.selectVariants();
  console.log('✅ Product variants selected');
});

Then('the product should be in stock', async function () {
  const inStock = await productDetailPage.isInStock();
  assert(inStock, 'Product should be in stock');
  console.log('✅ Product is in stock');
});

When('I remove the first item from cart', async function () {
  const initialCount = await cartPage.getItemCount();
  await cartPage.removeItem(0);
  const finalCount = await cartPage.getItemCount();
  console.log(`✅ Item removed. Count: ${initialCount} → ${finalCount}`);
});

Then('the cart should be empty', async function () {
  const isEmpty = await cartPage.isEmpty();
  assert(isEmpty, 'Cart should be empty');
  console.log('✅ Cart is empty');
});

When('I update the quantity of the first item to {int}', async function (newQuantity) {
  await cartPage.updateItemQuantity(0, newQuantity);
  console.log(`✅ First item quantity updated to ${newQuantity}`);
});

Then('the cart should contain {int} items', async function (expectedCount) {
  const actualCount = await cartPage.getItemCount();
  assert(actualCount === expectedCount, `Expected ${expectedCount} items but found ${actualCount}`);
  console.log(`✅ Cart contains exactly ${actualCount} items`);
});
