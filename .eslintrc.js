// .eslintrc.js
module.exports = {
    "settings": {
        "import/resolver": {
            "eslint-import-resolver-custom-alias": {
                "alias": {
                    "@utils": "./utils",
                    "@specs": "./test-sync/specs",
                    "@pageobjects": "./test-sync/pageobjects",
                    "@": "./"
                }
            }
        }
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "plugins": [
        "import"
    ],
    "rules": {
        "import/no-unresolved": [
            2,
            {
                "commonjs": true,
                "amd": false,
                "caseSensitive": true
            }
        ]
    }
}

