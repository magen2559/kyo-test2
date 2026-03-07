import { test, expect } from '@playwright/test';

test.describe('KYO Digital Ecosystem - Web Export Login & Inner Screens', () => {

    test('should load the authentication screen', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=KYŌ HAS').last()).toBeVisible({ timeout: 15000 });
        await expect(page.locator('input[placeholder="EMAIL OR PHONE"]').last()).toBeVisible();
        await expect(page.locator('text=LOGIN').last()).toBeVisible();
    });

    test('should sign up a dummy user and access inner screens', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Go to Sign Up
        await page.locator('text=SIGN UP').last().click();
        await expect(page.locator('text=VIP MEMBERSHIP').last()).toBeVisible();

        // Fill out the Sign Up form
        const randomEmail = `testuser_${Date.now()}@example.com`;
        const password = 'TestPassword123!';

        await page.locator('input[placeholder="FULL NAME"]').last().fill('Playwright Tester');
        await page.locator('input[placeholder="EMAIL OR PHONE"]').last().fill(randomEmail);

        // There are two password fields (PASSWORD and CONFIRM PASSWORD)
        const passwordFields = page.locator('input[placeholder="PASSWORD"]').last();
        await passwordFields.fill(password);

        const confirmPasswordField = page.locator('input[placeholder="CONFIRM PASSWORD"]').last();
        await confirmPasswordField.fill(password);

        // Click the checkbox
        // The checkbox is a TouchableOpacity, we can click the text next to it
        await page.locator('text=I agree to the').last().click();

        // Click Create Account
        await page.locator('text=CREATE ACCOUNT').last().click();

        // Now we wait to see what happens.
        // If Supabase requires email verification, we will see a success message on this screen.
        // If it auto-logs in, we will see the Home screen (e.g., "HOME" or "EVENTS" tabs).

        // We can use Promise.race to check which outcome happens
        const isEmailVerificationRequired = page.locator('text=Account created! Please check your email to verify.').first();
        const isHomeScreenLoaded = page.locator('text=HOME').first(); // Tab bar text

        await Promise.race([
            expect(isEmailVerificationRequired).toBeVisible({ timeout: 15000 }),
            expect(isHomeScreenLoaded).toBeVisible({ timeout: 15000 })
        ]);

        // If we made it to the home screen (auto-login), let's test inner screens
        if (await isHomeScreenLoaded.isVisible()) {
            // Test the Lineup Screen
            await page.locator('text=EVENTS').first().click();
            await expect(page.locator('text=UPCOMING').first()).toBeVisible();

            // Test Profile Screen
            await page.locator('text=PROFILE').first().click();
            await expect(page.locator('text=EDIT PROFILE').first()).toBeVisible();
        }
    });

});
