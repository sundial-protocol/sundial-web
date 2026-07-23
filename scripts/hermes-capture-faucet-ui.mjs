import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const [,, mode, baseUrl, outputPath, addressArg] = process.argv;
if (!mode || !baseUrl || !outputPath) {
  console.error('Usage: node scripts/hermes-capture-faucet-ui.mjs <mode> <baseUrl> <outputPath> [address]');
  process.exit(1);
}

const address = addressArg || '';
const submitButtonName = 'Request testnet sBTC';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });

try {
  await page.goto(`${baseUrl}/testnet/faucet`, { waitUntil: 'networkidle' });
  await page.locator('#faucet-address').waitFor({ state: 'visible' });

  if (mode === 'before') {
    // empty form
  } else if (mode === 'filled') {
    await page.locator('#faucet-address').fill(address);
  } else if (mode === 'invalid') {
    await page.locator('#faucet-address').fill('not-a-valid-address');
    await page.getByRole('button', { name: submitButtonName }).click();
    await page.getByText('Address must start with addr_test1.').waitFor({ state: 'visible' });
  } else if (mode === 'success') {
    await page.locator('#faucet-address').fill(address);
    await page.getByRole('button', { name: submitButtonName }).click();
    await page.getByText('Claim submitted').waitFor({ state: 'visible', timeout: 30000 });
  } else if (mode === 'server-error') {
    await page.locator('#faucet-address').fill(address);
    await page.getByRole('button', { name: submitButtonName }).click();
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('The faucet is currently unavailable.') || text.includes('The faucet is currently unreachable. Please try again shortly.');
    }, { timeout: 30000 });
  } else {
    console.error(`Unknown mode: ${mode}`);
    process.exit(1);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: outputPath, fullPage: true });
} finally {
  await page.close();
  await browser.close();
}
