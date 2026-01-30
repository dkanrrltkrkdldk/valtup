import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForApiResponse(urlPattern: string | RegExp) {
    return this.page.waitForResponse(
      (resp) => {
        const url = resp.url();
        return typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      },
      { timeout: 10000 }
    );
  }

  get spinner(): Locator {
    return this.page.locator('.animate-spin');
  }

  async waitForLoadingComplete() {
    await this.spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  get errorMessage(): Locator {
    return this.page.locator('.text-red-500');
  }

  get successMessage(): Locator {
    return this.page.locator('.text-green-600, .bg-green-100');
  }
}
