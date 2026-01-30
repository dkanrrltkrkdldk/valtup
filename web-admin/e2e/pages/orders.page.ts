import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class OrdersPage extends BasePage {
  readonly pageTitle: Locator;
  readonly ordersTable: Locator;
  readonly orderRows: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly pageIndicator: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1');
    this.ordersTable = page.locator('table');
    this.orderRows = page.locator('tbody tr');
    this.prevButton = page.locator('button:has-text("이전")');
    this.nextButton = page.locator('button:has-text("다음")');
    this.pageIndicator = page.locator('text=/\\d+ \\/ \\d+/');
    this.emptyState = page.locator('text=주문 내역이 없습니다');
  }

  async goto() {
    await this.page.goto('/orders');
  }

  get modal(): Locator {
    return this.page.locator('.fixed.inset-0');
  }

  get modalTitle(): Locator {
    return this.modal.locator('h3');
  }

  getCancelButton(row: number): Locator {
    return this.orderRows.nth(row).locator('button:has-text("취소")');
  }

  async confirmCancel() {
    await this.modal.locator('button:has-text("취소하기")').click();
  }

  async closeModal() {
    await this.modal.locator('button:has-text("닫기")').click();
  }

  getOrderStatus(row: number): Locator {
    return this.orderRows.nth(row).locator('span.rounded-full');
  }
}
