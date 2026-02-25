const { chromium, devices } = require('playwright');
const fs = require('fs');

const routes = [
  { name: 'welcome', url: 'https://app.axentrait.com/#/welcome' },
  { name: 'services', url: 'https://app.axentrait.com/#/services' },
  { name: 'cases', url: 'https://app.axentrait.com/#/cases' },
  { name: 'ai', url: 'https://app.axentrait.com/#/ai' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const report = [];

  for (const route of routes) {
    const page = await context.newPage();
    const pageErrors = [];
    const reqFailed = [];
    const apiResponses = [];

    page.on('pageerror', (err) => pageErrors.push(String(err.message || err)));
    page.on('requestfailed', (req) => {
      reqFailed.push({
        url: req.url(),
        error: req.failure() ? req.failure().errorText : 'unknown',
      });
    });
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/api/')) {
        apiResponses.push({ url, status: res.status() });
      }
    });

    let status = 'ok';
    try {
      await page.goto(route.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500);
    } catch (e) {
      status = `goto_failed: ${e.message}`;
    }

    const text = await page.locator('body').innerText().catch(() => '');
    const hasUnavailable = /временно недоступн/i.test(text);
    const hasRequestFailed = /request failed/i.test(text);

    const screenshotPath = `/opt/axentrait/smoke/${route.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => null);

    report.push({
      route: route.name,
      url: route.url,
      status,
      hasUnavailable,
      hasRequestFailed,
      textSample: (text || '').slice(0, 260).replace(/\s+/g, ' '),
      pageErrors,
      failedRequests: reqFailed,
      apiResponses,
      screenshotPath,
      screenshotExists: fs.existsSync(screenshotPath),
    });

    await page.close();
  }

  await context.close();
  await browser.close();

  fs.writeFileSync('/opt/axentrait/smoke/report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();
