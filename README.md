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
3. **Run only tagged tests (e.g., @smoke or @regression):**
   ```sh
   npm run bdd -- --tags "@smoke"
   npm run bdd -- --tags "@regression"
   ```
4. **View Allure report:**
   ```sh
   npx allure generate allure-results --clean -o allure-report
   npx allure open allure-report
   ```
5. **Generate Cucumber HTML report:**
   ```sh
   npm run report:cucumber
   # Open cucumber-report.html in your browser
   ```

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

Given('I am on the Text Box page', async function () {
  await this.page.goto('https://demoqa.com/text-box');
});

When('I fill in the form with name {string} and email {string}', async function (name, email) {
  await this.page.fill('#userName', name);
  await this.page.fill('#userEmail', email);
});

When('I submit the form', async function () {
  await this.page.click('#submit');
});

Then('the output should show name {string} and email {string}', async function (name, email) {
  await expect(this.page.locator('#output')).toBeVisible();
  await expect(this.page.locator('#name')).toContainText(name);
  await expect(this.page.locator('#email')).toContainText(email);
});
```

---

## 🏗️ Adding More Scenarios
- Add new `.feature` files for your UI, API, or DB scenarios.
- Implement corresponding step definitions in `features/step-definitions/`.
- Use tags like `@smoke`, `@regression`, `@api`, etc. for filtering.

---

## 📊 Reporting
- **Allure reporting** is integrated for Playwright and can be extended for Cucumber.
- **Cucumber HTML reporting** is available for BDD scenarios.

### Allure Report
```sh
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

### Cucumber HTML Report
```sh
npm run report:cucumber
# Open cucumber-report.html in your browser
```

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