/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

var jsonfile = require('jsonfile');
var componentfile = 'data/component.json';

// serve the files out of ./public as our main files
//app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening

  console.log("server starting on " + appEnv.url);
});


var request = require("request");

var base_url = 'https://bigblue.aha.io';
var access_token = 'Bearer 14828d1e592ec3ae51b09f89dd4b4988af1a69320c9ca1c941342ef08b0f5077';

var get_users_options = {
  method: 'GET',
  url: base_url + '/api/v1/users?per_page=9999',
  headers:
   {
     authorization: access_token }
 };

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/milestones',function(req,res){
  var body = req.body;
  console.log(typeof(body))
  res.send(body);
  callback(body);
});

function callback(body){
  console.log("callback" + JSON.stringify(body));
}
