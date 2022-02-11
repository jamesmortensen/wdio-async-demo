const logger = require('@utils/logger');
const LoginPage = require('../pageobjects/login.page');
const SecurePage = require('../pageobjects/secure.page');
const DynamicLoading1 = require('../pageobjects/dynamic.loading.1.page');


describe('Tests on waiting for an element to appear - 1', () => {

    beforeEach('should login with valid credentials', async () => {
        await LoginPage.open();
        logger.info('test test test');

        await LoginPage.login('tomsmith', 'SuperSecretPassword!');
        expect(SecurePage.flashAlert).toBeExisting();
        expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');
    });

    it('should wait for the element to appear', async () => {
        await DynamicLoading1.open();

        await DynamicLoading1.startButton.waitForClickable();
        await DynamicLoading1.startButton.click();

        await $('#loading').waitForExist({ timeoutMsg: 'Loader did not appear' });
        await $('#loading').waitForDisplayed({ reverse: true, timeoutMsg: 'Loader did not disappear' });

        const helloText = await DynamicLoading1.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
        //expect(DynamicLoading1.helloWorldElem).toBeDisplayed();

    })
});

