const logger = require('@utils/logger');
const LoginPage = require('@/test-async/pageobjects/login.page');
const SecurePage = require('@/test-async/pageobjects/secure.page');
const DynamicLoading1 = require('@/test-async/pageobjects/dynamic.loading.1.page');


describe('Tests on waiting for an element to appear - 1', () => {

    beforeEach('should login with valid credentials', () => {
        LoginPage.open();
        logger.info('test test test');

        LoginPage.login('tomsmith', 'SuperSecretPassword!');
        expect(SecurePage.flashAlert).toBeExisting();
        expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');
    });

    it('should wait for the element to appear', () => {
        DynamicLoading1.open();

        DynamicLoading1.startButton.waitForClickable();
        DynamicLoading1.startButton.click();

        $('#loading').waitForExist({ timeoutMsg: 'Loader did not appear' });
        $('#loading').waitForDisplayed({ reverse: true, timeoutMsg: 'Loader did not disappear' });

        const helloText = DynamicLoading1.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
        //expect(DynamicLoading1.helloWorldElem).toBeDisplayed();

    })
});

