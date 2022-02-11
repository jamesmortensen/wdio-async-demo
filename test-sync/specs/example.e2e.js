const logger = require('@utils/logger');
const LoginPage = require('../../test-async/pageobjects/login.page');
const SecurePage = require('../../test-async/pageobjects/secure.page');

describe('My Login application', () => {
    it('should login with valid credentials', () => {
        LoginPage.open();

        LoginPage.login('tomsmith', 'SuperSecretPassword!');
        //try {
        //  reporter.addDescriptioadfsadfsan();


        // } catch (e) {
        //     console.error('Found a ReferenceError, but let\'s keep going');
        //     console.error(e.message);
        // }

        console.debug('handled the error...');
        expect(SecurePage.flashAlert).toBeExisting();
        expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');

    });
});


