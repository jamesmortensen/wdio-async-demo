const logger = require('@utils/logger');
const LoginPage = require('@/test-async/pageobjects/login.page');
const SecurePage = require('@/test-async/pageobjects/secure.page');
const GalleryPage = require('@/test-async/pageobjects/gallery.page');
const galleryPage = new GalleryPage();

describe('Menu Button Tests', () => {
    before('should login with valid credentials and go to Gallery Page', () => {
        LoginPage.open();

        LoginPage.login('tomsmith', 'SuperSecretPassword!');
        expect(SecurePage.flashAlert).toBeExisting();
        expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');
        galleryPage.open();
    });

    it('should verify image is present', () => {
        expect($('#content > div > img:nth-child(3)')).toBeExisting();
    });

});


