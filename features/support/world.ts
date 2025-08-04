import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, Page, chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

class CustomWorld extends World {
  browser: Browser | undefined;
  page: Page | undefined;

  constructor(options: any) {
    super(options);
    this.browser = undefined;
    this.page = undefined;
  }

  // Launch browser in debug mode if process.env.DEBUG is set
  async openBrowser() {
    const debug = process.env.DEBUG === 'true';
    this.browser = await chromium.launch({ headless: !debug, slowMo: debug ? 200 : 0 });
    this.page = await this.browser.newPage();
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);