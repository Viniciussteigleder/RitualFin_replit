import { test, expect } from '@playwright/test';

test.describe('RitualFin Happy Path E2E', () => {
  const randomId = Math.random().toString(36).substring(7);
  const testUser = {
    username: `user_${randomId}`,
    email: `test_${randomId}@example.com`,
    password: 'Password123!',
  };

  test('full user flow - signup to main features', async ({ page }) => {
    // 1. Signup
    await page.goto('/signup');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });
    console.log('✅ Signup and redirection to Dashboard successful');

    // 2. Check Dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    console.log('✅ Dashboard loaded');

    // 3. Navigate to Agenda (New Feature)
    await page.goto('/agenda');
    await expect(page.getByRole('heading', { name: 'Agenda de Pagamentos' })).toBeVisible();
    await expect(page.locator('text=Sua agenda está limpa')).toBeVisible(); // New user has empty agenda
    console.log('✅ Agenda page accessible and shows empty state for new user');

    // 4. Navigate to Rituals (New Feature)
    await page.goto('/rituals');
    await expect(page.getByRole('heading', { name: 'Fluxo Operacional' })).toBeVisible();
    // Check if "Minhas Intenções" is present
    await expect(page.locator('text=Minhas Intenções')).toBeVisible();
    console.log('✅ Rituals page accessible');

    // 5. Add a custom goal in Rituals
    await page.click('text=Adicionar');
    await page.fill('input[placeholder="Ex: Não gastar com delivery..."]', 'Comer saudável');
    await page.click('button:has-text("Ok")');
    await expect(page.locator('text=Comer saudável')).toBeVisible();
    console.log('✅ Custom ritual goal added successfully');

    // 6. Navigate to Goals
    await page.goto('/goals');
    await expect(page.getByRole('heading', { name: 'Previsão e Metas' })).toBeVisible();
    console.log('✅ Goals page accessible');

    // 7. Check Sidebar Navigation
    await page.goto('/');
    await expect(page.locator('nav').locator('text=Agenda')).toBeVisible();
    await expect(page.locator('nav').locator('text=Meus Rituais')).toBeVisible();
    console.log('✅ Sidebar links are present');
  });
});
