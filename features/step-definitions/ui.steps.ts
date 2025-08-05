import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';

// Helper to fill the text box form
async function fillTextBoxForm(page: Page, name: string, email: string) {
  await page.fill('#userName', name);
  await page.fill('#userEmail', email);
}

Given('I am on the Text Box page', async function () {
  try {
    await this.page.goto('https://demoqa.com/text-box');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to navigate to Text Box page: ${message}`);
  }
});

When('I fill in the form with name {string} and email {string}', async function (name: string, email: string) {
  try {
    await fillTextBoxForm(this.page, name, email);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to fill form: ${message}`);
  }
});

When('I submit the form', async function () {
  try {
    await this.page.click('#submit');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to submit form: ${message}`);
  }
});

Then('the output should show name {string} and email {string}', async function (name: string, email: string) {
  try {
    await expect(this.page.locator('#output')).toBeVisible();
    await expect(this.page.locator('#name')).toContainText(name);
    await expect(this.page.locator('#email')).toContainText(email);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Output validation failed: ${message}`);
  }
});