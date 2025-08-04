# Test Automation Framework

A **production-grade, generic test automation framework** for web UI, API, and database testing. Built on top of [Playwright](https://playwright.dev/) and [Cucumber](https://cucumber.io/), this framework enables you to write powerful, maintainable, and readable tests using BDD Gherkin syntax (Given/When/Then) for any project or organization.

---

## 🚀 Quick Start

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run all BDD tests (UI, API, DB):**
   ```sh
   npm run bdd
   ```

---

## ⚡ Execution

You can run all or specific tagged BDD tests using the following commands:

| **Purpose**                | **Command**                                      |
|----------------------------|--------------------------------------------------|
| Run all BDD tests          | `npm run bdd`                                     |
| Run only @smoke tests      | `npm run bdd -- --tags "@smoke"`                 |
| Run only @regression tests | `npm run bdd -- --tags "@regression"`            |
| Run only @api tests        | `npm run bdd -- --tags "@api"`                   |
| Exclude @wip tests         | `npm run bdd -- --tags "not @wip"`               |

---

## 📊 Viewing Reports

After running your tests, you can generate and view reports as follows:

| **Report Type**         | **How to Generate**                                                                                 | **How to View**                        |
|------------------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------|
| Cucumber HTML Report   | `npm run report:cucumber`                                                                            | Open `cucumber-report.html` in browser  |
| Allure Report          | `npx allure generate allure-results --clean -o allure-report`<br>`npx allure open allure-report`     | Opens Allure report in browser          |

---

## 📁 Project Structure

```
features/
  ui/                  # UI Gherkin feature files
  api/                 # API Gherkin feature files
  db/                  # DB Gherkin feature files
  step-definitions/    # Step definitions for all features
  support/             # Custom Cucumber World and hooks
src/                   # Source code (page objects, utils, config, etc.)
tests/                 # (Optional) Playwright .spec.ts tests
```

---

## 🧑‍💻 Writing BDD Scenarios
- Write your scenarios in `.feature` files using Gherkin syntax (Given/When/Then).
- Implement the logic for each step in `.ts` files under `features/step-definitions/`.

### Example UI Feature (`features/ui/demoqa.feature`)
```gherkin
@smoke
Feature: DemoQA UI Testing

  Scenario: Fill out the Text Box form
    Given I am on the Text Box page
    When I fill in the form with name "John Doe" and email "john.doe@example.com"
    And I submit the form
    Then the output should show name "John Doe" and email "john.doe@example.com"
```

### Example UI Step Definitions (`features/step-definitions/ui.steps.ts`)
```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Helper to fill the text box form
async function fillTextBoxForm(page, name, email) {
  await page.fill('#userName', name);
  await page.fill('#userEmail', email);
}

Given('I am on the Text Box page', async function () {
  try {
    await this.page.goto('https://demoqa.com/text-box');
  } catch (err) {
    throw new Error(`Failed to navigate to Text Box page: ${err.message}`);
  }
});

When('I fill in the form with name {string} and email {string}', async function (name, email) {
  try {
    await fillTextBoxForm(this.page, name, email);
  } catch (err) {
    throw new Error(`Failed to fill form: ${err.message}`);
  }
});

When('I submit the form', async function () {
  try {
    await this.page.click('#submit');
  } catch (err) {
    throw new Error(`Failed to submit form: ${err.message}`);
  }
});

Then('the output should show name {string} and email {string}', async function (name, email) {
  try {
    await expect(this.page.locator('#output')).toBeVisible();
    await expect(this.page.locator('#name')).toContainText(name);
    await expect(this.page.locator('#email')).toContainText(email);
  } catch (err) {
    throw new Error(`Output validation failed: ${err.message}`);
  }
});
```

---

## 🏗️ Adding More Scenarios
- Add new `.feature` files for your UI, API, or DB scenarios.
- Implement corresponding step definitions in `features/step-definitions/`.
- Use tags like `@smoke`, `@regression`, `@api`, etc. for filtering.

---

## 🤝 Contributing & Extending
- The framework is designed to be **generic and extensible**.
- Add your own page objects, API clients, DB utilities, and custom step definitions as needed.
- For more details, see the `features/` directory and step definition files.

---

## 💡 Why Use This Framework?
- **Generic:** No vendor or project lock-in. Use for any web, API, or DB automation.
- **Readable:** Write tests in plain English using Gherkin.
- **Powerful:** Leverage Playwright’s speed and reliability.
- **Maintainable:** Organize tests and logic for large projects.
- **Reporting:** Get beautiful, actionable reports with Allure and Cucumber HTML.

---

For any questions, see the documentation or open an issue. Happy testing!