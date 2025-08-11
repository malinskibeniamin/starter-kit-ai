import { test } from '@chromatic-com/playwright';

const components = ['button'];

test.describe('Component', () => {
  for (const component of components) {
    test(`${component} should render`, async ({ page }) => {
      await page.goto(`http://localhost:3001/${component}-demo`);
    });
  }
});
