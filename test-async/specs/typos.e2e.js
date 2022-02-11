const logger = require('@utils/logger');



describe('Typos page', () => {

    it('should load the page and print a sentence', async () => {
        await browser.url('/typos');
        await $('.example > h3').waitForExist();
        expect(await $('#content > div > p:nth-child(3)')).toHaveText('Sometimes you\'ll see a typo, other times you won\'t.');
    })
})