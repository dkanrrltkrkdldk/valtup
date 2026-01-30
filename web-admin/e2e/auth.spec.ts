import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.pageTitle).toHaveText('관리자 로그인');
    await expect(loginPage.nicknameInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should login successfully with admin nickname', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    const dashboardPage = new DashboardPage(page);
    await expect(dashboardPage.pageTitle).toHaveText('대시보드');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing budget page without auth', async ({ page }) => {
    await page.goto('/budget');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing products page without auth', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing orders page without auth', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate between pages after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    await page.click('a[href="/budget"]');
    await expect(page).toHaveURL('/budget');

    await page.click('a[href="/products"]');
    await expect(page).toHaveURL('/products');

    await page.click('a[href="/orders"]');
    await expect(page).toHaveURL('/orders');

    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });
});
