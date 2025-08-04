import { test, expect } from '@playwright/test';

const BASE_URL = 'https://demoqa.com';

test.describe('DemoQA Sample Site - BDD Scenarios', () => {
  test('Given I am on the homepage, When the page loads, Then the title should contain "ToolsQA"', async ({ page }) => {
    // Given I am on the homepage
    await page.goto(BASE_URL);
    // When the page loads
    const title = await page.title();
    // Then the title should contain 'ToolsQA'
    expect(title).toContain('ToolsQA');
  });

  test('Given I am on the Text Box page, When I fill and submit the form, Then the output should match my input', async ({ page }) => {
    // Given I am on the Text Box page
    await page.goto(`${BASE_URL}/text-box`);
    // When I fill out the form
    await page.fill('#userName', 'John Doe');
    await page.fill('#userEmail', 'john.doe@example.com');
    await page.fill('#currentAddress', '123 Main St');
    await page.fill('#permanentAddress', '456 Elm St');
    await page.click('#submit');
    // Then the output should match my input
    await expect(page.locator('#output')).toBeVisible();
    await expect(page.locator('#name')).toContainText('John Doe');
    await expect(page.locator('#email')).toContainText('john.doe@example.com');
    await expect(page.locator('#currentAddress')).toContainText('123 Main St');
    await expect(page.locator('#permanentAddress')).toContainText('456 Elm St');
  });

  test('Given I am on the Elements page, When I click the "Check Box" menu, Then the Check Box section should be visible', async ({ page }) => {
    // Given I am on the Elements page
    await page.goto(`${BASE_URL}/elements`);
    // When I click the "Check Box" menu
    await page.click('text=Check Box');
    // Then the Check Box section should be visible
    await expect(page.locator('.main-header')).toContainText('Check Box');
  });

  test('Given I am on the Practice Form page, When I fill and submit the form, Then the confirmation modal should appear', async ({ page }) => {
    // Given I am on the Practice Form page
    await page.goto(`${BASE_URL}/automation-practice-form`);
    // When I fill out the form
    await page.fill('#firstName', 'Jane');
    await page.fill('#lastName', 'Smith');
    await page.fill('#userEmail', 'jane.smith@example.com');
    await page.click('label[for="gender-radio-2"]'); // Female
    await page.fill('#userNumber', '1234567890');
    await page.click('#submit');
    // Then the confirmation modal should appear
    await expect(page.locator('.modal-content')).toBeVisible();
    await expect(page.locator('#example-modal-sizes-title-lg')).toContainText('Thanks for submitting the form');
  });
});