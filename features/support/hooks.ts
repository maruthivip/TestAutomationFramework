import { Before, After, AfterStep, ITestCaseHookParameter } from '@cucumber/cucumber';
import fs from 'fs';
import path from 'path';

Before(async function () {
  await this.openBrowser();
});

AfterStep(async function (this: any, testStep: ITestCaseHookParameter) {
  const { result, pickle } = testStep;
  if (result?.status === 'FAILED' && this.page) {
    const scenarioName = pickle.name.replace(/\W+/g, '_');
    const screenshotPath = path.join('screenshots', `${scenarioName}.png`);
    const htmlPath = path.join('logs', `${scenarioName}.html`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    fs.writeFileSync(htmlPath, await this.page.content());
    this.attachments = this.attachments || [];
    this.attachments.push({ screenshot: screenshotPath, html: htmlPath });
  }
});

After(async function () {
  await this.closeBrowser();
});