const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('SauceDemo Automation Test', function () {
  let driver;
  this.timeout(40000); // Perbesar timeout karena ada banyak proses

  before(async function () {
    driver = await new Builder().forBrowser('firefox').build();
  });

  after(async function () {
    await driver.quit();
  });

  // Reusable login function
  async function loginToSauceDemo() {
    await driver.get('https://www.saucedemo.com');
    await driver.findElement(By.css('[data-test="username"]')).sendKeys('standard_user');
    await driver.findElement(By.css('[data-test="password"]')).sendKeys('secret_sauce');
    await driver.findElement(By.css('[data-test="login-button"]')).click();

    await driver.wait(until.urlIs('https://www.saucedemo.com/inventory.html'), 10000);
    await driver.wait(until.elementLocated(By.className('inventory_list')), 10000);
  }

  it('Sukses Login', async function () {
    await loginToSauceDemo();

    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, 'https://www.saucedemo.com/inventory.html', 'URL setelah login tidak sesuai');
  });

  it('Urutkan Produk dari A ke Z', async function () {
    await loginToSauceDemo();

    const sortDropdown = await driver.wait(
      until.elementLocated(By.css('[data-test="product-sort-container"]')),
      10000
    );
    await sortDropdown.findElement(By.css('option[value="az"]')).click();
    await driver.sleep(2000); // Tunggu DOM stabil

    const productNameElements = await driver.findElements(By.className('inventory_item_name'));
    const productNames = [];

    for (let el of productNameElements) {
      productNames.push(await el.getText());
    }

    const sortedNames = [...productNames].sort((a, b) => a.localeCompare(b));
    assert.deepStrictEqual(productNames, sortedNames, 'Produk tidak terurut dari A ke Z');
  });

  it('Urutkan Produk dari Harga Terendah ke Tertinggi', async function () {
    await loginToSauceDemo();

    const sortDropdown = await driver.wait(
      until.elementLocated(By.css('[data-test="product-sort-container"]')),
      10000
    );
    await sortDropdown.findElement(By.css('option[value="lohi"]')).click();
    await driver.sleep(2000); // Tunggu sorting selesai

    const priceElements = await driver.findElements(By.className('inventory_item_price'));
    const prices = [];

    for (let el of priceElements) {
      const text = await el.getText(); // Contoh: $7.99
      prices.push(parseFloat(text.replace('$', '')));
    }

    const sortedPrices = [...prices].sort((a, b) => a - b);
    assert.deepStrictEqual(prices, sortedPrices, 'Harga produk tidak terurut dari terendah ke tertinggi');
  });

  it('Sukses Logout', async function () {
    await loginToSauceDemo();

    const menuButton = await driver.findElement(By.id('react-burger-menu-btn'));
    await menuButton.click();

    await driver.wait(until.elementLocated(By.id('logout_sidebar_link')), 10000);
    const logoutLink = await driver.findElement(By.id('logout_sidebar_link'));
    await logoutLink.click();

    // Tunggu halaman login kembali
    await driver.wait(until.elementLocated(By.css('[data-test="login-button"]')), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, 'https://www.saucedemo.com/', 'Tidak berhasil logout');
  });
});
