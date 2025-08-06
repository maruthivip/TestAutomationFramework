# 🚀 AutomationFramework Run Book & Features Guide

---

## 1. Overview

**AutomationFramework** is a production-grade, generic test automation solution for Web UI, API, and Database testing. It leverages Playwright, Cucumber (BDD), and modern best practices for robust, maintainable, and readable test suites.

---

## 2. Capabilities 

| **Feature/Capability**         | **How to Experience / Use**                                                                                   |
|-------------------------------|---------------------------------------------------------------------------------------------------------------|
| **BDD Gherkin Support**       | Write `.feature` files in `features/` using Given/When/Then. Run with `npm run bdd`.                          |
| **UI Test Automation**        | Add UI scenarios in `features/ui/` and implement steps in `features/step-definitions/ui.steps.ts`.            |
| **API Test Automation**       | Add API scenarios in `features/api/` and implement steps in `features/step-definitions/api.steps.ts`.         |
| **DB Test Automation**        | Add DB scenarios in `features/db/` and implement steps in `features/step-definitions/db.steps.ts`.            |
| **Tagging & Filtering**       | Tag scenarios in `.feature` files (e.g., `@smoke`). Run with `npm run bdd -- --tags "@smoke"`.              |
| **Parallel Execution**        | Playwright runs tests in parallel by default. Configure in `playwright.config.ts`.                            |
| **Allure Reporting**          | After tests, run `npx allure generate allure-results --clean -o allure-report` and `npx allure open allure-report`. |
| **Cucumber HTML Reporting**   | Run `npm run report:cucumber` to generate `cucumber-report.html`.                                             |
| **Artifact Capture**          | On test failure, screenshots and HTML are saved in `screenshots/` and `logs/`.                                |
| **Debug Mode**                | Run `DEBUG=true npm run bdd` for headed browser and slow motion.                                              |
| **Pre-commit Hooks**          | Husky runs lint/format checks before commit. Try `git commit` with code changes.                              |
| **.env Support**              | Copy `.env.example` to `.env` and edit for your environment.                                                  |
| **Reusable Templates**        | Copy existing feature/step files as templates for new tests.                                                  |
| **Stateful Debugging**        | Use Playwright Inspector (`PWDEBUG=1 npm run bdd`) or VSCode breakpoints.                                     |
| **API Contract Testing**      | Use Dredd: `npx dredd api-description.yaml http://localhost:3000/api`.                                        |
| **Test Tag Analytics**        | Open `cucumber-report.html` and filter by tags.                                                               |
| **Extensible & Maintainable** | Add new page objects in `src/pages/`, utilities in `src/utils/`, and new step definitions as needed.           |

---

## 3. Setup (Local & CI/CD)

### **Local Setup**

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd playwright-healthcare-framework
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Install Playwright browsers**
   ```sh
   npx playwright install
   ```
4. **(Optional) Configure environment**
   ```sh
   cp .env.example .env
   # Edit .env as needed
   ```
5. **Verify installation**
   ```sh
   npm run type-check
   npm run lint
   ```
6. **Run a sample test**
   ```sh
   npm run bdd
   ```

### **CI/CD (GitHub Actions)**

- The workflow is in `.github/workflows/playwright-tests.yml`.
- Node.js 20 is used for compatibility with all dependencies.
- All jobs install dependencies and Playwright browsers before running tests.
- Artifacts and reports are uploaded for each run.

---

## 4. Project Structure

```
features/              # BDD feature files and step definitions
src/                   # Page objects, API clients, utilities, config
tests/                 # (Optional) Playwright .spec.ts tests
logs/, screenshots/    # Artifacts on failure
allure-results/, html-report/ # Test reports
test-data/             # Sample and generated test data
```

---

## 5. Running & Debugging Tests

| **Purpose**                | **Command**                                      |
|----------------------------|--------------------------------------------------|
| Run all BDD tests          | `npm run bdd`                                     |
| Run by tag                 | `npm run bdd -- --tags "@smoke"`                 |
| Debug mode (headed, slow)  | `DEBUG=true npm run bdd`                          |
| Cucumber HTML report       | `npm run report:cucumber`                         |
| Allure report              | `npx allure generate allure-results --clean -o allure-report`<br>`npx allure open allure-report` |
| API contract test (Dredd)  | `npx dredd api-description.yaml http://localhost:3000/api` |

---

## 6. Writing & Extending Tests

- **UI:** Add scenarios in `features/ui/`, implement in `features/step-definitions/ui.steps.ts`.
- **API:** Add scenarios in `features/api/`, implement in `features/step-definitions/api.steps.ts`.
- **DB:** Add scenarios in `features/db/`, implement in `features/step-definitions/db.steps.ts`.
- **Add new page objects:** Place in `src/pages/`.
- **Add new utilities:** Place in `src/utils/`.

---

## 7. Artifacts & Reporting

- **On failure:** Screenshots in `screenshots/`, HTML in `logs/`.
- **Allure report:** `allure-report/` (open with `npx allure open allure-report`)
- **Cucumber HTML report:** `cucumber-report.html`

---

## 8. Troubleshooting

- **Node version errors:** Ensure Node.js 20+ is used (see workflow and `.nvmrc` if present).
- **Dependency errors:** Run `npm install` and `npx playwright install`.
- **Test failures:** Check `logs/` and `screenshots/` for evidence.
- **Debugging:** Use `DEBUG=true npm run bdd` or Playwright Inspector.

---

## 9. Security & Best Practices

- **Never commit real credentials.** Use `.env` and GitHub secrets.
- **Rotate secrets if exposed.**
- **Review and update dependencies regularly.**
- **Artifacts and logs may contain sensitive data—handle accordingly.**

---

## 10. Support & Contribution

- **For issues:** Open a GitHub issue.
- **To extend:** Fork, branch, and submit a pull request.
- **For help:** See inline code comments, this run book, or ask your team.

---

**For any questions, see the documentation or open an issue. Happy testing!**
