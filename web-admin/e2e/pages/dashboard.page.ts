import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly budgetCard: Locator;
  readonly participantsCard: Locator;
  readonly pointsCard: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1');
    this.budgetCard = page.locator('text=오늘 예산').locator('..').locator('..');
    this.participantsCard = page.locator('text=오늘 참여자').locator('..').locator('..');
    this.pointsCard = page.locator('text=지급 포인트').locator('..').locator('..');
  }

  async goto() {
    await this.page.goto('/');
  }

  get budgetValue(): Locator {
    return this.budgetCard.locator('.text-indigo-600');
  }

  get participantsValue(): Locator {
    return this.participantsCard.locator('.text-green-600');
  }

  get pointsValue(): Locator {
    return this.pointsCard.locator('.text-orange-600');
  }
}
