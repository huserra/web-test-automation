// support/hooks.js
require('dotenv').config();
const { Before, After, AfterAll, BeforeStep, AfterStep } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
// const { AllureRuntime, AllureStep } = require('allure-cucumberjs');

const isHeaded = String(process.env.HEADLESS || '').toLowerCase() === 'false';

// Initialize Allure runtime (disabled for now)
// const allureRuntime = new AllureRuntime({
//   resultsDir: path.join(process.cwd(), 'allure-results')
// });

// Ensure directories exist
const screenshotsDir = path.join(process.cwd(), 'screenshots');
const allureResultsDir = path.join(process.cwd(), 'allure-results');

[ screenshotsDir, allureResultsDir ].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

Before(async function () {
  // Initialize Allure test (disabled for now)
  // this.allure = allureRuntime.startTest();
  
  // Her senaryoda temiz context + sayfa
  if (!this.browser) {
    this.browser = await chromium.launch({ 
      headless: !isHeaded, 
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    });
  }
  this.context = await this.browser.newContext({ 
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: 'videos/',
      size: { width: 1280, height: 720 }
    }
  });
  this.page = await this.context.newPage();
  
  // Set default timeout
  this.page.setDefaultTimeout(30000);
  
  console.log(' Browser launched and page created');
});

BeforeStep(async function (step) {
  // Log step start
  console.log(` Starting step: ${step.pickleStep.text}`);
  
  // Start Allure step (disabled for now)
  // if (this.allure) {
  //   this.allureStep = this.allure.startStep(step.pickleStep.text);
  // }
  
  // Attach step info to Allure (if available)
  try {
    if (this.attach) {
      await this.attach(`Step: ${step.pickleStep.text}`, 'text/plain');
    }
  } catch (error) {
    console.log('ℹ️ Allure attach not available');
  }
});

AfterStep(async function (step) {
  // Take screenshot after each step
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotsDir, `step-${timestamp}.png`);
    const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Attach screenshot to Allure (disabled for now)
    // if (this.allureStep) {
    //   this.allureStep.addAttachment('Screenshot', screenshot, 'image/png');
    // }
    
    // Attach screenshot to Allure (if available)
    try {
      if (this.attach) {
        await this.attach(screenshot, 'image/png');
      }
    } catch (attachError) {
      console.log('ℹ️ Allure attach not available for screenshot');
    }
    
    console.log(`📸 Screenshot taken: ${screenshotPath}`);
  } catch (error) {
    console.log('⚠️ Failed to take screenshot:', error.message);
  }
  
  // Complete Allure step (disabled for now)
  // if (this.allureStep) {
  //   const status = step.result?.status || 'UNKNOWN';
  //   if (status === 'FAILED') {
  //     this.allureStep.status = 'failed';
  //     if (step.result?.message) {
  //       this.allureStep.details = step.result.message;
  //     }
  //   } else {
  //     this.allureStep.status = 'passed';
  //   }
  //   this.allureStep.endStep();
  // }
  
  // Log step completion
  const status = step.result?.status || 'UNKNOWN';
  console.log(` Step completed with status: ${status}`);
});

After(async function (scenario) {
  const scenarioName = scenario.pickle.name;
  const status = scenario.result?.status;
  
  console.log(`🏁 Scenario "${scenarioName}" finished with status: ${status}`);
  
  // Take final screenshot
  try {
    if (this.page) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(screenshotsDir, `scenario-${scenarioName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.png`);
      const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Attach final screenshot to Allure (disabled for now)
      // if (this.allure) {
      //   this.allure.addAttachment('Final Screenshot', screenshot, 'image/png');
      // }
      
      // Attach final screenshot to Allure (if available)
      try {
        if (this.attach) {
          await this.attach(screenshot, 'image/png');
        }
      } catch (attachError) {
        console.log('ℹ️ Allure attach not available for final screenshot');
      }
      
      console.log(`📸 Final screenshot: ${screenshotPath}`);
    }
  } catch (error) {
    console.log('⚠️ Failed to take final screenshot:', error.message);
  }
  
  // Complete Allure test (disabled for now)
  // if (this.allure) {
  //   this.allure.name = scenarioName;
  //   this.allure.status = status === 'PASSED' ? 'passed' : 'failed';
  //   if (status === 'FAILED' && scenario.result?.message) {
  //     this.allure.details = scenario.result.message;
  //   }
  //   this.allure.endTest();
  // }
  
  // Attach scenario info to Allure (if available)
  try {
    if (this.attach) {
      await this.attach(`Scenario: ${scenarioName}\nStatus: ${status}`, 'text/plain');
    }
  } catch (error) {
    console.log('ℹ️ Allure attach not available for scenario info');
  }
  
  // Close page and context
  if (this.page) await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});
});

AfterAll(async function () {
  if (this.browser) {
    await this.browser.close().catch(() => {});
    console.log('🔚 Browser closed');
  }
});
