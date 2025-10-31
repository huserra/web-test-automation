// pages/ProductDetailPage.js
const BasePage = require('./BasePage');

class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Locators
    this.selectors = {
      productTitle: 'h1, [class*="product-title"], [class*="product-name"]',
      productPrice: '[class*="price"], [class*="cost"], .price, [data-testid*="price"]',
      addToCartButton: 'button:has-text("Sepete Ekle"), button:has-text("Sepete ekle"), [data-testid*="add-to-cart"], [aria-label*="Sepete Ekle" i]',
      quantityInput: 'input[type="number"], input[name*="quantity"], [class*="quantity"] input',
      colorSelector: '[class*="color"] button:not([disabled]), [data-testid*="color"] button:not([disabled])',
      sizeSelector: '[class*="size"] button:not([disabled]), [data-testid*="size"] button:not([disabled])',
      variantSelector: '[data-testid*="variant"] button:not([disabled])',
      radioOption: 'input[type="radio"]:not([disabled])',
      selectOption: 'select',
      successMessage: 'text=/Sepete eklendi|Added to cart|Ürün sepete eklendi/i',
      errorMessage: '.error, .alert, [class*="error"]',
      productImage: 'img[class*="product"], [class*="product-image"] img',
      productDescription: '[class*="description"], [class*="details"]',
      breadcrumb: '[class*="breadcrumb"], nav[aria-label*="breadcrumb"]'
    };
  }

  /**
   * Wait for product detail page to load
   */
  async waitForPageLoad() {
    await super.waitForPageLoad();
    
    // Wait for essential elements
    try {
      await Promise.race([
        this.page.waitForSelector(this.selectors.productTitle, { timeout: 10000 }),
        this.page.waitForSelector(this.selectors.addToCartButton, { timeout: 10000 })
      ]);
    } catch (error) {
      console.log('⚠️ Product detail page may not have loaded completely');
    }
  }

  /**
   * Get product title
   * @returns {Promise<string>} Product title
   */
  async getProductTitle() {
    try {
      const titleElement = this.page.locator(this.selectors.productTitle).first();
      return await titleElement.textContent();
    } catch {
      return 'Unknown Product';
    }
  }

  /**
   * Get product price
   * @returns {Promise<string>} Product price
   */
  async getProductPrice() {
    try {
      const priceElement = this.page.locator(this.selectors.productPrice).first();
      return await priceElement.textContent();
    } catch {
      return 'Price not available';
    }
  }

  /**
   * Select product variant (color, size, etc.)
   */
  async selectVariants() {
    console.log(' Selecting product variants...');
    
    // Select color if available
    await this.selectColor();
    
    // Select size if available
    await this.selectSize();
    
    // Select other variants
    await this.selectOtherVariants();
    
    // Handle radio options
    await this.selectRadioOptions();
    
    // Handle select dropdowns
    await this.selectDropdownOptions();
  }

  /**
   * Select product color
   */
  async selectColor() {
    try {
      const colorButtons = this.page.locator(this.selectors.colorSelector);
      const count = await colorButtons.count();
      
      if (count > 0) {
        await colorButtons.first().click();
        await this.page.waitForTimeout(500);
        console.log('✅ Color selected');
      }
    } catch (error) {
      console.log('ℹ️ No color options found');
    }
  }

  /**
   * Select product size
   */
  async selectSize() {
    try {
      const sizeButtons = this.page.locator(this.selectors.sizeSelector);
      const count = await sizeButtons.count();
      
      if (count > 0) {
        await sizeButtons.first().click();
        await this.page.waitForTimeout(500);
        console.log('✅ Size selected');
      }
    } catch (error) {
      console.log('ℹ️ No size options found');
    }
  }

  /**
   * Select other variants
   */
  async selectOtherVariants() {
    try {
      const variantButtons = this.page.locator(this.selectors.variantSelector);
      const count = await variantButtons.count();
      
      if (count > 0) {
        await variantButtons.first().click();
        await this.page.waitForTimeout(500);
        console.log('✅ Variant selected');
      }
    } catch (error) {
      console.log('ℹ️ No other variants found');
    }
  }

  /**
   * Select radio options
   */
  async selectRadioOptions() {
    try {
      const radioButtons = this.page.locator(this.selectors.radioOption);
      const count = await radioButtons.count();
      
      if (count > 0) {
        await radioButtons.first().check({ force: true });
        await this.page.waitForTimeout(200);
        console.log('✅ Radio option selected');
      }
    } catch (error) {
      console.log('ℹ️ No radio options found');
    }
  }

  /**
   * Select dropdown options
   */
  async selectDropdownOptions() {
    try {
      const selectElements = await this.page.locator(this.selectors.selectOption).elementHandles();
      
      for (const select of selectElements) {
        try {
          const handle = select.asElement();
          if (handle) {
            await handle.selectOption({ index: 1 });
            await this.page.waitForTimeout(200);
          }
        } catch {}
      }
      
      if (selectElements.length > 0) {
        console.log('✅ Dropdown options selected');
      }
    } catch (error) {
      console.log('ℹ️ No dropdown options found');
    }
  }

  /**
   * Add product to cart
   * @returns {Promise<boolean>} Success status
   */
  async addToCart() {
    console.log(' Adding product to cart...');
    
    // First select variants
    await this.selectVariants();
    
    // Find and click add to cart button
    const addButton = this.page.locator(this.selectors.addToCartButton).first();
    
    if (!(await addButton.isVisible({ timeout: 5000 }))) {
      throw new Error('Add to cart button not found');
    }
    
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click();
    console.log('✅ Add to cart button clicked');
    
    // Wait for success indication
    return await this.waitForAddToCartSuccess();
  }

  /**
   * Wait for add to cart success
   * @returns {Promise<boolean>} Success status
   */
  async waitForAddToCartSuccess() {
    const maxWaitTime = 15000; // 15 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      // Check for success message
      const successMessage = this.page.locator(this.selectors.successMessage).first();
      if (await successMessage.isVisible({ timeout: 1000 })) {
        console.log('✅ Success message appeared');
        return true;
      }
      
      // Check if button is disabled (indicates success)
      const addButton = this.page.locator(this.selectors.addToCartButton).first();
      if (await addButton.isDisabled().catch(() => false)) {
        console.log('✅ Add to cart button disabled (success)');
        return true;
      }
      
      await this.page.waitForTimeout(500);
    }
    
    console.log('⚠️ Add to cart success not confirmed within timeout');
    return false;
  }

  /**
   * Set product quantity
   * @param {number} quantity - Quantity to set
   */
  async setQuantity(quantity) {
    try {
      const quantityInput = this.page.locator(this.selectors.quantityInput).first();
      if (await quantityInput.isVisible({ timeout: 3000 })) {
        await quantityInput.fill(quantity.toString());
        console.log(`✅ Quantity set to: ${quantity}`);
      }
    } catch (error) {
      console.log('ℹ️ Quantity input not found');
    }
  }

  /**
   * Check if product is in stock
   * @returns {Promise<boolean>} Stock status
   */
  async isInStock() {
    try {
      const addButton = this.page.locator(this.selectors.addToCartButton).first();
      return await addButton.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Get product description
   * @returns {Promise<string>} Product description
   */
  async getProductDescription() {
    try {
      const descElement = this.page.locator(this.selectors.productDescription).first();
      return await descElement.textContent();
    } catch {
      return 'Description not available';
    }
  }
}

module.exports = ProductDetailPage;
