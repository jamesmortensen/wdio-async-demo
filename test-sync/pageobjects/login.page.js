const logger = require('@utils/logger');
const Page = require('./page');
const reporter = require('@wdio/allure-reporter').default;

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginPage extends Page {
    /**
     * define selectors using getter methods
     */
    get inputUsername() { return $('#username') }
    get inputPassword() { return $('#password') }
    get btnSubmit() { return $('button[type="submit"]') }

    /**
     * a method to encapsule automation code to interact with the page
     * e.g. to login using username and password
     */
    login(username, password) {


        this.inputUsername.setValue(username);
        this.inputPassword.setValue(password);

        this.btnSubmit.click();
        console.debug('we got passed the click JAMES WAS HERE')
        //reporter.addDescriptioadfsadfsan();

        //reporter.addDescriptioadfsadfsan();
        // process.argv[2] = config filename
        // process.platform = darwin
        // global.browser.config.baseUrl = the baseurl
        // global.browser.config.dockerOptions.image = docker image used
        // reporter.addEnvironment('WDIO config filename', process.argv[2]);
        // reporter.addEnvironment('Platform', process.platform);
        // reporter.addEnvironment('baseUrl', global.browser.config.baseUrl);
        // if (global.browser.config.dockerOptions)
        //     reporter.addEnvironment('Docker image', global.browser.config.dockerOptions.image);
        //reporter.addEnvironment();
        reporter.addDescription('This is an example of a description');


        reporter.addStep('This is a step that failed', [], 'failed');
        reporter.addStep('This is a step that broke', [], 'broken');
        reporter.addStep('This is a step that passed', [], 'passed'); // passed is optional
        reporter.addStep('This is a step that passed by default'); // passed is optional
    }

    /**
     * overwrite specifc options to adapt it to page object
     */
    open() {
        return super.open('login');
    }
}

module.exports = new LoginPage();
