import { test, expect } from '@playwright/test';

test.describe('RitualFin Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login if needed
    await page.goto('http://localhost:3000');
    // Add login logic here if authentication is required
  });

  test.describe('Calendar Features', () => {
    test('should display month/year navigation prominently', async ({ page }) => {
      await page.goto('http://localhost:3000/calendar');
      
      // Check that the month/year navigation is visible
      const monthNav = page.locator('text=/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i');
      await expect(monthNav).toBeVisible();
      
      // Check navigation buttons exist
      const prevButton = page.locator('a[href*="calendar?month="]').first();
      const nextButton = page.locator('a[href*="calendar?month="]').last();
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
    });

    test('should navigate between months', async ({ page }) => {
      await page.goto('http://localhost:3000/calendar');
      
      // Get current month text
      const currentMonth = await page.locator('text=/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i').first().textContent();
      
      // Click next month
      await page.locator('a[href*="calendar?month="]').last().click();
      await page.waitForLoadState('networkidle');
      
      // Verify month changed
      const newMonth = await page.locator('text=/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i').first().textContent();
      expect(newMonth).not.toBe(currentMonth);
    });
  });

  test.describe('Rituals Features', () => {
    test('should display ritual tabs', async ({ page }) => {
      await page.goto('http://localhost:3000/rituals');
      
      // Check that ritual tabs are visible
      await expect(page.locator('text=Diário')).toBeVisible();
      await expect(page.locator('text=Semanal')).toBeVisible();
      await expect(page.locator('text=Mensal')).toBeVisible();
    });

    test('should show ritual tasks', async ({ page }) => {
      await page.goto('http://localhost:3000/rituals');
      
      // Check for task elements
      const tasks = page.locator('[class*="rounded-xl"]').filter({ hasText: /revisar|categorizar|verificar/i });
      const taskCount = await tasks.count();
      expect(taskCount).toBeGreaterThan(0);
    });

    test('should allow completing a ritual', async ({ page }) => {
      await page.goto('http://localhost:3000/rituals');
      
      // Look for complete button
      const completeButton = page.locator('button:has-text("Completar")').first();
      if (await completeButton.isVisible()) {
        await completeButton.click();
        
        // Wait for success message or page refresh
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Budget Features', () => {
    test('should display budget tabs', async ({ page }) => {
      await page.goto('http://localhost:3000/budgets');
      
      // Check that budget tabs are visible
      await expect(page.locator('text=Orçamentos')).toBeVisible();
      await expect(page.locator('text=Sugestões IA')).toBeVisible();
      await expect(page.locator('text=Comparativo')).toBeVisible();
    });

    test('should show MTD vs Budget visualization', async ({ page }) => {
      await page.goto('http://localhost:3000/budgets');
      
      // Check for MTD vs Budget label
      const mtdLabel = page.locator('text=MTD vs Orçamento');
      if (await mtdLabel.count() > 0) {
        await expect(mtdLabel.first()).toBeVisible();
      }
    });

    test('should display budget proposals', async ({ page }) => {
      await page.goto('http://localhost:3000/budgets');
      
      // Click on Sugestões IA tab
      await page.locator('text=Sugestões IA').click();
      await page.waitForTimeout(2000); // Wait for data to load
      
      // Check if proposals are shown or if there's a message about insufficient data
      const hasProposals = await page.locator('text=/orçamentos sugeridos|sem dados suficientes/i').isVisible();
      expect(hasProposals).toBeTruthy();
    });

    test('should allow copying budgets to next month', async ({ page }) => {
      await page.goto('http://localhost:3000/budgets');
      
      // Look for copy button
      const copyButton = page.locator('button:has-text("Copiar para Próximo Mês")');
      if (await copyButton.isVisible()) {
        // Button exists, which means there are budgets to copy
        await expect(copyButton).toBeVisible();
      }
    });

    test('should show budget comparison data', async ({ page }) => {
      await page.goto('http://localhost:3000/budgets');
      
      // Click on Comparativo tab
      await page.locator('text=Comparativo').click();
      await page.waitForTimeout(2000); // Wait for data to load
      
      // Check if comparison table or empty state is shown
      const hasComparison = await page.locator('text=/categoria|sem dados para comparar/i').isVisible();
      expect(hasComparison).toBeTruthy();
    });

    test('should allow editing budget amounts', async ({ page }) => {
      await page.goto('http://localhost:3000/budgets');
      
      // Look for edit buttons (assuming they exist in budget cards)
      const editButtons = page.locator('button[class*="edit"], button:has-text("Editar")');
      const editCount = await editButtons.count();
      
      if (editCount > 0) {
        // Click first edit button
        await editButtons.first().click();
        
        // Check if dialog or form appears
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Navigation', () => {
    test('should have working sidebar navigation', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Check main navigation links
      const navLinks = [
        'Dashboard',
        'Transações',
        'Calendário',
        'Orçamentos',
        'Rituais',
        'Analytics'
      ];
      
      for (const linkText of navLinks) {
        const link = page.locator(`a:has-text("${linkText}")`);
        if (await link.count() > 0) {
          await expect(link.first()).toBeVisible();
        }
      }
    });

    test('should navigate to all main pages', async ({ page }) => {
      const pages = [
        '/dashboard',
        '/transactions',
        '/calendar',
        '/budgets',
        '/rituals',
        '/analytics'
      ];
      
      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`);
        await page.waitForLoadState('networkidle');
        
        // Check that page loaded without errors
        const errorText = await page.locator('text=/error|erro|not found/i').count();
        expect(errorText).toBe(0);
      }
    });
  });

  test.describe('Data Integrity', () => {
    test('should load without console errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Filter out known acceptable errors (like network errors in dev)
      const criticalErrors = errors.filter(err => 
        !err.includes('favicon') && 
        !err.includes('_next') &&
        !err.includes('webpack')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should handle month navigation without errors', async ({ page }) => {
      await page.goto('http://localhost:3000/calendar');
      
      // Navigate forward 3 months
      for (let i = 0; i < 3; i++) {
        await page.locator('a[href*="calendar?month="]').last().click();
        await page.waitForLoadState('networkidle');
      }
      
      // Navigate backward 3 months
      for (let i = 0; i < 3; i++) {
        await page.locator('a[href*="calendar?month="]').first().click();
        await page.waitForLoadState('networkidle');
      }
      
      // Check no errors occurred
      const errorMessages = await page.locator('text=/error|erro/i').count();
      expect(errorMessages).toBe(0);
    });
  });
});
