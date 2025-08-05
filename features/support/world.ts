import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, Page, chromium, BrowserContext } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

class CustomWorld extends World {
  browser: Browser | undefined;
  context: BrowserContext | undefined;
  page: Page | undefined;
  videoPath: string | undefined;

  constructor(options: any) {
    super(options);
    this.browser = undefined;
    this.context = undefined;
    this.page = undefined;
    this.videoPath = undefined;
  }

  // Launch browser in debug mode if process.env.DEBUG is set, and enable video capture
  async openBrowser() {
    const debug = process.env.DEBUG === 'true';
    this.browser = await chromium.launch({ headless: !debug, slowMo: debug ? 200 : 0 });
    this.context = await this.browser.newContext({
      recordVideo: { dir: 'videos/' }
    });
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);