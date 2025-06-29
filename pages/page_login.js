const {By, until} = require("selenium-webdriver")

class PageLogin {
    constructor(driver) {
        this.driver = driver;
    }

    static InputUsername = By.css('[data-test="username"]');
    static InputPassword = By.css('[data-test="password"]');
    static ButtonLogin = By.css('[data-test="login-button"]');
    static TextError = By.css('[data-test="error"]');

    async loginToSauceDemo(username, password, expectSuccess = true) {
        await this.driver.findElement(PageLogin.InputUsername).sendKeys(username);
        await this.driver.findElement(PageLogin.InputPassword).sendKeys(password);
        await this.driver.findElement(PageLogin.ButtonLogin).click();

        if(expectSuccess){
            await this.driver.wait(until.urlIs('https://www.saucedemo.com/inventory.html'), 10000);
        }

    }

    async getErrorText(){
        return await this.driver.findElement(PageLogin.TextError).getText();
    }
}

module.exports = PageLogin;