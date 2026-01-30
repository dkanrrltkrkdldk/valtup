import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly createButton: Locator;
  readonly productsTable: Locator;
  readonly productRows: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly pageIndicator: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1');
    this.createButton = page.locator('button:has-text("상품 등록")');
    this.productsTable = page.locator('table');
    this.productRows = page.locator('tbody tr');
    this.prevButton = page.locator('button:has-text("이전")');
    this.nextButton = page.locator('button:has-text("다음")');
    this.pageIndicator = page.locator('text=/\\d+ \\/ \\d+/');
    this.emptyState = page.locator('text=등록된 상품이 없습니다');
  }

  async goto() {
    await this.page.goto('/products');
  }

  get modal(): Locator {
    return this.page.locator('.fixed.inset-0');
  }

  get modalTitle(): Locator {
    return this.modal.locator('h3');
  }

  get nameInput(): Locator {
    return this.page.locator('input').filter({ hasText: '' }).first();
  }

  getInputByLabel(label: string): Locator {
    return this.page.locator(`label:has-text("${label}")`).locator('..').locator('input');
  }

  async fillProductForm(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
  }) {
    await this.getInputByLabel('상품명').fill(data.name);
    if (data.description) {
      await this.getInputByLabel('설명').fill(data.description);
    }
    await this.getInputByLabel('가격').fill(data.price.toString());
    await this.getInputByLabel('재고').fill(data.stock.toString());
    if (data.imageUrl) {
      await this.getInputByLabel('이미지').fill(data.imageUrl);
    }
  }

  async submitForm() {
    await this.modal.locator('button[type="submit"]').click();
  }

  async closeModal() {
    await this.modal.locator('button:has-text("취소")').click();
  }

  getEditButton(row: number): Locator {
    return this.productRows.nth(row).locator('button:has-text("수정")');
  }

  getDeleteButton(row: number): Locator {
    return this.productRows.nth(row).locator('button:has-text("삭제")');
  }

  async confirmDelete() {
    await this.modal.locator('button:has-text("삭제")').last().click();
  }
}
