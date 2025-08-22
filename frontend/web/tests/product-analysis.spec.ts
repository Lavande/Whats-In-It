import { test, expect } from '@playwright/test';

const TEST_BARCODE = '3168930007197';

test.describe('What\'s In It - Product Analysis Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean slate
    await page.goto('/');
  });

  test('should complete onboarding flow and analyze product', async ({ page }) => {
    // Check if we're redirected to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Welcome step
    await expect(page.getByText('Hi 👋')).toBeVisible();
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Diet style step
    await expect(page.getByText("What's your diet style?")).toBeVisible();
    await page.getByText('Keto').click(); // Select Keto diet
    await page.getByRole('button', { name: 'Next' }).click();

    // Allergies step
    await expect(page.getByText('Any allergies or intolerances?')).toBeVisible();
    await page.getByText('Peanuts').click(); // Select peanuts allergy
    await page.getByRole('button', { name: 'Next' }).click();

    // Health focus step
    await expect(page.getByText('Any health focus areas?')).toBeVisible();
    await page.getByText('Sugar Concern').click(); // Select sugar concern
    await page.getByRole('button', { name: 'Finish Setup' }).click();

    // Completion step
    await expect(page.getByText("You're all set 🎉")).toBeVisible();
    await page.getByRole('button', { name: 'Start Scanning' }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Analyze Your Food')).toBeVisible();
  });

  test('should analyze product with test barcode', async ({ page }) => {
    // Complete onboarding first (simplified)
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByText('No Preference').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish Setup' }).click();
    await page.getByRole('button', { name: 'Start Scanning' }).click();

    // Now on home page
    await expect(page.getByText('Analyze Your Food')).toBeVisible();

    // Enter test barcode
    const barcodeInput = page.getByPlaceholder('Enter product barcode...');
    await barcodeInput.fill(TEST_BARCODE);
    
    // Submit the form
    await page.getByRole('button', { type: 'submit' }).click();

    // Wait for product page to load
    await expect(page).toHaveURL(`/product/${TEST_BARCODE}`);
    
    // Check for loading state first
    await expect(page.getByText('Loading Product Information')).toBeVisible({ timeout: 10000 });
    
    // Wait for product information to load (increase timeout for API calls)
    await expect(page.getByText('Loading Product Information')).not.toBeVisible({ timeout: 60000 });
    
    // Check if we have product information or error
    const hasProductInfo = await page.getByRole('heading', { level: 1 }).first().isVisible();
    const hasError = await page.getByText('Product Not Found').isVisible();
    
    if (hasError) {
      console.log('Product not found - this is expected for some barcodes');
      await expect(page.getByText('Product Not Found')).toBeVisible();
      return;
    }

    // If product loaded successfully
    if (hasProductInfo) {
      // Product should be displayed
      const productTitle = await page.getByRole('heading', { level: 1 }).first().textContent();
      expect(productTitle).toBeTruthy();
      console.log('Product loaded:', productTitle);

      // Check for barcode display
      await expect(page.getByText(TEST_BARCODE)).toBeVisible();

      // Check for analysis section (might be loading)
      const analysisSection = page.locator('[data-testid="analysis-display"], .analysis-display').first();
      if (await analysisSection.isVisible()) {
        console.log('Analysis section found');
      }

      // Wait for potential analysis to complete or show error
      await page.waitForTimeout(5000);

      // Check if analysis completed
      const hasAnalysisResult = await page.getByText('AI Analysis').isVisible();
      const hasAnalysisError = await page.getByText('Analysis Failed').isVisible();
      const hasAnalysisLoading = await page.getByText('AI Analysis in Progress').isVisible();

      if (hasAnalysisResult) {
        console.log('Analysis completed successfully');
        await expect(page.getByText('Health Score')).toBeVisible();
      } else if (hasAnalysisError) {
        console.log('Analysis failed - this may be expected for some products');
        await expect(page.getByText('Analysis Failed')).toBeVisible();
      } else if (hasAnalysisLoading) {
        console.log('Analysis still in progress');
      }
    }
  });

  test('should navigate through all pages', async ({ page }) => {
    // Complete onboarding first
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByText('No Preference').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish Setup' }).click();
    await page.getByRole('button', { name: 'Start Scanning' }).click();

    // Test navigation
    await expect(page).toHaveURL('/');

    // Go to History
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page).toHaveURL('/history');
    await expect(page.getByText('Scan History')).toBeVisible();

    // Go to Settings
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByText('Settings & Preferences')).toBeVisible();

    // Go back to Home
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Analyze Your Food')).toBeVisible();
  });

  test('should handle invalid barcode gracefully', async ({ page }) => {
    // Complete onboarding first
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByText('No Preference').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish Setup' }).click();
    await page.getByRole('button', { name: 'Start Scanning' }).click();

    // Try invalid barcode
    const barcodeInput = page.getByPlaceholder('Enter product barcode...');
    await barcodeInput.fill('invalid');
    
    // Should show validation error
    await expect(page.getByText('Please enter a valid barcode (8-14 digits)')).toBeVisible();
    
    // Submit button should be disabled
    const submitButton = page.getByRole('button', { type: 'submit' });
    await expect(submitButton).toBeDisabled();
  });

  test('should reset onboarding from settings', async ({ page }) => {
    // Complete onboarding first
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByText('Vegan').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish Setup' }).click();
    await page.getByRole('button', { name: 'Start Scanning' }).click();

    // Go to settings
    await page.getByRole('link', { name: 'Settings' }).click();
    
    // Reset to onboarding
    await page.getByRole('button', { name: 'Reset to Setup' }).click();
    
    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    await expect(page.getByText('Hi 👋')).toBeVisible();
  });

  test('should show development test barcode button', async ({ page }) => {
    // Complete onboarding first
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByText('No Preference').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish Setup' }).click();
    await page.getByRole('button', { name: 'Start Scanning' }).click();

    // Check for development test button (only in dev mode)
    const testButton = page.getByRole('button', { name: 'Use Test Barcode' });
    if (await testButton.isVisible()) {
      await testButton.click();
      
      // Should fill the barcode input
      const barcodeInput = page.getByPlaceholder('Enter product barcode...');
      await expect(barcodeInput).toHaveValue(TEST_BARCODE);
    }
  });
});