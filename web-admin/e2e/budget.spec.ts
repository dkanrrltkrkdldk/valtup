import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { BudgetPage } from './pages/budget.page';

test.describe('Budget Page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    const budgetPage = new BudgetPage(page);
    await budgetPage.goto();
  });

  test('should display budget page title', async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await expect(budgetPage.pageTitle).toHaveText('예산 관리');
  });

  test('should display budget information', async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.waitForLoadingComplete();

    await expect(budgetPage.totalBudget).toBeVisible();
    await expect(budgetPage.usedBudget).toBeVisible();
    await expect(budgetPage.remainingBudget).toBeVisible();
  });

  test('should display budget edit form', async ({ page }) => {
    const budgetPage = new BudgetPage(page);

    await expect(budgetPage.newBudgetInput).toBeVisible();
    await expect(budgetPage.updateButton).toBeVisible();
  });

  test('should show numeric values for budget', async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.waitForLoadingComplete();

    const totalText = await budgetPage.totalBudget.textContent();
    expect(totalText).toMatch(/[\d,]+/);

    const usedText = await budgetPage.usedBudget.textContent();
    expect(usedText).toMatch(/[\d,]+/);

    const remainingText = await budgetPage.remainingBudget.textContent();
    expect(remainingText).toMatch(/[\d,]+/);
  });

  test('should allow entering new budget value', async ({ page }) => {
    const budgetPage = new BudgetPage(page);

    await budgetPage.newBudgetInput.fill('150000');
    await expect(budgetPage.newBudgetInput).toHaveValue('150000');
  });

  test('should update budget when form is submitted', async ({ page }) => {
    const budgetPage = new BudgetPage(page);
    await budgetPage.waitForLoadingComplete();

    await budgetPage.updateBudget(200000);

    await page.waitForResponse(resp => resp.url().includes('/api/admin/budget') && resp.request().method() === 'PUT');

    await expect(budgetPage.totalBudget).toBeVisible();
  });
});
