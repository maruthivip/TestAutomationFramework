# AutomationFramework

A **production-grade, generic AutomationFramework** for web UI, API, and database testing. Built on top of [Playwright](https://playwright.dev/) and [Cucumber](https://cucumber.io/), this framework enables you to write powerful, maintainable, and readable tests using BDD Gherkin syntax (Given/When/Then) for any project or organization.

---

## 🚀 Capabilities

| **Feature**                | **Description**                                                                                 |
|----------------------------|-----------------------------------------------------------------------------------------------|
| BDD Gherkin Support        | Write tests in plain English using `.feature` files and step definitions                        |
| UI Test Automation         | Automate web UI flows using Playwright and Page Object Model                                    |
| API Test Automation        | Test REST and SOAP APIs, including contract testing with Dredd                                  |
| DB Test Automation         | Validate database state and queries in BDD scenarios                                            |
| Tagging & Filtering        | Run tests by tag (e.g., `@smoke`, `@regression`, `@api`)                                       |
| Parallel Execution         | Run tests in parallel for speed                                                                 |
| Allure Reporting           | Generate beautiful, interactive test reports                                                   |
| Cucumber HTML Reporting    | Generate human-readable HTML reports for BDD scenarios                                         |
| Artifact Capture           | Capture screenshots and HTML on failure for easy debugging                                      |
| Debug Mode                 | Run tests in headed mode with slow motion for step-by-step debugging                            |
| Pre-commit Hooks           | Lint and format code automatically before every commit                                          |
| .env Support               | Manage environment variables securely and flexibly                                              |
| Reusable Templates         | Scaffold new feature files and step definitions quickly                                         |
| Stateful Debugging         | Use Playwright Inspector and VSCode for interactive debugging                                   |
| API Contract Testing       | Validate your API against OpenAPI/Swagger specs with Dredd                                      |
| Test Tag Analytics         | Analyze test results by tag using Cucumber HTML report                                          |
| Extensible & Maintainable  | Add new page objects, step definitions, and utilities as needed                                 |

---

## 🛠️ Setup

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd playwright-healthcare-framework
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **(Optional) Copy and edit environment variables**
   ```sh
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. **Install Playwright browsers**
   ```sh
   npx playwright install
   ```

---

## ⚡ Common Commands

| **Purpose**                | **Command**                                      |
|----------------------------|--------------------------------------------------|
| Run all BDD tests          | `npm run bdd`                                     |
| Run only @smoke tests      | `npm run bdd -- --tags "@smoke"`                 |
| Run only @regression tests | `npm run bdd -- --tags "@regression"`            |
| Run only @api tests        | `npm run bdd -- --tags "@api"`                   |
| Exclude @wip tests         | `npm run bdd -- --tags "not @wip"`               |
| Debug mode (headed, slow)  | `DEBUG=true npm run bdd`                          |
| Cucumber HTML report       | `npm run report:cucumber`                         |
| Allure report              | `npx allure generate allure-results --clean -o allure-report`<br>`npx allure open allure-report` |
| API contract test (Dredd)  | `npx dredd api-description.yaml http://localhost:3000/api` |

---

## 📁 Project Structure

```
features/              # BDD feature files and step definitions
src/                   # Source code (page objects, utils, config, etc.)
tests/                 # (Optional) Playwright .spec.ts tests
logs/, screenshots/    # Artifacts captured on failure
allure-results/, html-report/ # Test reports
```

---

## 🧑‍💻 Writing BDD Scenarios
- Write your scenarios in `.feature` files using Gherkin syntax (Given/When/Then).
- Implement the logic for each step in `.ts` files under `features/step-definitions/`.
- Use tags like `@smoke`, `@regression`, `@api` for filtering and analytics.

---

## 🐞 Debugging & Troubleshooting
- **Debug mode:** Run with `DEBUG=true npm run bdd` for headed browser and slow motion.
- **Playwright Inspector:** Use Playwright’s built-in inspector for step-by-step debugging.
- **VSCode Debugger:** Set breakpoints in step definitions and use the "Run and Debug" panel.
- **Artifacts:** Check `logs/` and `screenshots/` for failure evidence.

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
