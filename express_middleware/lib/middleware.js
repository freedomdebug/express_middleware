/**
 if there is an error thrown in db, awaitHandlerFactory
 will pass it to next() and express will handle the error;
 *
 * @author chips
 * @date 2018/11/29
 */
var Utils = require("./utils");

// var exports = module.exports = {};
exports.asyncHandler = (middleware) => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next)
        } catch (err) {
            if(err && err.message) {
                Utils.error(err.message);
            }

            res.send({
                result: "failure"
            });
            // next(err);
        }
    }
};
