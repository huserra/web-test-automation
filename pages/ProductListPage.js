// pages/ProductListPage.js
const BasePage = require('./BasePage');

class ProductListPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Locators
    this.selectors = {
      productCard: '[data-testid*="product-card"], .product-item, .product-card, [class*="ProductCard"], [class*="product-item"], .item, [data-testid*="product"], .product, .product-box',
      productLink: 'a',
      productTitle: 'h1, h2, h3, [class*="title"], [class*="name"], .product-title, .product-name',
      productPrice: '[class*="price"], [class*="cost"], .price, .product-price',
      addToCartButton: 'button:has-text("Sepete Ekle"), button:has-text("Sepete ekle"), button:has-text("SEPETE EKLE"), [data-testid*="add-to-cart"], [aria-label*="Sepete Ekle" i], .add-to-cart',
      searchResults: '.search-results, [class*="search"], [class*="results"], .products, .product-list',
      noResultsMessage: 'text=Ürün bulunamadı, text=No products found, text=Sonuç bulunamadı',
      sortDropdown: 'select[name*="sort"], [class*="sort"] select',
      filterButton: 'button:has-text("Filtrele"), [class*="filter"] button'
    };
  }

  /**
   * Wait for search results to load
   */
  async waitForResults() {
    await this.waitForPageLoad();
    
    // Wait for either results or no results message
    try {
      await Promise.race([
        this.page.waitForSelector(this.selectors.productCard, { timeout: 10000 }),
        this.page.waitForSelector(this.selectors.noResultsMessage, { timeout: 10000 })
      ]);
    } catch (error) {
      console.log('⚠️ No clear results found, continuing...');
    }
  }

  /**
   * Get first product card
   * @returns {Promise<Object>} First product element
   */
  async getFirstProduct() {
    const products = this.page.locator(this.selectors.productCard);
    const count = await products.count();
    
    if (count === 0) {
      throw new Error('No products found on the page');
    }
    
    const firstProduct = products.first();
    console.log(`✅ Found ${count} products, selecting first one`);
    
    return firstProduct;
  }

  /**
   * Get product title
   * @param {Object} productElement - Product element
   * @returns {Promise<string>} Product title
   */
  async getProductTitle(productElement) {
    try {
      const titleElement = productElement.locator(this.selectors.productTitle).first();
      return await titleElement.textContent();
    } catch {
      return 'Unknown Product';
    }
  }

  /**
   * Get product price
   * @param {Object} productElement - Product element
   * @returns {Promise<string>} Product price
   */
  async getProductPrice(productElement) {
    try {
      const priceElement = productElement.locator(this.selectors.productPrice).first();
      return await priceElement.textContent();
    } catch {
      return 'Price not available';
    }
  }

  /**
   * Try to add product to cart from product card
   * @param {Object} productElement - Product element
   * @returns {Promise<boolean>} Success status
   */
  async tryAddToCartFromCard(productElement) {
    try {
      const addButton = productElement.locator(this.selectors.addToCartButton).first();
      
      if (await addButton.isVisible({ timeout: 2000 })) {
        await this.scrollToElement(addButton);
        await addButton.click();
        console.log('✅ Add to cart button clicked from product card');
        return true;
      }
    } catch (error) {
      console.log('ℹ️ No add to cart button found on product card');
    }
    
    return false;
  }

  /**
   * Click on product to open product detail page
   * @param {Object} productElement - Product element
   * @returns {Promise<Object>} New page object
   */
  async clickProduct(productElement) {
    const productLink = productElement.locator(this.selectors.productLink).first();
    
    if (!(await productLink.isVisible({ timeout: 5000 }))) {
      throw new Error('Product link not found');
    }

    // Handle potential new tab opening
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page').catch(() => null),
      productLink.click()
    ]);
    
    const targetPage = newPage || this.page;
    await targetPage.waitForLoadState('domcontentloaded');
    await targetPage.waitForTimeout(2000);
    
    console.log('✅ Product detail page opened');
    return targetPage;
  }

  /**
   * Check if search results contain expected text
   * @param {string} expectedText - Text to search for
   * @returns {Promise<boolean>} Contains text
   */
  async containsSearchResults(expectedText) {
    try {
      const resultsElement = this.page.locator(this.selectors.searchResults).first();
      if (await resultsElement.isVisible()) {
        const text = await resultsElement.textContent();
        return text.toLowerCase().includes(expectedText.toLowerCase());
      }
    } catch {}
    
    // Fallback: check page content
    const pageContent = await this.page.textContent('body');
    return pageContent.toLowerCase().includes(expectedText.toLowerCase());
  }

  /**
   * Get total number of products
   * @returns {Promise<number>} Product count
   */
  async getProductCount() {
    const products = this.page.locator(this.selectors.productCard);
    return await products.count();
  }

  /**
   * Sort products by option
   * @param {string} sortOption - Sort option
   */
  async sortProducts(sortOption) {
    try {
      const sortDropdown = this.page.locator(this.selectors.sortDropdown).first();
      if (await sortDropdown.isVisible({ timeout: 3000 })) {
        await sortDropdown.selectOption(sortOption);
        await this.waitForPageLoad();
        console.log(`✅ Products sorted by: ${sortOption}`);
      }
    } catch (error) {
      console.log('ℹ️ Sort dropdown not found or not functional');
    }
  }
}

module.exports = ProductListPage;
