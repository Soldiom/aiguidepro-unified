/**
 * Browser Automation Integration
 * Provides web automation capabilities for AI agents
 */

import { chromium, Browser, Page } from 'playwright';

export interface BrowserTask {
  url: string;
  actions: BrowserAction[];
  timeout?: number;
}

export interface BrowserAction {
  type: 'click' | 'fill' | 'navigate' | 'screenshot' | 'extract';
  selector?: string;
  value?: string;
  waitFor?: string;
}

export interface BrowserResult {
  success: boolean;
  data?: any;
  screenshot?: string;
  error?: string;
}

export class BrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.page = await this.browser.newPage();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize browser: ${message}`);
    }
  }

  async executeTask(task: BrowserTask): Promise<BrowserResult> {
    if (!this.page) {
      await this.initialize();
    }

    try {
      // Navigate to URL
      await this.page!.goto(task.url, {
        waitUntil: 'networkidle',
        timeout: task.timeout || 30000,
      });

      const results: any = {};

      // Execute actions
      for (const action of task.actions) {
        switch (action.type) {
          case 'navigate':
            await this.page!.goto(action.value!, {
              waitUntil: 'networkidle',
            });
            break;

          case 'click':
            if (action.selector) {
              await this.page!.click(action.selector);
              if (action.waitFor) {
                await this.page!.waitForSelector(action.waitFor);
              }
            }
            break;

          case 'fill':
            if (action.selector && action.value) {
              await this.page!.fill(action.selector, action.value);
            }
            break;

          case 'screenshot':
            const screenshot = await this.page!.screenshot();
            results.screenshot = screenshot.toString('base64');
            break;

          case 'extract':
            if (action.selector) {
              const element = await this.page!.$(action.selector);
              if (element) {
                const text = await element.textContent();
                results.extracted = text;
              }
            }
            break;
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }

  async extractData(url: string, selectors: Record<string, string>): Promise<any> {
    if (!this.page) {
      await this.initialize();
    }

    await this.page!.goto(url, { waitUntil: 'networkidle' });

    const data: Record<string, string> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      try {
        const element = await this.page!.$(selector);
        if (element) {
          data[key] = await element.textContent() || '';
        }
      } catch (error) {
        console.error(`Failed to extract ${key}:`, error);
      }
    }

    return data;
  }

  async screenshot(url: string): Promise<string> {
    if (!this.page) {
      await this.initialize();
    }

    await this.page!.goto(url, { waitUntil: 'networkidle' });
    const screenshot = await this.page!.screenshot();
    return screenshot.toString('base64');
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance
let browserInstance: BrowserAutomation | null = null;

export async function getBrowserInstance(): Promise<BrowserAutomation> {
  if (!browserInstance) {
    browserInstance = new BrowserAutomation();
    await browserInstance.initialize();
  }
  return browserInstance;
}

export async function closeBrowserInstance(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
