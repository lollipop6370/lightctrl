'use strict';
const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port', port);
app.use(bodyParser.json());


const SHEETDB_PRODUCTINFO_ID = config.get('productinfo_id');

app.post('/webhook', function (req, res) {
    console.log("[WebHook In]");
    let data = req.body;
    let lightStatus = data.queryResult.parameters["light_state"];

    var thisQs = {};
    thisQs.light_switch = lightStatus;
    thisQs.light_id = "main";
    request({
        uri: "https://sheetdb.io/api/v1" + SHEETDB_PRODUCTINFO_ID + "/light_id/main",
        json: true,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        qs: {"data":[thisQs]}
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("[SheetDB API] Success!");
            sendCards(body, res, true);
        }
        else {
            console.log("[SheetDB API] Failed.");
            sendCards(null, res, false);
        }
    })

})

app.listen(app.get('port'), function () {
    console.log('[app.listen] Node app is running on port.', app.get('port'));
})

module.exports = app;

function sendCards(body, res, status) {
    console.log("[sendCards] In");
    var thisFulfillmentMessages = [];
    var updateTextObject = {};
    var finalResponseText = "";
    if (status) {
        finalResponseText = "更新成功";
    }
    else {
        finalResponseText = "更新失敗";
    }
    updateTextObject.text = { text: [finalResponseText] };
    thisFulfillmentMessages.push(updateTextObject);
    var responseObject = {
        fulfillmentMessages: thisFulfillmentMessages
    };
    res.json(responseObject);
}
