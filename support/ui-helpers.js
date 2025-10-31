const testDataManager = require('./test-data');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Enhanced click by text with retry mechanism
 */
async function clickByText(page, label, { first = false, retries = 3, timeout = 10000 } = {}) {
  const rx = new RegExp(escapeRegExp(label), 'i');
  const candidates = [
    page.getByRole('button', { name: rx }),
    page.getByRole('link', { name: rx }),
    page.locator(`[aria-label*="${label}"]`),
    page.locator(`text=${label}`)
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      for (const loc of candidates) {
        const target = first ? loc.first() : loc;
        if (await target.isVisible({ timeout: timeout / retries })) {
          await target.click({ timeout: timeout / retries });
          console.log(`✅ Clicked element with label "${label}" (attempt ${attempt})`);
          return;
        }
      }
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Element with label "${label}" not found to click after ${retries} attempts: ${error.message}`);
      }
      console.log(`⚠️ Attempt ${attempt} failed for "${label}", retrying...`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Enhanced fill field with retry mechanism
 */
async function fillField(page, placeholderOrLabel, value, { retries = 3, timeout = 10000 } = {}) {
  const rx = new RegExp(escapeRegExp(placeholderOrLabel), 'i');
  const locators = [
    page.getByPlaceholder(rx),
    page.getByLabel(rx),
    page.getByRole('textbox', { name: rx }),
    page.locator(`input[placeholder*="${placeholderOrLabel}"]`),
    page.locator(`input[name="${placeholderOrLabel}"]`),
    page.locator('input[type="email"], input[type="text"], input[type="password"]').first()
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      for (const l of locators) {
        const el = l.first();
        if (await el.isVisible({ timeout: timeout / retries })) {
          await el.clear();
          await el.fill(value);
          console.log(`✅ Filled field "${placeholderOrLabel}" with value "${value}" (attempt ${attempt})`);
          return;
        }
      }
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Field "${placeholderOrLabel}" not found to fill after ${retries} attempts: ${error.message}`);
      }
      console.log(`⚠️ Attempt ${attempt} failed for field "${placeholderOrLabel}", retrying...`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Wait for text to be visible with retry
 */
async function expectVisibleText(page, text, { timeout = 15000, retries = 3 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await page.waitForSelector(`text=${text}`, { state: 'visible', timeout: timeout / retries });
      console.log(`✅ Text "${text}" is visible (attempt ${attempt})`);
      return;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(`Text "${text}" not found after ${retries} attempts: ${error.message}`);
      }
      console.log(`⚠️ Attempt ${attempt} failed for text "${text}", retrying...`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Wait for element to be clickable
 */
async function waitForClickable(page, selector, { timeout = 15000 } = {}) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  await element.waitFor({ state: 'attached', timeout });
  
  // Check if element is enabled
  const isEnabled = await element.isEnabled();
  if (!isEnabled) {
    throw new Error(`Element ${selector} is not enabled`);
  }
  
  return element;
}

/**
 * Smart wait for page load
 */
async function waitForPageLoad(page, { timeout = 30000 } = {}) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout });
    await page.waitForLoadState('networkidle', { timeout: timeout / 2 });
    console.log('✅ Page loaded successfully');
  } catch (error) {
    console.log('⚠️ Page load timeout, continuing...');
  }
}

/**
 * Retry mechanism for any function
 */
async function retry(fn, { maxAttempts = 3, delay = 1000, context = {} } = {}) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn(context);
      if (attempt > 1) {
        console.log(`✅ Operation succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) {
        throw new Error(`Operation failed after ${maxAttempts} attempts: ${error.message}`);
      }
      console.log(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Take screenshot with timestamp
 */
async function takeScreenshot(page, name, { fullPage = true } = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const path = `screenshots/${filename}`;
  
  await page.screenshot({ path, fullPage });
  console.log(`📸 Screenshot saved: ${path}`);
  return { path, filename };
}

/**
 * Get random test data
 */
function getRandomTestData(type) {
  return testDataManager.getRandomProduct() || testDataManager.getRandomSearchTerm();
}

/**
 * Wait for element with multiple selectors
 */
async function waitForAnyElement(page, selectors, { timeout = 15000 } = {}) {
  const promises = selectors.map(selector => 
    page.waitForSelector(selector, { state: 'visible', timeout }).catch(() => null)
  );
  
  const results = await Promise.allSettled(promises);
  const successful = results.find(result => result.status === 'fulfilled' && result.value);
  
  if (successful) {
    return successful.value;
  }
  
  throw new Error(`None of the selectors found: ${selectors.join(', ')}`);
}

/**
 * Scroll element into view with retry
 */
async function scrollIntoView(page, selector, { timeout = 10000 } = {}) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded({ timeout });
  await page.waitForTimeout(500); // Wait for scroll animation
  console.log(`✅ Scrolled to element: ${selector}`);
}

/**
 * Check if element exists without throwing
 */
async function elementExists(page, selector, { timeout = 5000 } = {}) {
  try {
    await page.waitForSelector(selector, { state: 'attached', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get element text safely
 */
async function getElementText(page, selector, { timeout = 10000 } = {}) {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return await element.textContent();
  } catch (error) {
    console.log(`⚠️ Could not get text from ${selector}: ${error.message}`);
    return null;
  }
}

module.exports = { 
  clickByText, 
  fillField, 
  expectVisibleText, 
  escapeRegExp,
  waitForClickable,
  waitForPageLoad,
  retry,
  takeScreenshot,
  getRandomTestData,
  waitForAnyElement,
  scrollIntoView,
  elementExists,
  getElementText
};
