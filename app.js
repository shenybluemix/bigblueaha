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

// serve the files out of ./public as our main files
//app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening

  console.log("server starting on " + appEnv.url);
  console.log("VCAP_SERVICES: "+ appEnv.getService());
});

var request = require("request");
var config = require ('./configs.js').config;
var base_url = config.aha_base_url;

var ghe_url = config.ghe_url;
var ghe_personal_token = config.ghe_personal_token;

var access_token = config.aha_access_token;
var aha_labels = config.aha_labels;

var get_users_options = {
  method: 'GET',
  url: base_url + '/api/v1/users?per_page=9999',
  headers:
   {
     authorization: access_token }
 };

var get_products_options = {
  method: 'GET',
  url: base_url + '/api/v1/products?per_page=9999' ,
  headers: { authorization: access_token },
  json:true
};

var jsonfile = require('jsonfile');
var componentfile = 'data/component.json';
var releasefile = 'data/release.json';



function getComponentList(file, callback ){
  jsonfile.readFile(file, function(err, obj){
    callback (obj);
  });
}

//var releases = config.releases;
//var components = config.components;

function postMilestone(components, releases){

   for (var i = 0; i < components.length; i ++){
     component = components[i].reference_prefix;
     for (var j =  0; j < releases.length; j++){
       var post_release_options = {
         method: 'POST',
         url: base_url + '/api/v1/products/' + component + '/releases' ,
         headers: { authorization: access_token },
         //body: releases[j],
         json: true
       };
       console.log(component);
       post_release_options.body = releases[j];

       console.log(post_release_options.body);

       request(post_release_options,function(error,response,body){
         if (error) throw new Error(error);
         //console.log(body.url.toString());

       });
     } //end loop of releases

   } //end loop of compponents

}

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/',function(req,res){
  res.send("contact sheny@us.ibm.com");

});

app.post('/milestones', function(req,res){
  var body = req.body;
  console.log(typeof(body));
  console.log(body.components);
  console.log(body.releases);
  postMilestone(body.components, body.releases);
  res.send(JSON.stringify(body.components) + JSON.stringify(body.releases));
});

app.get('/ghelabels/:org/:repo', function(req,res){

  var post_label_options = {
    method: 'POST',
    url: ghe_url + '/repos/' + req.params.org + '/' + req.params.repo + '/labels' ,
    auth: {
      user: 'sheny@us.ibm.com',
      password: ghe_personal_token
    },
   json:true
  };

  for (var i = 0; i < aha_labels.length; i ++){
    post_label_options.body = aha_labels[i];
      request(post_label_options, function(error,response, body){
        if (error) throw new Error(error);
    });
  }
  res.send("https://github.ibm.com/" + req.params.org + "/" + req.params.repo + "/labels"+ "\n Aha labels created successfully!");


});
