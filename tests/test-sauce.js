const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('SauceDemo Automation Test', function () {
  let driver;

  this.timeout(40000); 

  before(async function () {
    driver = await new Builder().forBrowser('firefox').build();
  });

  after(async function () {
    await driver.quit();
  });

  beforeEach(async function () {
    // Selalu buka halaman login sebelum setiap mulai test
    await driver.get('https://www.saucedemo.com');
  });

  afterEach(async function () {
    try {
      const menuButton = await driver.findElement(By.id('react-burger-menu-btn'));
      await menuButton.click();
      await driver.wait(until.elementLocated(By.id('logout_sidebar_link')), 10000);
      const logoutLink = await driver.findElement(By.id('logout_sidebar_link'));
      await logoutLink.click();
      await driver.wait(until.elementLocated(By.css('[data-test="login-button"]')), 10000);
    } catch (err) {
      // kalau tidak bisa logout (misalnya karena gagal login)
    }
  });

  async function loginToSauceDemo() {
    await driver.findElement(By.css('[data-test="username"]')).sendKeys('standard_user');
    await driver.findElement(By.css('[data-test="password"]')).sendKeys('secret_sauce');
    await driver.findElement(By.css('[data-test="login-button"]')).click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/inventory.html'), 10000);
    await driver.wait(until.elementLocated(By.className('inventory_list')), 10000);
  }
  
  // Test Case Login
  it('Valid Login', async function () {
    await loginToSauceDemo();

    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, 'https://www.saucedemo.com/inventory.html', 'URL after login does not match');
  });

  // Test Case Urutkan produk dari A ke Z
  it('Sort Products from A to Z', async function () {
    await loginToSauceDemo();

    const sortDropdown = await driver.findElement(By.css('[data-test="product-sort-container"]'));
    await sortDropdown.findElement(By.css('option[value="az"]')).click();
    await driver.sleep(2000);

    const productNameElements = await driver.findElements(By.className('inventory_item_name'));
    const productNames = [];

    for (let el of productNameElements) {
      productNames.push(await el.getText());
    }

    const sortedNames = [...productNames].sort((a, b) => a.localeCompare(b));
    assert.deepStrictEqual(productNames, sortedNames, 'Products are not sorted from A to Z');
  });

  // Test Case Urutkan produk dari harga rendah ke tinggi
  it('Sort Products From Low to High', async function () {
    await loginToSauceDemo();

    const sortDropdown = await driver.findElement(By.css('[data-test="product-sort-container"]'));
    await sortDropdown.findElement(By.css('option[value="lohi"]')).click();
    await driver.sleep(2000);

    const priceElements = await driver.findElements(By.className('inventory_item_price'));
    const prices = [];

    for (let el of priceElements) {
      const text = await el.getText();
      prices.push(parseFloat(text.replace('$', '')));
    }

    const sortedPrices = [...prices].sort((a, b) => a - b);
    assert.deepStrictEqual(prices, sortedPrices, 'Product prices are not sorted from lowest to highest');
  });

  // Test Case Logout
  it('Successful Logout', async function () {
    await loginToSauceDemo();

    const menuButton = await driver.findElement(By.id('react-burger-menu-btn'));
    await menuButton.click();

    await driver.wait(until.elementLocated(By.id('logout_sidebar_link')), 10000);
    const logoutLink = await driver.findElement(By.id('logout_sidebar_link'));
    await logoutLink.click();

    await driver.wait(until.elementLocated(By.css('[data-test="login-button"]')), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, 'https://www.saucedemo.com/', 'Failed to logout');
  });
});
