import { Before, After, AfterStep } from '@cucumber/cucumber';
import fs from 'fs';
import path from 'path';

Before(async function () {
  await this.openBrowser();
});

AfterStep(async function ({ result, pickle }, context) {
  if (result?.status === 'FAILED' && context.page) {
    const scenarioName = pickle.name.replace(/\W+/g, '_');
    const screenshotPath = path.join('screenshots', `${scenarioName}.png`);
    const htmlPath = path.join('logs', `${scenarioName}.html`);
    await context.page.screenshot({ path: screenshotPath, fullPage: true });
    fs.writeFileSync(htmlPath, await context.page.content());
    context.attachments = context.attachments || [];
    context.attachments.push({ screenshot: screenshotPath, html: htmlPath });
  }
});

After(async function () {
  await this.closeBrowser();
});