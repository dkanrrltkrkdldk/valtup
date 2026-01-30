import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class BudgetPage extends BasePage {
  readonly pageTitle: Locator;
  readonly totalBudget: Locator;
  readonly usedBudget: Locator;
  readonly remainingBudget: Locator;
  readonly newBudgetInput: Locator;
  readonly updateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1');
    this.totalBudget = page.locator('text=총 예산').locator('..').locator('p.text-2xl');
    this.usedBudget = page.locator('text=사용 예산').locator('..').locator('p.text-2xl');
    this.remainingBudget = page.locator('text=남은 예산').locator('..').locator('p.text-2xl');
    this.newBudgetInput = page.locator('input[type="number"]');
    this.updateButton = page.locator('button:has-text("예산 변경")');
  }

  async goto() {
    await this.page.goto('/budget');
  }

  async updateBudget(amount: number) {
    await this.newBudgetInput.fill(amount.toString());
    await this.updateButton.click();
  }
}
