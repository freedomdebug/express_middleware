/**
 * define common functions
 *
 * @author chips
 * @date 2018/11/16
 */

var dateFormat = require('dateformat');

var Utils = {};

//log level
Utils.log = function(msg) {
    console.log(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss  "), msg);
};
Utils.error = function(msg) {
    console.error(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss  "), msg);
};
Utils.warn = function(msg) {
    console.warn(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss  "), msg);
};


//catch error
//todo;
// Utils.parseJsonFromDB = function(res, err, result) {
//     if(err)
//     {
//         console.log(err.message);
//         res.json({
//             //未来重构改成status;
//             status: "Fail",
//             result: "operate fail,please see webportal's log to find reasons"
//         });
//     } else {
//         var string = JSON.stringify(result);
//         var json = JSON.parse(string);
//         res.json({
//             result: "Success",
//             items: json
//         });
//     }
// };
Utils.catchErrorBySend = function(err ,res) {
    if(err)
    {
        console.log(err.message);
        res.send({
            result: "failure"
        });
    } else {
        res.send({
            result: "success"
        });
    }
};
Utils.catchError = function(err, res) {
    if(err)
    {
        console.log(err.message);
        res.json({
            status: "Fail",
            result: "operate fail,please see webportal's log to find reasons"
        });
    } else {
        res.json({
            result: "Success"
        });
    }
};


Utils.outTimestamp = function() {
    return dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
};

/*
string deal functions
* */

//is_right=true,得到sysbmol_index从字符串开始位置到右边split_length位
//is_right=false,得到sysbmol_indx从字符串split_sysbmol处向左split_length到结尾
Utils.getSubStringBySysbmol = function(str, split_sysbmol, split_length, is_right) {
    var substr = "";
    var index = str.indexOf(split_sysbmol);
    if(is_right === "true") {
        var end_index = index + split_length;
        if(end_index  + 1 < str.length) {
            substr = str.substr(0, end_index + 1);
        } else {
            substr = str;
        }
    } else {
        var start_index =  index - split_length;
        if(start_index > 0) {
            substr = str.substr(start_index);
        } else {
            substr = str;
        }
    }

    return substr;
};


module.exports = Utils;