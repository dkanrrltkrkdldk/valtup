import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ProductsPage } from './pages/products.page';

test.describe('Products Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    const productsPage = new ProductsPage(page);
    await productsPage.goto();
  });

  test('should display products page title', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await expect(productsPage.pageTitle).toHaveText('상품 관리');
  });

  test('should display create product button', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await expect(productsPage.createButton).toBeVisible();
  });

  test('should display products table or empty state', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.waitForLoadingComplete();

    const hasProducts = await productsPage.productsTable.isVisible();
    const hasEmptyState = await productsPage.emptyState.isVisible().catch(() => false);

    expect(hasProducts || hasEmptyState).toBeTruthy();
  });

  test('should open create product modal', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.createButton.click();

    await expect(productsPage.modal).toBeVisible();
    await expect(productsPage.modalTitle).toHaveText('상품 등록');
  });

  test('should close modal when cancel is clicked', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.createButton.click();
    await expect(productsPage.modal).toBeVisible();

    await productsPage.closeModal();
    await expect(productsPage.modal).not.toBeVisible();
  });

  test('should fill product form', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.createButton.click();

    await productsPage.fillProductForm({
      name: '테스트 상품',
      description: '테스트 설명입니다',
      price: 5000,
      stock: 100,
      imageUrl: 'https://example.com/image.jpg',
    });

    await expect(productsPage.getInputByLabel('상품명')).toHaveValue('테스트 상품');
    await expect(productsPage.getInputByLabel('가격')).toHaveValue('5000');
    await expect(productsPage.getInputByLabel('재고')).toHaveValue('100');
  });

  test('should create new product', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const productName = `테스트 상품 ${Date.now()}`;

    await productsPage.createButton.click();
    await productsPage.fillProductForm({
      name: productName,
      description: '테스트 설명',
      price: 3000,
      stock: 50,
    });

    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/admin/products') && resp.request().method() === 'POST'
    );

    await productsPage.submitForm();
    await responsePromise;

    await expect(productsPage.modal).not.toBeVisible();
    await expect(page.locator(`text=${productName}`)).toBeVisible();
  });

  test('should open edit modal for existing product', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.waitForLoadingComplete();

    const rowCount = await productsPage.productRows.count();
    test.skip(rowCount === 0, 'No products to edit');

    await productsPage.getEditButton(0).click();

    await expect(productsPage.modal).toBeVisible();
    await expect(productsPage.modalTitle).toHaveText('상품 수정');
  });

  test('should update existing product', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.waitForLoadingComplete();

    const rowCount = await productsPage.productRows.count();
    test.skip(rowCount === 0, 'No products to edit');

    await productsPage.getEditButton(0).click();
    await expect(productsPage.modal).toBeVisible();

    await productsPage.getInputByLabel('가격').fill('9999');

    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/admin/products') && resp.request().method() === 'PUT'
    );

    await productsPage.submitForm();
    await responsePromise;

    await expect(productsPage.modal).not.toBeVisible();
  });

  test('should delete product', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.waitForLoadingComplete();

    const rowCount = await productsPage.productRows.count();
    test.skip(rowCount === 0, 'No products to delete');

    await productsPage.getDeleteButton(0).click();
    await expect(productsPage.modal).toBeVisible();

    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/admin/products') && resp.request().method() === 'DELETE'
    );

    await productsPage.confirmDelete();
    await responsePromise;

    await expect(productsPage.modal).not.toBeVisible();
  });

  test('should navigate pagination', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.waitForLoadingComplete();

    const isPrevDisabled = await productsPage.prevButton.isDisabled();
    const isNextDisabled = await productsPage.nextButton.isDisabled();

    test.skip(isPrevDisabled && isNextDisabled, 'Only one page of products');

    if (!isNextDisabled) {
      await productsPage.nextButton.click();
      await productsPage.waitForLoadingComplete();
      await expect(productsPage.prevButton).not.toBeDisabled();
    }
  });
});
