import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();
  });

  test('should display dashboard title', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.pageTitle).toHaveText('대시보드');
  });

  test('should display budget card', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.budgetCard).toBeVisible();
    await expect(dashboardPage.budgetValue).toBeVisible();
  });

  test('should display participants card', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.participantsCard).toBeVisible();
    await expect(dashboardPage.participantsValue).toBeVisible();
  });

  test('should display points card', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.pointsCard).toBeVisible();
    await expect(dashboardPage.pointsValue).toBeVisible();
  });

  test('should display numeric values in cards', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.waitForLoadingComplete();

    const budgetText = await dashboardPage.budgetValue.textContent();
    expect(budgetText).toMatch(/[\d,]+/);

    const participantsText = await dashboardPage.participantsValue.textContent();
    expect(participantsText).toMatch(/[\d,]+/);

    const pointsText = await dashboardPage.pointsValue.textContent();
    expect(pointsText).toMatch(/[\d,]+/);
  });
});
