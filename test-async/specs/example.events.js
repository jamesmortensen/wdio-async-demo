const logger = require('@utils/logger');
xdescribe('Event Listeners', () => {
    it('should listen on network events', () => {
        browser.cdp('Network', 'enable')
        browser.on('Network.responseReceived', (params) => {
            console.log(`Loaded ${params.response.url}`)
        })
        browser.url('https://www.google.com')
    });
});
