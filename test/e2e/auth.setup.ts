import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test as setup } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Check if we need Stack credentials
  const stackProjectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

  if (!stackProjectId) {
    throw new Error(
      "Stack credentials not found. Please set NEXT_PUBLIC_STACK_PROJECT_ID in your .env.test.local file",
    );
  }

  // Navigate to the sign-in page
  await page.goto("/handler/sign-in");

  // Wait for Stack's auth UI to load
  await page.waitForLoadState("networkidle");

  // Check if we have test user credentials
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    console.warn("⚠️  TEST_USER_EMAIL and TEST_USER_PASSWORD not set.");
    console.warn(
      "⚠️  Please create a test user in Stack and set these credentials.",
    );
    console.warn("⚠️  Skipping authentication setup...");
    return;
  }

  try {
    // Click the "Email & Password" tab (Stack Auth defaults to magic link "Email" tab)
    const emailPasswordTab = page.locator("button", {
      hasText: "Email & Password",
    });
    await emailPasswordTab.waitFor({ timeout: 5000 });
    await emailPasswordTab.click();

    // Fill email field
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first();
    await emailInput.waitFor({ timeout: 5000 });
    await emailInput.fill(testEmail);

    // Fill password field
    const passwordInput = page
      .locator('input[type="password"], input[name="password"]')
      .first();
    await passwordInput.fill(testPassword);

    // Click the sign in button
    const signInButton = page.locator('button[type="submit"]').first();
    await signInButton.click();

    // Wait for redirect after successful login
    // Should redirect to home page or the page we came from
    await page.waitForURL(/^(?!.*handler).*$/, { timeout: 10000 });

    // Verify we're logged in — Stack renders a UserButton (avatar circle) in the nav
    await expect(
      page
        .locator("nav button")
        .filter({ hasNotText: /sign in|sign up/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });

    console.log("✅ Authentication successful");

    // Save the authenticated state
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error("❌ Authentication failed:", error);

    // Take a screenshot for debugging
    await page.screenshot({ path: "playwright/.auth/auth-error.png" });

    throw new Error(
      "Failed to authenticate. Please check:\n" +
        "1. TEST_USER_EMAIL and TEST_USER_PASSWORD are correct\n" +
        "2. The test user exists in your Stack project\n" +
        "3. Stack selectors match the actual UI (check auth-error.png screenshot)\n" +
        `Error: ${error}`,
    );
  }
});
