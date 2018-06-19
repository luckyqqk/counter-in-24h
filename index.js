/**
 * Created by qingkai.wu on 2018/5/22.
 */
const util = require('util');
const REDIS_KEY     = 'COUNTER:IN:24H';
const DEFAULT_SIGN  = 'DEFAULT';
const addCountLua = `
                    redis.replicate_commands();
                    local seconds = redis.call('time')[1]
                    local nowDate = math.floor(seconds/86400)
                    local counter = redis.call('hget', KEYS[1], KEYS[2])

                    local nextCounter = nowDate.."_"..1;
                    if type(counter) ~= 'boolean' then
                        local arr = {}
                        local index = 1
                        for v in string.gmatch(counter, "(%w+)") do
                            arr[index] = v
                            index = index + 1
                        end
                        if tonumber(arr[1]) == nowDate then
                            local count = arr[2] + 1
                            nextCounter = arr[1].."_"..count
                        end
                    end
                    redis.call('hset', KEYS[1], KEYS[2], nextCounter)
                    return nextCounter`;

const CounterIn24h = function(redisClient) {
    this.redis = redisClient;
};

module.exports = CounterIn24h;

/**
 * 获得当天新的计数/获得新的id
 * @param {string}    [sign]  标识,不同的sign对应不同的ID生成器,不填则使用模式标识(同一个ID生成器).(推荐使用者维护该值)
 */
CounterIn24h.prototype.newCount =
CounterIn24h.prototype.newId = function(sign) {
    return new Promise((resolve, reject)=>{
        // if (typeof sign != 'string') {
        //     reject(`sign must be string`);
        //     return;
        // }
        _getAndAddCount(this.redis, sign || DEFAULT_SIGN).then(data=>{
            let countValue = data.split('_');
            let theDate = new Date(countValue[0] * 86400000).toLocaleDateString();
            resolve(util.format(`%s_%s`, theDate, countValue[1]));
        }).catch(reject);
    });
};

function _getAndAddCount(redis, sign) {
    return new Promise((resolve, reject)=>{
        redis.eval(addCountLua, 2, REDIS_KEY, sign, (err, data)=>{
            if (!!err)
                reject(err);
            else
                resolve(data);
        });
    });
}