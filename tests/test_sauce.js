const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const PageLogin = require("../pages/page_login")
const PageInventory = require('../pages/page_inventory');

const BASE_URL = 'https://www.saucedemo.com/';
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';

describe('SauceDemo Automation Test', function () {
  let driver;
  let page_login;
  let page_inventory;

  this.timeout(40000); 

  before(async function () {
    driver = await new Builder().forBrowser('firefox').build();
    page_login = new PageLogin(driver);
    page_inventory = new PageInventory(driver);
  });

  after(async function () {
    await driver.quit();
  });

  beforeEach(async function () {
    // Selalu buka halaman login sebelum setiap mulai test
    await driver.get(BASE_URL);
  });

  afterEach(async function () {
    try {
      await page_inventory.logoutFromSaucedemo();
      await driver.wait(until.elementLocated(PageLogin.ButtonLogin), 10000);
    } catch (err) {
      // console.warn("Logout skipped: not logged in or logout elements not found");
    }
  });
  
  // Test Case: Valid Login
  it('Valid Login', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);

    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, `${BASE_URL}inventory.html`, 'URL after login does not match');
  });

  // Test Case: Invalid Username
  it('Invalid Username', async function() {
    await page_login.loginToSauceDemo('standard_use', VALID_PASSWORD, false);
      
    const textError = await page_login.getErrorText();
    assert.strictEqual(textError, 'Epic sadface: Username and password do not match any user in this service')
  });

  // Test Case: Invalid Password
  it('Invalid Password', async function() {
    await page_login.loginToSauceDemo(VALID_USERNAME, 'wrong_password', false);

    const textError = await page_login.getErrorText();
    assert.strictEqual(textError, 'Epic sadface: Username and password do not match any user in this service')
  });

  // Test Case: Empty Username
  it('Empty Username', async function() {
    await page_login.loginToSauceDemo('',VALID_PASSWORD, false);
    
    const textError = await page_login.getErrorText();
    assert.strictEqual(textError, 'Epic sadface: Username is required')
  });

  // Test Case: Empty Password
  it('Empty Password', async function() {
    await page_login.loginToSauceDemo(VALID_USERNAME, '', false);

    const textError = await page_login.getErrorText();
    assert.strictEqual(textError, 'Epic sadface: Password is required')
  });

  // Test Case: Sort product from A to Z
  it('Sort Products from A to Z', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);

    const sortDropdown = await driver.findElement(PageInventory.DropdownSort);
    await sortDropdown.findElement(PageInventory.SortAZ).click();
    await driver.wait(until.elementsLocated(PageInventory.ProductNameElements), 5000);
    
    const productNames = await page_inventory.getProductNames();
    const sortedNames = [...productNames].sort((a, b) => a.localeCompare(b));
    assert.deepStrictEqual(productNames, sortedNames, 'Products are not sorted from A to Z');
  });

  // Test Case: Sort Products from Z to A
  it('Sort Products From Z to A', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);

    const sortDropdown = await driver.findElement(PageInventory.DropdownSort);
    await sortDropdown.findElement(PageInventory.SortZA).click();
    await driver.wait(until.elementsLocated(PageInventory.ProductNameElements), 5000);

    const productNames = await page_inventory.getProductNames();
    const sortedNames = [...productNames].sort((a, b) => b.localeCompare(a));
    assert.deepStrictEqual(productNames, sortedNames, 'Products are not sorted from Z to A');
  });

  // Test Case: Sort Products from Low to High
  it('Sort Products From Low to High', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);

    const sortDropdown = await driver.findElement(PageInventory.DropdownSort);
    await sortDropdown.findElement(PageInventory.SortLoHi).click();
    await driver.wait(until.elementsLocated(PageInventory.PriceElements), 5000);

    const prices = await page_inventory.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    assert.deepStrictEqual(prices, sortedPrices, 'Product prices are not sorted from lowest to highest');
  });

  // Test Case: Sort Products from High to Low
  it('Sort Products From High to Low', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);

    const sortDropdown = await driver.findElement(PageInventory.DropdownSort);
    await sortDropdown.findElement(PageInventory.SortHiLo).click();
    await driver.wait(until.elementsLocated(PageInventory.PriceElements), 5000);

    const prices = await page_inventory.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);
    assert.deepStrictEqual(prices, sortedPrices, 'Product prices are not sorted from highest to lowest');
  });

  // Test Case Logout
  it('Successful Logout', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);

    await page_inventory.logoutFromSaucedemo();
    await driver.wait(until.elementLocated(PageLogin.ButtonLogin), 10000);
    const currentUrl = await driver.getCurrentUrl();
    assert.strictEqual(currentUrl, BASE_URL, 'Failed to logout');
  });

  // Test Case: Prevent access to inventory page after logout
  it('Should Prevent Access to Inventory Page After Logout', async function () {
    await page_login.loginToSauceDemo(VALID_USERNAME, VALID_PASSWORD, true);
    await page_inventory.logoutFromSaucedemo();

    await driver.get(`${BASE_URL}inventory.html`);
    await driver.wait(until.elementLocated(PageLogin.ButtonLogin), 10000);
    const currentUrl = await driver.getCurrentUrl();

    assert.strictEqual(currentUrl, BASE_URL, 'User should be redirected to login page when trying to access inventory after logout'
    );
  });

});
