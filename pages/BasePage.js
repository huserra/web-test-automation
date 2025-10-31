// pages/BasePage.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   */
  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 30000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Click on element with retry mechanism
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async clickElement(selector, timeout = 15000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    await this.page.click(selector, { timeout });
  }

  /**
   * Fill input field
   * @param {string} selector - Input selector
   * @param {string} value - Value to fill
   */
  async fillField(selector, value) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    await this.page.fill(selector, value);
  }

  /**
   * Get text content of element
   * @param {string} selector - Element selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    await this.page.waitForSelector(selector, { state: 'visible' });
    return await this.page.textContent(selector);
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} Visibility status
   */
  async isElementVisible(selector) {
    try {
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Take screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`, 
      fullPage: true 
    });
  }

  /**
   * Scroll element into view
   * @param {string} selector - Element selector
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   * @param {string} selector - Element selector
   */
  async hoverElement(selector) {
    await this.page.hover(selector);
  }

  /**
   * Wait for text to appear on page
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForText(text, timeout = 15000) {
    await this.page.waitForSelector(`text=${text}`, { state: 'visible', timeout });
  }
}

module.exports = BasePage;
