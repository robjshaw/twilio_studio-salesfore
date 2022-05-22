exports.handler = function(context, event, callback) {
  
    let client_id = process.env.SFDC_CLIENT_ID;
    let client_secret = process.env.SFDC_CLIENT_SECRET;
    let username = process.env.SFDC_USERNAME;
    let password = process.env.SFDC_PASSWORD;
    let sfdc_url = process.env.SFDC_INSTANCE_URL;
    let grant_type = "password";

    var result = {};

    var axios = require('axios');
    var qs = require('qs');

    console.log(event)

    if (typeof event.case !== 'undefined') {
        
        var data = qs.stringify({
            'grant_type': 'password',
            'client_id': client_id,
            'client_secret': client_secret,
            'username': username,
            'password': password
        });
        var config = {
            method: 'post',
            url: sfdc_url + '/services/oauth2/token',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded'
        },
            data : data
        };
    
        axios(config)
        .then(function (response) {
    
            var data = JSON.stringify({
                "CommentBody": event.TranscriptionText,
                "ParentId": event.case
            });
    
            var config = {
                method: 'post',
                url: sfdc_url + '/services/data/v54.0/sobjects/CaseComment',
                headers: { 
                    'Authorization': 'Bearer ' + response.data.access_token,
                    'Content-Type': 'application/json'
            },
                data : data
            };
    
            axios(config)
            .then(function (response) {
                callback(null,response.data)
            })
            .catch(function (error) {
                console.log(error);
            });
        });


    }else{
        callback(null, 'case does not exist')
    }

}