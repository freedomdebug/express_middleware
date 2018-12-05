/**
 * define common mysql's opreate for common component
 *
 * @author chips
 * @date 2018/11/16
 */

var mysql = require('mysql');
var config = require('config');
var Utils = require('./utils');

var pool = mysql.createPool({
    host: config.get('mysqlhost'),
    user: config.get('mysqluser'),
    password: config.get('mysqlpassword'),
    charset: config.get('mysqlcharset'),
    database: config.get('mysqldatabase'),
    dateStrings: config.get('mysqldateStrings')
});
pool.on('connnection', function (connection) {
    Utils.log("pool on");
    connection.query('SET SESSION auto_increment_increment=1');
});

var Mysql = {};

//you can put some sql in Mysql.sql and use it with Mysql.commonWithParam && Mysql.commonWithoutParam
Mysql.sql = {
    selectEgA: 'select * from A order by time desc limit ?, 50', //分页，每次取50条;
    selectEgB: 'select * from A order by time desc limit 50\''
};
Mysql.commonWithParam = function (sqlString, values, callback) {
    Utils.log("Query.commonWithParam:sqlString is " + sqlString, "; values are ", values);
    pool.getConnection(function (err, connection) {
        connection.query(sqlString, values, function (err, result) {
            connection.release();
            callback(err, result);
        });
    });
};
Mysql.commonWithoutParam = function (sqlString, callback) {
    Utils.log("Query.commonWithoutParam:sqlString is " + sqlString);
    pool.getConnection(function (err, connection) {
        connection.query(sqlString, function (err, result) {
            connection.release();
            if(err) {
                Utils.error(err.message);
            }
            callback(err, result);
        });
    });
};

//模糊查找
//eg: no_fuzzy_params_array: [param_a, param_b]
Mysql.fuzzySearch = function (query, no_fuzzy_params_array, callback) { //pid
    var sql = "SELECT * FROM " + query.table + " ";
    var flag = 0;
    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql += " where ";
                flag = 1;
            } else {
                sql += " and "
            }

            var is_no_funzzy_param = false;
            for(var j in no_fuzzy_params_array) {
                if(i == no_fuzzy_params_array[j]) {
                    is_no_funzzy_param = true;
                }
            }

            if(is_no_funzzy_param)
            {
                sql = sql + i + " ='" + query[i] + "' ";
            } else {
                sql = sql + i + " like '%" + query[i] + "%' ";
            }
        }
    }
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err, result);
        });
    });
};
Mysql.fuzzySearchDescByParam = function (query, no_fuzzy_params_array, param, callback) { //pid
    var sql = "SELECT * FROM " + query.table + " ";
    var flag = 0;
    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql += " where ";
                flag = 1;
            } else {
                sql += " and "
            }

            var is_no_funzzy_param = false;
            for(var j in no_fuzzy_params_array) {
                if(i == no_fuzzy_params_array[j]) {
                    is_no_funzzy_param = true;
                }
            }

            if(is_no_funzzy_param)
            {
                sql = sql + i + " ='" + query[i] + "' ";
            } else {
                sql = sql + i + " like '%" + query[i] + "%' ";
            }
        }
    }
    sql += " order by " + param + " desc";
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err, result);
        });
    });
};
//improve it, it has some problems
//if exist,update.if not exist,insert
Mysql.insertOrUpdate = function(table, primary_key, set, callback) {
    var sql = "INSERT INTO " + table + " ";

    //eg: key is (`CLIENT_NAME`, `APP_PATH`, `PROCESS_ID`, `APP_MD5`, `TIME_STAMP`) and
    //value is ('weihaoPC1', '1', 3228, '111', '2018-01-01 00:00:00')
    var key = "(";
    var value = "(";
    var update = "";
    for(var i in primary_key) {
        if(typeof(primary_key[i] != "undefined")) {
            key +=  i + ',';
            value += "'" + primary_key[i] + "',";
        }
    }

    for(var i in set) {
        if(typeof(set[i] != "undefined")) {
            key += i + ',';
            value += "'" + set[i] + "',";
            update += i + "='" + set[i] + "' AND ";
        }
    }

    if(key.length > 1) {
        key = key.substr(0, key.length -1);//del the last ','
        key += ')';
    }
    if(value.length > 1) {
        value = value.substr(0, value.length -2);//del the last '','
        value += "')";
    }
    if(update.length > 0) {
        update = update.substr(0, update.length - 6);//del the last '' and'
        update += "'";
    }

    sql = sql + key + " VALUES " + value + "ON DUPLICATE KEY UPDATE " + update;
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err);
        });
    });
};

//todo,select * where .. in ...
Mysql.awaitSelectDB = function(query) {
    var sql = "SELECT * FROM " + query.table + " ";
    var flag = 0;
    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql = sql + "where " + i + "='" + query[i] + "' ";
            } else {
                sql = sql + "and " + i + "='" + query[i] + "' ";
            }
            flag = 1;
        }
    }
    Utils.log(sql);

    return new Promise(( resolve, reject ) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject( err )
            } else {
                connection.query(sql,  ( err, rows) => {

                    if ( err ) {
                        reject( err )
                    } else {
                        resolve( rows )
                    }
                    // 结束会话
                    connection.release()
                })
            }
        })
    })
};
Mysql.awaitUpdateDB = function(query, set) {
    var sql = "UPDATE " + query.table + " SET ";
    var flag = 0;
    for (var i in set) {
        if (flag == 0) {
            sql = sql + i + "='" + set[i] + "' ";
        } else {
            sql = sql + "," + i + "='" + set[i] + "' ";
        }
        flag = 1;
    }
    flag = 0;
    for (var j in query) {
        if (typeof (query[j]) != "undefined" && j != "table") {
            if (flag == 0) {
                sql = sql + "where " + j + "='" + query[j] + "' ";
            } else {
                sql = sql + "and " + j + "='" + query[j] + "' ";
            }
            flag = 1;
        }
    }
    Utils.log(sql);

    return new Promise(( resolve, reject ) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject( err )
            } else {
                connection.query(sql,  ( err ) => {

                    if ( err ) {
                        reject( err )
                    } else {
                        resolve();
                    }
                    // 结束会话
                    connection.release()
                })
            }
        })
    })
};
Mysql.awaitInsertDB = function(query) {
    var sql = "INSERT INTO " + query.table + " ";
    var flag = 0;
    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql = sql + "( " + i;
            } else {
                sql = sql + ", " + i;
            }
            flag = 1;
        }
    }
    sql = sql + ") VALUES ";
    flag = 0;
    for (var j in query) {
        if (typeof (query[j]) != "undefined" && j != "table") {
            if (flag == 0) {
                sql = sql + "('" + query[j] + "'";
            } else {
                sql = sql + ", '" + query[j] + "'";
            }
            flag = 1;
        }
    }
    sql = sql + ")";
    Utils.log(sql);

    return new Promise(( resolve, reject ) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject( err )
            } else {
                connection.query(sql,  ( err ) => {

                    if ( err ) {
                        reject( err )
                    } else {
                        resolve();
                    }
                    // 结束会话
                    connection.release()
                })
            }
        })
    })
};

//老的方法，未来统一优化掉;
Mysql.selectDB = function (query, callback) {
    var sql = "SELECT * FROM " + query.table + " ";
    flag = 0;
    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql = sql + "where " + i + "='" + query[i] + "' ";
            } else {
                sql = sql + "and " + i + "='" + query[i] + "' ";
            }
            flag = 1;
        }
    }
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err, result);
        });
    });
};
Mysql.deleteDB = function (query, callback) {
    var sql = "DELETE FROM " + query.table + " ";
    flag = 0;

    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql = sql + "where " + i + "='" + query[i] + "' ";
            } else {
                sql = sql + "and " + i + "='" + query[i] + "' ";
            }
            flag = 1;
        }
    }
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err);
            if (!err) {
                Query.judgeBlacklist(query.table);
            }
        });
    });
};
Mysql.InsertDB = function (query, callback) {
    var sql = "INSERT INTO " + query.table + " ";
    flag = 0;
    for (var i in query) {
        if (typeof (query[i]) != "undefined" && i != "table") {
            if (flag == 0) {
                sql = sql + "( " + i;
            } else {
                sql = sql + ", " + i;
            }
            flag = 1;
        }
    }
    sql = sql + ") VALUES ";
    flag = 0;
    for (var j in query) {
        if (typeof (query[j]) != "undefined" && j != "table") {
            if (flag == 0) {
                sql = sql + "('" + query[j] + "'";
            } else {
                sql = sql + ", '" + query[j] + "'";
            }
            flag = 1;
        }
    }
    sql = sql + ")";
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err);
            if (!err) {
                Query.judgeBlacklist(query.table);
            }
        });
    });
};
Mysql.updateDB = function (query, set, callback) {
    var sql = "UPDATE " + query.table + " SET ";
    flag = 0;
    for (var i in set) {
        if (flag == 0) {
            sql = sql + i + "='" + set[i] + "' ";
        } else {
            sql = sql + "," + i + "='" + set[i] + "' ";
        }
        flag = 1;
    }
    flag = 0;
    for (var j in query) {
        if (typeof (query[j]) != "undefined" && j != "table") {
            if (flag == 0) {
                sql = sql + "where " + j + "='" + query[j] + "' ";
            } else {
                sql = sql + "and " + j + "='" + query[j] + "' ";
            }
            flag = 1;
        }
    }
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err);
            if (!err) {
                Query.judgeBlacklist(query.table);
            }
        });
    });
};
Mysql.updateLimitDB = function (query, set, limit, callback) {
    var sql = "UPDATE " + query.table + " SET ";
    flag = 0;
    for (var i in set) {
        if (flag == 0) {
            sql = sql + i + "='" + set[i] + "' ";
        } else {
            sql = sql + "," + i + "='" + set[i] + "' ";
        }
        flag = 1;
    }
    flag = 0;
    for (var j in query) {
        if (typeof (query[j]) != "undefined" && j != "table") {
            if (flag == 0) {
                sql = sql + "where " + j + "='" + query[j] + "' ";
            } else {
                sql = sql + "and " + j + "='" + query[j] + "' ";
            }
            flag = 1;
        }
    }
    sql = sql + "limit " + limit;
    Utils.log(sql);

    pool.getConnection(function (err, connection) {
        connection.query(sql, function (err, result) {
            connection.release();
            callback(err);
            Query.judgeBlacklist(query.table);
        });
    });
};
Mysql.getResult = function (res, err, result) {
    if (err) {
        var error = "DATABASE Error: " + err.message;
        Utils.error(error);
        res.json({
            result: "operate db fail,please see webportal's log to find reasons"
        });
    } else {
        var string = JSON.stringify(result);
        var json = JSON.parse(string);
        res.json({
            result: "Success",
            items: json
        });
    }
};

module.exports = Mysql;