/**
 * module-aliases.js - This is where we configure aliases so the project can run
 * jsconfig.json - This is where we configure aliases for vscode Intellisense.
 * 
 * This enables us to use shortcuts like:
 * 
 *  require('@utils/logger');
 */

const moduleAlias = require('module-alias')

//
// Register alias
//
//moduleAlias.addAlias('@utils', __dirname + '/src/client')

// Or multiple aliases
moduleAlias.addAliases({
    '@utils': __dirname + '/utils',
    '@specs': __dirname + '/test-sync/specs',
    '@pageobjects': __dirname + '/test-sync/pageobjects',
    '@asyncpageobjects': __dirname + '/test-async/pageobjects',
    '@': __dirname + '/'
});

 // Custom handler function (starting from v2.1)
 // moduleAlias.addAlias('@src', (fromPath, request, alias) => {
 //     // fromPath - Full path of the file from which `require` was called
 //     // request - The path (first argument) that was passed into `require`
 //     // alias - The same alias that was passed as first argument to `addAlias` (`@src` in this case)

 //     // Return any custom target path for the `@src` alias depending on arguments
 //     if (fromPath.startsWith(__dirname + '/others')) return __dirname + '/others'
 //     return __dirname + '/src'
 // })

 //
 // Register custom modules directory
 //
 // moduleAlias.addPath(__dirname + '/node_modules_custom')
 // moduleAlias.addPath(__dirname + '/src')

 //
 // Import settings from a specific package.json
 //
 //moduleAlias(__dirname + '/package.json')

 // Or let module-alias to figure where your package.json is
 // located. By default it will look in the same directory
 // where you have your node_modules (application's root)
 //moduleAlias()
