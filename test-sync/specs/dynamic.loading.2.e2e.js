const logger = require('@utils/logger');
const LoginPage = require('@/test-async/pageobjects/login.page');
const SecurePage = require('@/test-async/pageobjects/secure.page');
const DynamicLoading2 = require('@/test-async/pageobjects/dynamic.loading.2.page');


describe('Tests on waiting for an element to appear - 2', () => {

    beforeEach('should login with valid credentials', () => {
        LoginPage.open();
        logger.info('test test test');

        LoginPage.login('tomsmith', 'SuperSecretPassword!');
        expect(SecurePage.flashAlert).toBeExisting();
        expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');
    });

    it('should wait for the element to appear', () => {
        DynamicLoading2.open();

        DynamicLoading2.startButton.waitForClickable();
        DynamicLoading2.startButton.click();

        const helloText = DynamicLoading2.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
        //expect(DynamicLoading2.helloWorldElem).toBeDisplayed();

    })
});

