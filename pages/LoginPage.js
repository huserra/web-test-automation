// pages/LoginPage.js
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Locators
    this.selectors = {
      phoneInput: 'input[type="tel"], input[name*="phone"], input[id*="phone"], input[placeholder*="telefon"], input[placeholder*="phone"], input[id="txtPhoneNumberMobile"]',
      emailInput: 'input[type="email"], input[name*="email"], input[name*="Email"], input[placeholder*="email"], input[placeholder*="Email"], input[id*="email"], input[id*="Email"], input[class*="email"], input[class*="Email"]',
      passwordInput: 'input[type="password"], input[name*="password"], input[name*="Password"], input[id*="password"], input[id*="Password"], input[class*="password"], input[class*="Password"]',
      loginButton: 'button:has-text("Giriş Yap"), button:has-text("Login"), button:has-text("GİRİŞ YAP"), button[type="submit"], input[type="submit"], .login-btn, .btn-login',
      errorMessage: '.error, .alert, [class*="error"], .message-error, .validation-error',
      forgotPasswordLink: 'a:has-text("Şifremi Unuttum"), a:has-text("Forgot Password")'
    };
  }

  /**
   * Login with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async login(email, password) {
    console.log(' Starting login process...');
    
    try {
      // Wait for page to load completely
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(3000);
      
      // Check current URL to understand where we are
      const currentUrl = this.page.url();
      console.log(` Current URL: ${currentUrl}`);
      
      // If we're not on a login page, try to navigate to login
      if (!currentUrl.includes('login') && !currentUrl.includes('giris') && !currentUrl.includes('uye-girisi')) {
        console.log('🔄 Not on login page, trying to navigate to login...');
        
        // Try common login URLs
        const loginUrls = [
          'https://www.e-bebek.com/login',
          'https://www.e-bebek.com/giris',
          'https://www.e-bebek.com/uye-girisi',
          'https://www.e-bebek.com/account/login'
        ];
        
        for (const loginUrl of loginUrls) {
          try {
            console.log(` Trying login URL: ${loginUrl}`);
            await this.page.goto(loginUrl);
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000);
            
            // Check if we have login form elements
            const hasLoginForm = await this.page.locator('input[type="email"], input[type="tel"], input[type="password"]').count() > 0;
            if (hasLoginForm) {
              console.log(`✅ Successfully navigated to login page: ${loginUrl}`);
              break;
            }
          } catch (navError) {
            console.log(`❌ Failed to navigate to ${loginUrl}: ${navError.message}`);
          }
        }
      }
      
      // Wait for login form to appear
      console.log(' Waiting for login form to load...');
      await this.page.waitForTimeout(3000);
      
      // Find login inputs more carefully
      console.log(' Looking for login form inputs...');
    
      // First, find all input fields and log their details
      const allInputs = await this.page.locator('input').all();
      console.log(`Found ${allInputs.length} input fields total`);
      
      let phoneInput = null;
      let emailInput = null;
      let passwordInput = null;
      
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const inputType = await input.getAttribute('type');
        const inputName = await input.getAttribute('name');
        const inputId = await input.getAttribute('id');
        const inputPlaceholder = await input.getAttribute('placeholder');
        const inputClass = await input.getAttribute('class');
        
        console.log(`Input ${i}: type=${inputType}, name=${inputName}, id=${inputId}, placeholder=${inputPlaceholder}, class=${inputClass}`);
        
        // Find phone input (type="tel" or specific ID)
        if (!phoneInput && (inputType === 'tel' || inputId === 'txtPhoneNumberMobile' || 
            (inputId && inputId.toLowerCase().includes('phone')) ||
            (inputName && inputName.toLowerCase().includes('phone')))) {
          phoneInput = input;
          console.log(`✅ Phone input found at index ${i}`);
        }
        
        // Find email input (type="email" or text with email-related attributes)
        if (!emailInput && (inputType === 'email' || 
            (inputType === 'text' && (inputName && inputName.toLowerCase().includes('email')) ||
             (inputId && inputId.toLowerCase().includes('email')) ||
             (inputPlaceholder && inputPlaceholder.toLowerCase().includes('email')) ||
             (inputClass && inputClass.toLowerCase().includes('email'))))) {
          emailInput = input;
          console.log(`✅ Email input found at index ${i}`);
        }
        
        // Find password input (type="password")
        if (!passwordInput && inputType === 'password') {
          passwordInput = input;
          console.log(`✅ Password input found at index ${i}`);
        }
      }
      
      // Try email input first (user prefers email login)
      if (emailInput) {
        await emailInput.fill(email);
        console.log('✅ Email filled');
      } else if (phoneInput) {
        await phoneInput.fill(email); // Use email as phone number
        console.log('✅ Phone number filled');
        
        // Wait for password field to appear after phone input
        await this.page.waitForTimeout(5000);
        
        // Look for password input again after phone is filled
        const passwordInputs = await this.page.locator('input[type="password"]').all();
        if (passwordInputs.length > 0) {
          passwordInput = passwordInputs[0];
          console.log('✅ Password input found after phone input');
        } else {
          // Try to find password input with more specific selectors
          const passwordSelectors = [
            'input[type="password"]',
            'input[name*="password"]',
            'input[id*="password"]',
            'input[placeholder*="şifre"]',
            'input[placeholder*="password"]',
            'input[placeholder*="Şifre"]'
          ];
          
          for (const selector of passwordSelectors) {
            const elements = await this.page.locator(selector).all();
            if (elements.length > 0) {
              passwordInput = elements[0];
              console.log(`✅ Password input found with selector: ${selector}`);
              break;
            }
          }
          
          // If still no password input, try to trigger it by pressing Enter or Tab
          if (!passwordInput) {
            console.log('🔄 Trying to trigger password field...');
            await phoneInput.press('Enter');
            await this.page.waitForTimeout(2000);
            
            // Look for password input again
            const passwordInputsAfterEnter = await this.page.locator('input[type="password"]').all();
            if (passwordInputsAfterEnter.length > 0) {
              passwordInput = passwordInputsAfterEnter[0];
              console.log('✅ Password input found after pressing Enter');
            } else {
              // Try Tab key
              await phoneInput.press('Tab');
              await this.page.waitForTimeout(2000);
              
              const passwordInputsAfterTab = await this.page.locator('input[type="password"]').all();
              if (passwordInputsAfterTab.length > 0) {
                passwordInput = passwordInputsAfterTab[0];
                console.log('✅ Password input found after pressing Tab');
              }
            }
          }
        }
      } else {
        // If no email or phone input found, try to find any text input that might be for login
        const textInputs = await this.page.locator('input[type="text"]').all();
        if (textInputs.length > 0) {
          const firstTextInput = textInputs[0];
          await firstTextInput.fill(email);
          console.log('✅ Filled first text input with email');
          
          // Wait for password field to appear
          await this.page.waitForTimeout(3000);
          
          // Look for password input
          const passwordInputs = await this.page.locator('input[type="password"]').all();
          if (passwordInputs.length > 0) {
            passwordInput = passwordInputs[0];
            console.log('✅ Password input found after text input');
          }
        } else {
          throw new Error('No phone, email, or text input found for login');
        }
      }
      
      if (!passwordInput) {
        // Try to find password input with different selectors
        const passwordSelectors = [
          'input[type="password"]',
          'input[name*="password"]',
          'input[id*="password"]',
          'input[placeholder*="şifre"]',
          'input[placeholder*="password"]'
        ];
        
        for (const selector of passwordSelectors) {
          const elements = await this.page.locator(selector).all();
          if (elements.length > 0) {
            passwordInput = elements[0];
            console.log(`✅ Password input found with selector: ${selector}`);
            break;
          }
        }
      }
      
      if (!passwordInput) {
        throw new Error('Password input not found');
      }
      
      // Fill password
      await passwordInput.fill(password);
      console.log('✅ Password filled');
      
      // Find and click login button
      const loginButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Giriş")',
        'button:has-text("Login")',
        'button:has-text("GİRİŞ YAP")',
        '.login-btn',
        '.btn-login',
        '[data-testid*="login"]',
        '[data-testid*="submit"]'
      ];
      
      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        const elements = await this.page.locator(selector).all();
        if (elements.length > 0) {
          loginButton = elements[0];
          console.log(`✅ Login button found with selector: ${selector}`);
          break;
        }
      }
      
      if (!loginButton) {
        throw new Error('Login button not found');
      }
      
      await loginButton.click();
      console.log('✅ Login button clicked');
      
      // Wait for navigation or success
      await this.page.waitForTimeout(5000);
      
      console.log('✅ Login process completed');
      
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if there's an error message
   * @returns {Promise<boolean>} Error status
   */
  async hasErrorMessage() {
    try {
      const errorElement = this.page.locator(this.selectors.errorMessage).first();
      return await errorElement.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    try {
      const errorElement = this.page.locator(this.selectors.errorMessage).first();
      return await errorElement.textContent();
    } catch {
      return 'Unknown error';
    }
  }

  /**
   * Check if login form is visible
   * @returns {Promise<boolean>} Form visibility
   */
  async isLoginFormVisible() {
    try {
      return await this.isElementVisible(this.selectors.emailInput) && 
             await this.isElementVisible(this.selectors.passwordInput);
    } catch {
      return false;
    }
  }

  /**
   * Clear login form
   */
  async clearForm() {
    await this.page.fill(this.selectors.emailInput, '');
    await this.page.fill(this.selectors.passwordInput, '');
  }
}

module.exports = LoginPage;
