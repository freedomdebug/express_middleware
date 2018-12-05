var router = express.Router();
var Query = require("../lib/mysql.js");
var Utils = require("../lib/utils");
var Kafka = require("../lib/kafka");
const middleware = require('../lib/middleware');

router.put('/test/init', middleware.asyncHandler(async(req, res, next) => {
    var param = req.body;

    var insert_a = {
        table: "A",
        LOG: "test init",
        TIME_STAMP: Utils.outTimestamp(),
        NAME: param.id
    };
    await Query.awaitInsertDB(insert_a);//insert log， 未来这个state可以优化;先沿用老逻辑;

    var select_b = {
        table: "B",
        ID: param.id
    };
    let rows = await Query.awaitSelectDB(select_b);

    if(rows.length !== 0) {
        //已绑定过，直接分配;
        var update_c = {
            table: "c",
            ID: param.id
        };
        var update_c_set = {
            INFO: param.info,
        };
        await Query.awaitUpdateDB(update_c, update_c_set);
    }

    var kafkaMessage = {
        CMD: "test_init",
        ID: param.id,
        TimeStamp: Utils.outTimestamp()
    };

    //判断version
    kafka.sendOrder(testTopic, JSON.stringify(kafkaMessage), function (err) {});
    res.send({
        result: "success"
    });
}));