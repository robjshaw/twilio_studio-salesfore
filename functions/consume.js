exports.handler = function(context, event, callback) {

    console.log(event)

    callback(null, 'done');

}