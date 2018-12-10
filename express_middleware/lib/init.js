/**
 * init after server start,including but not limited to
 * kafka's initialize && mysql's initialize
 * create base store dir && create clientStoreDir && create imgStoreDir
 * global config init
 *
 * @author chips
 * @date 2018/11/16
 */

var fs = require('fs');
var config = require('config');

var Mysql = require("../models/mysql.js");
var Kafka = require('../models/kafka.js');
var Utils = require('../models/utils.js');
var Common = require('../models/common');

//todo something;