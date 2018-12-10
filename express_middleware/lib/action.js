/**
 * business functions
 *
 * @author chips
 * @date 2018/11/16
 */

var Utils = require('./utils');
var fs = require('fs');
var crypto = require('crypto');

var Action = {};
/*
write file functions
* */
Action.writePngImage = function(data, path) {
    var base64Data = data.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(path, base64Data, 'base64', function (err) {
        if(err) {
            Utils.error('write image fail' + err.message);
        } else {
            Utils.log("write image success");
        }
    });
};
Action.writePDF = function(data, path) {
    fs.writeFile(path, data, 'base64', function (err) {
        if(err) {
            Utils.error('write pdf fail' + err.message);
        } else {
            Utils.log("write pdf success");
        }
    });
};

//id is string,32 bit,lower case
Action.getMd5ById = function(id) {
    var md5 = crypto.createHash('md5');
    return md5.update(id).digest('hex');
};


module.exports = Action;