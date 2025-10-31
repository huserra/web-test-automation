// pages/CartPage.js
const BasePage = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Locators
    this.selectors = {
      cartItem: '[data-testid*="cart-item"], .cart-item, [class*="CartItem"], [class*="cart-item"], .item, [class*="basket-item"], [class*="sepet-item"], .cart-product, .basket-item',
      itemTitle: 'h1, h2, h3, [class*="title"], [class*="name"], [class*="product-name"], .product-title',
      itemPrice: '[class*="price"], [class*="cost"], .price, .product-price',
      itemQuantity: 'input[type="number"], [class*="quantity"] input, select[name*="quantity"], .quantity-input',
      removeButton: 'button:has-text("Sil"), button:has-text("Remove"), [class*="remove"] button, .remove-item',
      updateButton: 'button:has-text("Güncelle"), button:has-text("Update"), .update-cart',
      checkoutButton: 'button:has-text("Ödeme"), button:has-text("Checkout"), a:has-text("Ödeme"), .checkout-btn',
      emptyCartMessage: 'text=Sepetiniz boş, text=Your cart is empty, text=No items in cart, text=Sepet boş',
      totalPrice: '[class*="total"], [class*="sum"], .total-price, .cart-total',
      continueShoppingButton: 'a:has-text("Alışverişe Devam"), button:has-text("Continue Shopping"), .continue-shopping',
      cartHeader: 'h1:has-text("Sepet"), h1:has-text("Cart"), [class*="cart-header"], .cart-title'
    };
  }

  /**
   * Wait for cart page to load
   */
  async waitForPageLoad() {
    await super.waitForPageLoad();
    
    // Wait for cart content or empty message
    try {
      await Promise.race([
        this.page.waitForSelector(this.selectors.cartItem, { timeout: 10000 }),
        this.page.waitForSelector(this.selectors.emptyCartMessage, { timeout: 10000 }),
        this.page.waitForSelector(this.selectors.cartHeader, { timeout: 10000 })
      ]);
    } catch (error) {
      console.log('⚠️ Cart page may not have loaded completely');
    }
  }

  /**
   * Check if cart has items
   * @returns {Promise<boolean>} Has items
   */
  async hasItems() {
    try {
      const items = this.page.locator(this.selectors.cartItem);
      const count = await items.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get number of items in cart
   * @returns {Promise<number>} Item count
   */
  async getItemCount() {
    try {
      const items = this.page.locator(this.selectors.cartItem);
      return await items.count();
    } catch {
      return 0;
    }
  }

  /**
   * Get all cart items
   * @returns {Promise<Array>} Cart items
   */
  async getCartItems() {
    const items = [];
    const itemElements = this.page.locator(this.selectors.cartItem);
    const count = await itemElements.count();
    
    for (let i = 0; i < count; i++) {
      const item = itemElements.nth(i);
      const itemData = {
        title: await this.getItemTitle(item),
        price: await this.getItemPrice(item),
        quantity: await this.getItemQuantity(item)
      };
      items.push(itemData);
    }
    
    return items;
  }

  /**
   * Get item title
   * @param {Object} itemElement - Item element
   * @returns {Promise<string>} Item title
   */
  async getItemTitle(itemElement) {
    try {
      const titleElement = itemElement.locator(this.selectors.itemTitle).first();
      return await titleElement.textContent();
    } catch {
      return 'Unknown Item';
    }
  }

  /**
   * Get item price
   * @param {Object} itemElement - Item element
   * @returns {Promise<string>} Item price
   */
  async getItemPrice(itemElement) {
    try {
      const priceElement = itemElement.locator(this.selectors.itemPrice).first();
      return await priceElement.textContent();
    } catch {
      return 'Price not available';
    }
  }

  /**
   * Get item quantity
   * @param {Object} itemElement - Item element
   * @returns {Promise<number>} Item quantity
   */
  async getItemQuantity(itemElement) {
    try {
      const quantityElement = itemElement.locator(this.selectors.itemQuantity).first();
      const value = await quantityElement.inputValue();
      return parseInt(value) || 1;
    } catch {
      return 1;
    }
  }

  /**
   * Update item quantity
   * @param {number} itemIndex - Item index (0-based)
   * @param {number} newQuantity - New quantity
   */
  async updateItemQuantity(itemIndex, newQuantity) {
    try {
      const items = this.page.locator(this.selectors.cartItem);
      const item = items.nth(itemIndex);
      const quantityInput = item.locator(this.selectors.itemQuantity).first();
      
      await quantityInput.fill(newQuantity.toString());
      
      // Click update button if available
      const updateButton = this.page.locator(this.selectors.updateButton).first();
      if (await updateButton.isVisible({ timeout: 2000 })) {
        await updateButton.click();
      }
      
      await this.waitForPageLoad();
      console.log(`✅ Item ${itemIndex + 1} quantity updated to ${newQuantity}`);
    } catch (error) {
      console.log(`⚠️ Failed to update item ${itemIndex + 1} quantity:`, error.message);
    }
  }

  /**
   * Remove item from cart
   * @param {number} itemIndex - Item index (0-based)
   */
  async removeItem(itemIndex) {
    try {
      const items = this.page.locator(this.selectors.cartItem);
      const item = items.nth(itemIndex);
      const removeButton = item.locator(this.selectors.removeButton).first();
      
      await removeButton.click();
      await this.waitForPageLoad();
      console.log(`✅ Item ${itemIndex + 1} removed from cart`);
    } catch (error) {
      console.log(`⚠️ Failed to remove item ${itemIndex + 1}:`, error.message);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      const items = this.page.locator(this.selectors.cartItem);
      const count = await items.count();
      
      for (let i = count - 1; i >= 0; i--) {
        await this.removeItem(i);
      }
      
      console.log('✅ Cart cleared');
    } catch (error) {
      console.log('⚠️ Failed to clear cart:', error.message);
    }
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    try {
      await this.clickElement(this.selectors.checkoutButton);
      await this.waitForPageLoad();
      console.log('✅ Proceeded to checkout');
    } catch (error) {
      console.log('⚠️ Failed to proceed to checkout:', error.message);
      throw error;
    }
  }

  /**
   * Continue shopping
   */
  async continueShopping() {
    try {
      await this.clickElement(this.selectors.continueShoppingButton);
      await this.waitForPageLoad();
      console.log('✅ Continued shopping');
    } catch (error) {
      console.log('⚠️ Failed to continue shopping:', error.message);
    }
  }

  /**
   * Get total price
   * @returns {Promise<string>} Total price
   */
  async getTotalPrice() {
    try {
      const totalElement = this.page.locator(this.selectors.totalPrice).first();
      return await totalElement.textContent();
    } catch {
      return 'Total not available';
    }
  }

  /**
   * Check if cart is empty
   * @returns {Promise<boolean>} Is empty
   */
  async isEmpty() {
    try {
      const emptyMessage = this.page.locator(this.selectors.emptyCartMessage).first();
      return await emptyMessage.isVisible({ timeout: 3000 });
    } catch {
      return !(await this.hasItems());
    }
  }

  /**
   * Validate cart contents
   * @param {Array} expectedItems - Expected items
   * @returns {Promise<boolean>} Validation result
   */
  async validateCartContents(expectedItems) {
    const actualItems = await this.getCartItems();
    
    if (actualItems.length !== expectedItems.length) {
      console.log(`❌ Item count mismatch. Expected: ${expectedItems.length}, Actual: ${actualItems.length}`);
      return false;
    }
    
    for (let i = 0; i < expectedItems.length; i++) {
      const expected = expectedItems[i];
      const actual = actualItems[i];
      
      if (expected.title && !actual.title.toLowerCase().includes(expected.title.toLowerCase())) {
        console.log(`❌ Item ${i + 1} title mismatch. Expected: ${expected.title}, Actual: ${actual.title}`);
        return false;
      }
    }
    
    console.log('✅ Cart contents validated successfully');
    return true;
  }
}

module.exports = CartPage;
