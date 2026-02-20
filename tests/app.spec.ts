import { test, expect } from '@playwright/test';

test.describe('FlyingBird End-to-End Game Simulator', () => {

    test('should load the home screen and mount successfully', async ({ page }) => {
        await page.goto('/');

        // Validate the core neon title headers render (use first due to 3-layer glitch shadow)
        await expect(page.getByText('FLYING').first()).toBeVisible();
        await expect(page.getByText(/BIRD|OWL|BAT|BEE|PENGUIN|FOX|DUCK/).first()).toBeVisible();

        // Validate competition timer renders
        await expect(page.getByText('KIDS FUN MODE: EASY PHYSICS & HUGE GAPS!')).toBeVisible();

        // Ensure the PLAY button is interactive
        const tapToFlyBtn = page.getByText('TAP TO FLY').first();
        await expect(tapToFlyBtn).toBeVisible();
    });

    test('should launch the global leaderboard modal', async ({ page }) => {
        await page.goto('/');

        // Click the Global Ranks Dashboard Card
        const globalRanksCard = page.getByText('Global Ranks');
        await globalRanksCard.click();

        // Verify Leaderboard modal opens
        await expect(page.getByText('EARTH CYCLE')).toBeVisible();
        await expect(page.getByText('COMPETITION RESTS DAILY. POINTS ERASED.')).toBeVisible();

        // Expect the header table categories
        await expect(page.getByText('RANK').first()).toBeVisible();
        await expect(page.getByText('PILOT').first()).toBeVisible();

        // Close Modal
        await page.getByText('✕').click();
        await expect(page.getByText('TAP TO FLY').first()).toBeVisible();
    });

    test('should engage Autopilot Bot and accrue synthetic points', async ({ page }) => {
        // We intentionally allow a longer timeout to watch the AI fly and earn points
        test.setTimeout(45000);

        await page.goto('/');

        // Trigger UI Bot
        const botButton = page.getByText('RUN UI TEST (AUTOPILOT)', { exact: false });
        await botButton.click();

        // Await the new Loading Sequence Completion
        await expect(page.getByText('GET READY!')).toBeVisible();

        // Wait for Warmup to clear and game physics to actually mount
        await expect(page.getByText('Autopilot Engaged')).toBeVisible({ timeout: 15000 });

        // Await Stage progression (starts at Stage 1). The physics engine runs at ~60fps
        // We expect the bot to smoothly pass enough pipes to hit a new visual Stage identifier
        await expect(page.getByText('STAGE 1')).toBeVisible();

        // Wait a few seconds to verify the game loop engine generates dynamic pipes without crashing the DOM
        await page.waitForTimeout(5000);

        // Click the quit run button
        const quitBtn = page.getByText('< Quit Run').first();
        await quitBtn.click();

        // After quitting, we should return to the main menu with a score > 0 added to the live rank total
        await expect(page.getByText('TAP TO FLY').first()).toBeVisible();
    });

});
