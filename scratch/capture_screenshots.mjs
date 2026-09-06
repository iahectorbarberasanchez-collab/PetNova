import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const projectDir = 'C:/Users/ester/Desktop/HECTOR/PetNova';
const screenshotsLocal = path.join(projectDir, 'screenshots');
const screenshotsPortfolio = 'C:/Users/ester/Desktop/HECTOR/Hector Maestro IA/apps/portfolio/assets/screenshots/petnova';

// Ensure directories exist
fs.mkdirSync(screenshotsLocal, { recursive: true });
fs.mkdirSync(screenshotsPortfolio, { recursive: true });

const targets = [
  { name: 'landing', url: 'http://localhost:3010/' },
  { name: 'blog', url: 'http://localhost:3010/blog' },
  { name: 'dashboard', url: 'http://localhost:3010/dashboard' },
  { name: 'dashboard-health', url: 'http://localhost:3010/dashboard/health' },
  { name: 'dashboard-map', url: 'http://localhost:3010/dashboard/map' },
  { name: 'dashboard-shop', url: 'http://localhost:3010/dashboard/shop' }
];

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });

  for (const target of targets) {
    // 1. Desktop capture (1440x900)
    console.log(`Capturing Desktop: ${target.name} (${target.url})`);
    const contextDesktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    });
    const pageDesktop = await contextDesktop.newPage();
    try {
      await pageDesktop.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 });
      await pageDesktop.waitForTimeout(2000); // Allow animations/fonts to settle
      const fileDesktop = `${target.name}-desktop.png`;
      
      const pathLocal = path.join(screenshotsLocal, fileDesktop);
      const pathPortfolio = path.join(screenshotsPortfolio, fileDesktop);
      
      await pageDesktop.screenshot({ path: pathLocal, fullPage: false });
      fs.copyFileSync(pathLocal, pathPortfolio);
      console.log(`  Saved -> ${pathLocal}`);
    } catch (err) {
      console.error(`  Error capturing desktop ${target.name}:`, err.message);
    } finally {
      await contextDesktop.close();
    }

    // 2. Mobile capture (375x812)
    console.log(`Capturing Mobile: ${target.name} (${target.url})`);
    const contextMobile = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const pageMobile = await contextMobile.newPage();
    try {
      await pageMobile.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 });
      await pageMobile.waitForTimeout(2000);
      const fileMobile = `${target.name}-mobile.png`;
      
      const pathLocal = path.join(screenshotsLocal, fileMobile);
      const pathPortfolio = path.join(screenshotsPortfolio, fileMobile);
      
      await pageMobile.screenshot({ path: pathLocal, fullPage: false });
      fs.copyFileSync(pathLocal, pathPortfolio);
      console.log(`  Saved -> ${pathLocal}`);
    } catch (err) {
      console.error(`  Error capturing mobile ${target.name}:`, err.message);
    } finally {
      await contextMobile.close();
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run();
