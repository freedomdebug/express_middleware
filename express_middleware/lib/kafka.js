var kafka = require('kafka-node');
var Producer = kafka.Producer;
var config = require('config');
var client = new kafka.Client(config.get('kafakclient'));
var producer = new Producer(client);

var Utils = require('./utils');

Utils.log("连接kafka中...");
producer.on('ready', function () {
    Utils.log("连接kafka成功");
});

producer.on('error', function(err) {
    Utils.error(err);
    Utils.error("kafka断开连接");
    //前期log,后期报警
});

var toKafka = {};
toKafka.sendOrder = function (topic, message, cb) {
    Utils.log('Sending kafka, '+ 'topic: ' + topic + ',message: ' + message);
    payloads = [{
        topic: topic,
        messages: message
    }];

    producer.send(payloads, function (err, data) {
        if (!!err) {
            console.log("kafka error: " + err);
        }
        cb(err);
    });
};
toKafka.testTopic = config.get("testTopic");

module.exports = toKafka;