const {By, until} = require("selenium-webdriver")

class PageInventory {
    constructor(driver) {
        this.driver = driver;
    }

    static DropdownSort = By.css('[data-test="product-sort-container"]');
    static InventoryList = By.className('inventory_list');
    static SortAZ = By.css('option[value="az"]');
    static SortZA = By.css('option[value="za"]');
    static ProductNameElements = By.className('inventory_item_name');  
    static SortLoHi = By.css('option[value="lohi"]');
    static SortHiLo = By.css('option[value="hilo"]');
    static PriceElements = By.className('inventory_item_price');  

    static ButtonMenu = By.id('react-burger-menu-btn');
    static LogoutLink = By.id('logout_sidebar_link');

    async getProductNames() {
        const productNameElements = await this.driver.findElements(PageInventory.ProductNameElements);
        const productNames = [];
        for (let el of productNameElements) {
            productNames.push(await el.getText());
        }
        return productNames;
    }

    async getProductPrices() {
        const priceElements = await this.driver.findElements(PageInventory.PriceElements);
        const prices = [];
        
        for (let el of priceElements) {
            const text = await el.getText();
        prices.push(parseFloat(text.replace('$', '')));
        }
        return prices;
    }

    async logoutFromSaucedemo(){
        await this.driver.findElement(PageInventory.ButtonMenu).click();
        await this.driver.wait(until.elementLocated(PageInventory.LogoutLink), 10000);
        await this.driver.findElement(PageInventory.LogoutLink).click();
    }
}

module.exports = PageInventory;