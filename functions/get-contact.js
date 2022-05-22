exports.handler = function(context, event, callback) {

    const PNF = require('google-libphonenumber').PhoneNumberFormat;
    const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
  
    let client_id = process.env.SFDC_CLIENT_ID;
    let client_secret = process.env.SFDC_CLIENT_SECRET;
    let username = process.env.SFDC_USERNAME;
    let password = process.env.SFDC_PASSWORD;
    let sfdc_url = process.env.SFDC_INSTANCE_URL;
    let grant_type = "password";

    var result = {};

    const number = phoneUtil.parseAndKeepRawInput(event.from, 'AU');

    console.log(number.getNationalNumber())

    var axios = require('axios');
    var qs = require('qs');

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

        var query = "SELECT Id,Contact.Account.Name,ReportsTo.Name,FirstName,Member_ID__c,LastName,Phone,LoyaltyTier__c,LoyaltyPoints__c,CreatedDate FROM contact WHERE Phone = '"

        // TODO make this more elegant
        query = query + 0 + number.getNationalNumber() + "'";

        var config = {
          method: 'get',
          url: sfdc_url + '/services/data/v54.0/query/?q=' + query,
          headers: { 
            'Authorization': 'Bearer ' + response.data.access_token
          },
          data : data
        };
        
        // we now have queries the contact object - are they new or existing?

        axios(config)
        .then(function (response) {
            
          if (response.data.totalSize == 1){
            
            // existing contact
            
            result.status = 'existing'
            result.name = response.data.records[0].FirstName + ' ' + response.data.records[0].LastName
            result.segement = response.data.records[0].LoyaltyTier__c
            result.id = response.data.records[0].Id

            callback(null,result)

          }else{

              // new contact

              result.status = 'new'

              callback(null,result)
          }
        })
        .catch(function (error) {
          console.log(error);
        });

    })
    .catch(function (error) {
        console.log(error);
    });

};
