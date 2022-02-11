const logger = require('@utils/logger');
const LoginPage = require('../pageobjects/login.page');
const SecurePage = require('../pageobjects/secure.page');
const DynamicLoading2 = require('../pageobjects/dynamic.loading.2.page');


describe('Tests on waiting for an element to appear - 2', () => {

    beforeEach('should login with valid credentials', async () => {
        await LoginPage.open();
        logger.info('test test test');

        await LoginPage.login('tomsmith', 'SuperSecretPassword!');
        expect(SecurePage.flashAlert).toBeExisting();
        expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');
    });

    it('should wait for the element to appear', async () => {
        await DynamicLoading2.open();

        await DynamicLoading2.startButton.waitForClickable();
        await DynamicLoading2.startButton.click();

        const helloText = await DynamicLoading2.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
        //expect(DynamicLoading2.helloWorldElem).toBeDisplayed();

    })
});

