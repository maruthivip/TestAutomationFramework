import { Page, Locator, expect } from '@playwright/test';
import { PageElements } from '@/types/healthcare.types';

export abstract class BasePage {
  protected page: Page;
  protected url: string;
  protected elements: PageElements;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
    this.elements = {};
  }

  /**
   * Navigate to the page
   */
  async goto(): Promise<void> {
    if (!this.url) {
      throw new Error('URL not defined for this page');
    }
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get element by key from elements object
   */
  protected getElement(elementKey: string): Locator {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in page elements`);
    }
    return this.page.locator(element.selector);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(elementKey: string, timeout?: number): Promise<void> {
    const element = this.elements[elementKey];
    const elementTimeout = timeout || element?.timeout || 30000;
    await this.getElement(elementKey).waitFor({ 
      state: 'visible', 
      timeout: elementTimeout 
    });
  }

  /**
   * Click on element
   */
  async clickElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).click();
  }

  /**
   * Fill input field
   */
  async fillElement(elementKey: string, value: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).fill(value);
  }

  /**
   * Get text content of element
   */
  async getElementText(elementKey: string): Promise<string> {
    await this.waitForElement(elementKey);
    const text = await this.getElement(elementKey).textContent();
    return text || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(elementKey: string): Promise<boolean> {
    try {
      await this.waitForElement(elementKey);
      return await this.getElement(elementKey).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(elementKey: string): Promise<boolean> {
    await this.waitForElement(elementKey);
    return await this.getElement(elementKey).isEnabled();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(elementKey: string, option: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).selectOption(option);
  }

  /**
   * Upload file
   */
  async uploadFile(elementKey: string, filePath: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).setInputFiles(filePath);
  }

  /**
   * Take screenshot of the page
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ 
      path: `screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Scroll to element
   */
  async scrollToElement(elementKey: string): Promise<void> {
    await this.getElement(elementKey).scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).hover();
  }

  /**
   * Double click element
   */
  async doubleClickElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).dblclick();
  }

  /**
   * Right click element
   */
  async rightClickElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).click({ button: 'right' });
  }

  /**
   * Press key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text
   */
  async typeText(text: string): Promise<void> {
    await this.page.keyboard.type(text);
  }

  /**
   * Wait for specific time
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Check if page contains text
   */
  async containsText(text: string): Promise<boolean> {
    try {
      await expect(this.page.locator('body')).toContainText(text);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to contain text
   */
  async waitForElementText(elementKey: string, text: string): Promise<void> {
    await expect(this.getElement(elementKey)).toContainText(text);
  }

  /**
   * Get element attribute
   */
  async getElementAttribute(elementKey: string, attribute: string): Promise<string | null> {
    await this.waitForElement(elementKey);
    return await this.getElement(elementKey).getAttribute(attribute);
  }

  /**
   * Check element attribute
   */
  async hasElementAttribute(elementKey: string, attribute: string, value?: string): Promise<boolean> {
    const attributeValue = await this.getElementAttribute(elementKey, attribute);
    if (value) {
      return attributeValue === value;
    }
    return attributeValue !== null;
  }

  /**
   * Get all elements matching selector
   */
  protected getAllElements(elementKey: string): Locator {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in page elements`);
    }
    return this.page.locator(element.selector);
  }

  /**
   * Get element count
   */
  async getElementCount(elementKey: string): Promise<number> {
    return await this.getAllElements(elementKey).count();
  }

  /**
   * Get element by index
   */
  protected getElementByIndex(elementKey: string, index: number): Locator {
    return this.getAllElements(elementKey).nth(index);
  }

  /**
   * Click element by index
   */
  async clickElementByIndex(elementKey: string, index: number): Promise<void> {
    await this.getElementByIndex(elementKey, index).click();
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(elementKey: string): Promise<void> {
    await this.getElement(elementKey).waitFor({ state: 'hidden' });
  }

  /**
   * Wait for element to be attached
   */
  async waitForElementAttached(elementKey: string): Promise<void> {
    await this.getElement(elementKey).waitFor({ state: 'attached' });
  }

  /**
   * Wait for element to be detached
   */
  async waitForElementDetached(elementKey: string): Promise<void> {
    await this.getElement(elementKey).waitFor({ state: 'detached' });
  }

  /**
   * Clear input field
   */
  async clearElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).clear();
  }

  /**
   * Focus on element
   */
  async focusElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).focus();
  }

  /**
   * Blur element
   */
  async blurElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).blur();
  }

  /**
   * Check checkbox or radio button
   */
  async checkElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).check();
  }

  /**
   * Uncheck checkbox
   */
  async uncheckElement(elementKey: string): Promise<void> {
    await this.waitForElement(elementKey);
    await this.getElement(elementKey).uncheck();
  }

  /**
   * Check if element is checked
   */
  async isElementChecked(elementKey: string): Promise<boolean> {
    await this.waitForElement(elementKey);
    return await this.getElement(elementKey).isChecked();
  }

  /**
   * Abstract method to be implemented by child classes
   * Should define page-specific validation logic
   */
  abstract isPageLoaded(): Promise<boolean>;
}