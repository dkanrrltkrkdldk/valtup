import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { BudgetPage } from '../pages/budget.page';
import { ProductsPage } from '../pages/products.page';
import { OrdersPage } from '../pages/orders.page';

type AuthFixtures = {
  authenticatedPage: void;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  budgetPage: BudgetPage;
  productsPage: ProductsPage;
  ordersPage: OrdersPage;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    await use();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  budgetPage: async ({ page }, use) => {
    await use(new BudgetPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
});

export { expect };
