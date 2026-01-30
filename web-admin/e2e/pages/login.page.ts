import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly nicknameInput: Locator;
  readonly loginButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.nicknameInput = page.locator('input[type="text"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.pageTitle = page.locator('h1');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(nickname: string) {
    await this.nicknameInput.fill(nickname);
    await this.loginButton.click();
  }

  async loginAsAdmin() {
    await this.login('admin');
    await this.page.waitForURL('/');
  }
}
