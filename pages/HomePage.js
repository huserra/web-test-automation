// pages/HomePage.js
const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.url = process.env.BASE_URL || 'https://www.e-bebek.com';
    
    // Locators
    this.selectors = {
      cookieAcceptButton: 'button:has-text("Kabul Et"), button:has-text("Accept"), button:has-text("Kabul")',
      loginButton: '#lnkLoginNavNode, a:has-text("Giriş Yap"), a:has-text("Üye Girişi"), a:has-text("Login"), a[href*="login"], a[href*="giris"], a[href*="uye-girisi"]',
      searchInput: 'input[type="search"], input[name="search"], input[placeholder*="ara"]',
      searchButton: 'button[type="submit"], button:has-text("Ara")',
      cartButton: 'a:has-text("Sepetim"), a:has-text("SEPETİM"), [data-testid*="cart"]',
      accountMenu: 'text=Hesabım, text=Account',
      logoutButton: 'text=Çıkış, text=Logout'
    };
  }

  /**
   * Navigate to homepage
   */
  async open() {
    await this.navigateTo(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Accept cookies if present
   */
  async acceptCookies() {
    try {
      const cookieButton = this.page.locator(this.selectors.cookieAcceptButton).first();
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        await cookieButton.click();
        console.log('✅ Cookies accepted');
      }
    } catch (error) {
      console.log('ℹ️ No cookie banner found or already accepted');
    }
  }

  /**
   * Click on login button
   */
  async clickLogin() {
    try {
      // First try to find visible login button
      const loginButton = this.page.locator(this.selectors.loginButton).first();
      
      // Get the href attribute to navigate directly if needed
      let loginUrl = null;
      try {
        loginUrl = await loginButton.getAttribute('href');
        console.log(`🔗 Login button href: ${loginUrl}`);
      } catch (error) {
        console.log('ℹ️ Could not get href from login button');
      }
      
      // If not visible, try to make it visible by scrolling or hovering
      if (!(await loginButton.isVisible({ timeout: 3000 }))) {
        console.log('🔍 Login button not visible, trying to make it visible...');
        
        // Try scrolling to the element
        await loginButton.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        
        // Try hovering over parent elements
        const parent = loginButton.locator('xpath=..');
        if (await parent.isVisible()) {
          await parent.hover();
          await this.page.waitForTimeout(500);
        }
      }
      
      // Try to click the button first
      try {
        await loginButton.click({ force: true });
        await this.waitForPageLoad();
        await this.page.waitForTimeout(5000); // Wait longer for login form to load
        console.log('✅ Login button clicked');
      } catch (clickError) {
        console.log('⚠️ Login button click failed, trying direct navigation...');
        
        // If click fails and we have a URL, navigate directly
        if (loginUrl) {
          // Make URL absolute if it's relative
          if (loginUrl.startsWith('/')) {
            loginUrl = this.url + loginUrl;
          }
          await this.page.goto(loginUrl);
          await this.waitForPageLoad();
          await this.page.waitForTimeout(3000);
          console.log(`✅ Navigated directly to login page: ${loginUrl}`);
        } else {
          throw clickError;
        }
      }
    } catch (error) {
      console.log('⚠️ Login button click failed, trying alternative approach...');
      
      // Alternative: try clicking by href
      const loginByHref = this.page.locator('a[href*="login"], a[href*="giris"], a[href*="uye-girisi"]').first();
      if (await loginByHref.isVisible({ timeout: 3000 })) {
        const href = await loginByHref.getAttribute('href');
        console.log(`🔗 Found login link with href: ${href}`);
        
        // Make URL absolute if it's relative
        if (href && href.startsWith('/')) {
          const fullUrl = this.url + href;
          await this.page.goto(fullUrl);
          await this.waitForPageLoad();
          console.log(`✅ Navigated to login page: ${fullUrl}`);
        } else {
          await loginByHref.click();
          await this.waitForPageLoad();
          console.log('✅ Login button clicked via href');
        }
      } else {
        // Last resort: try common login URLs
        const commonLoginUrls = [
          `${this.url}/giris`,
          `${this.url}/login`,
          `${this.url}/uye-girisi`,
          `${this.url}/account/login`
        ];
        
        for (const url of commonLoginUrls) {
          try {
            console.log(`🔍 Trying login URL: ${url}`);
            await this.page.goto(url);
            await this.waitForPageLoad();
            await this.page.waitForTimeout(3000);
            
            // Check if we're on a login page by looking for login form elements
            const hasLoginForm = await this.page.locator('input[type="email"], input[type="tel"], input[type="password"]').count() > 0;
            if (hasLoginForm) {
              console.log(`✅ Successfully navigated to login page: ${url}`);
              return;
            }
          } catch (navError) {
            console.log(`❌ Failed to navigate to ${url}: ${navError.message}`);
          }
        }
        
        throw new Error('Login button not found and could not navigate to login page');
      }
    }
  }

  /**
   * Search for a product
   * @param {string} searchTerm - Product to search for
   */
  async searchProduct(searchTerm) {
    await this.fillField(this.selectors.searchInput, searchTerm);
    await this.page.press(this.selectors.searchInput, 'Enter');
    await this.waitForPageLoad();
    console.log(`✅ Searched for: ${searchTerm}`);
  }

  /**
   * Click on cart button
   */
  async openCart() {
    try {
      // First try to close any open modal
      const closeButton = this.page.locator('button[aria-label="Close"], .close-button, [data-dismiss="modal"]').first();
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Modal closed');
      }
    } catch (error) {
      console.log('ℹ️ No modal to close');
    }
    
    await this.clickElement(this.selectors.cartButton);
    await this.waitForPageLoad();
    console.log('✅ Cart opened');
  }

  /**
   * Logout from account
   */
  async logout() {
    try {
      // Hover over account menu
      const accountMenu = this.page.locator(this.selectors.accountMenu).first();
      await accountMenu.hover();
      await this.page.waitForTimeout(500);
      
      // Click logout
      await this.clickElement(this.selectors.logoutButton);
      await this.waitForPageLoad();
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.log('⚠️ Logout failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if user is logged in
   * @returns {Promise<boolean>} Login status
   */
  async isLoggedIn() {
    try {
      const accountMenu = this.page.locator(this.selectors.accountMenu).first();
      return await accountMenu.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Get cart count
   * @returns {Promise<number>} Cart item count
   */
  async getCartCount() {
    const cartSelectors = [
      '[data-testid*="cart"] [data-testid*="badge"]',
      '.cart-count, .cart-badge, [class*="cart"] [class*="count"]',
      'text=/Sepetim\\s*\\((\\d+)\\)/i'
    ];

    for (const selector of cartSelectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          const text = await element.textContent();
          const match = text && text.match(/\d+/);
          if (match) return parseInt(match[0], 10);
        }
      } catch {}
    }
    return 0;
  }
}

module.exports = HomePage;
