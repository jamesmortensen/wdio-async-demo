const logger = require('@utils/logger');
const DynamicLoading = require('./dynamic.loading.pages');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class DynamicLoading2 extends DynamicLoading {
    /**
     * overwrite specifc options to adapt it to page object
     */
    open() {
        return super.open('dynamic_loading/2');
    }
}

module.exports = new DynamicLoading2();