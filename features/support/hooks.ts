import { Before, After, AfterStep, ITestCaseHookParameter } from '@cucumber/cucumber';
import fs from 'fs';
import path from 'path';

Before(function () {
  // Attach metadata and links as text/uri-list for Allure and Cucumber HTML reports
  this.attach(`Framework: AutomationFramework\nEnvironment: ${process.env.TEST_ENV || 'local'}\nBuild: ${process.env.BUILD_NUMBER || 'dev'}\nCommit: ${process.env.GIT_COMMIT || 'local'}`, 'text/plain');
  this.attach('https://your-jira-instance/browse/PROJECT-123', 'text/uri-list');
  this.attach('https://your-docs-url', 'text/uri-list');
  return this.openBrowser();
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
    // Attach screenshot and HTML to Allure/Cucumber HTML report
    this.attach(fs.readFileSync(screenshotPath), 'image/png');
    this.attach(fs.readFileSync(htmlPath), 'text/html');
    // Attach video if available
    if (this.page.video) {
      const video = await this.page.video();
      if (video) {
        const videoPath = await video.path();
        this.attach(fs.readFileSync(videoPath), 'video/webm');
      }
    }
  }
});

After(async function () {
  await this.closeBrowser();
});