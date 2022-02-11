function getFilesMatching(specFilePath, fileMatches) {

    const fs = require("fs");
    const path = require("path");

    const getArrayOfFilesRecursively = function (dirPath, arrayOfFiles) {
        files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
            if (fileIsADirectory(dirPath + "/" + file)) {
                arrayOfFiles = getArrayOfFilesRecursively(dirPath + "/" + file, arrayOfFiles);
            } else if (fileMatches(file)) {
                //console.debug('directory name is: ' + process.cwd());
                arrayOfFiles.push(path.join(process.cwd(), dirPath, "/", file));
            }
        });

        //console.log(arrayOfFiles);

        return arrayOfFiles;
    }

    function fileIsADirectory(dirPath) {
        return fs.statSync(dirPath).isDirectory()
    }

    return getArrayOfFilesRecursively(specFilePath);
}


function jsFileMatcher(file) {
    return file.match(/.*\.js$/i) !== null ? true : false;
}

function fileIsADirectory(dirPath) {
    return fs.statSync(dirPath).isDirectory()
}

var specs = [];
specs = getFilesMatching('./test-sync', jsFileMatcher);

console.log(specs);
const fs = require('fs');

specs.forEach((spec, index, array) => {
    const originalFileContent = fs.readFileSync(spec);
    const fd = fs.openSync(spec, 'w+')
    const insert = new Buffer.from("const logger = require('@utils/logger');\n");
    console.log(insert + originalFileContent);
    fs.writeSync(fd, insert, 0, insert.length, 0)
    fs.writeSync(fd, originalFileContent, 0, originalFileContent.length, insert.length)
    fs.close(fd, (err) => {
        if (err) throw err;
    });
});
