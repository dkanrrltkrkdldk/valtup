import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { OrdersPage } from './pages/orders.page';

test.describe('Orders Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    const ordersPage = new OrdersPage(page);
    await ordersPage.goto();
  });

  test('should display orders page title', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await expect(ordersPage.pageTitle).toHaveText('주문 관리');
  });

  test('should display orders table or empty state', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const hasOrders = await ordersPage.ordersTable.isVisible();
    const hasEmptyState = await ordersPage.emptyState.isVisible().catch(() => false);

    expect(hasOrders || hasEmptyState).toBeTruthy();
  });

  test('should display order rows with data', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const rowCount = await ordersPage.orderRows.count();
    test.skip(rowCount === 0, 'No orders to display');

    const firstRow = ordersPage.orderRows.first();
    await expect(firstRow).toBeVisible();
  });

  test('should display order status badges', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const rowCount = await ordersPage.orderRows.count();
    test.skip(rowCount === 0, 'No orders to display');

    const statusBadge = ordersPage.getOrderStatus(0);
    await expect(statusBadge).toBeVisible();
  });

  test('should open cancel confirmation modal', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const rowCount = await ordersPage.orderRows.count();
    test.skip(rowCount === 0, 'No orders to cancel');

    const cancelButton = ordersPage.getCancelButton(0);
    const isVisible = await cancelButton.isVisible().catch(() => false);
    test.skip(!isVisible, 'No orders with cancel option');

    await cancelButton.click();

    await expect(ordersPage.modal).toBeVisible();
    await expect(ordersPage.modalTitle).toContainText('취소');
  });

  test('should close cancel modal when dismissed', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const rowCount = await ordersPage.orderRows.count();
    test.skip(rowCount === 0, 'No orders to cancel');

    const cancelButton = ordersPage.getCancelButton(0);
    const isVisible = await cancelButton.isVisible().catch(() => false);
    test.skip(!isVisible, 'No orders with cancel option');

    await cancelButton.click();
    await expect(ordersPage.modal).toBeVisible();

    await ordersPage.closeModal();
    await expect(ordersPage.modal).not.toBeVisible();
  });

  test('should cancel order', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const rowCount = await ordersPage.orderRows.count();
    test.skip(rowCount === 0, 'No orders to cancel');

    const cancelButton = ordersPage.getCancelButton(0);
    const isVisible = await cancelButton.isVisible().catch(() => false);
    test.skip(!isVisible, 'No orders with cancel option');

    await cancelButton.click();
    await expect(ordersPage.modal).toBeVisible();

    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/admin/orders') && resp.url().includes('/cancel')
    );

    await ordersPage.confirmCancel();
    await responsePromise;

    await expect(ordersPage.modal).not.toBeVisible();
  });

  test('should navigate pagination', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const isPrevDisabled = await ordersPage.prevButton.isDisabled();
    const isNextDisabled = await ordersPage.nextButton.isDisabled();

    test.skip(isPrevDisabled && isNextDisabled, 'Only one page of orders');

    if (!isNextDisabled) {
      await ordersPage.nextButton.click();
      await ordersPage.waitForLoadingComplete();
      await expect(ordersPage.prevButton).not.toBeDisabled();
    }
  });

  test('should display order details in table headers', async ({ page }) => {
    const ordersPage = new OrdersPage(page);
    await ordersPage.waitForLoadingComplete();

    const rowCount = await ordersPage.orderRows.count();
    test.skip(rowCount === 0, 'No orders to display');

    const headers = page.locator('thead th');
    await expect(headers).toHaveCount(5);
  });
});
