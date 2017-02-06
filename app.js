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

var get_products_options = {
  method: 'GET',
  url: base_url + '/api/v1/products?per_page=9999' ,
  headers: { authorization: access_token },
  json:true
};

var jsonfile = require('jsonfile');
var componentfile = 'data/component.json';

//all the components in Aha! excluding product_lines
var components = new Array();
var products;

function getAllComponents(callback){
  request(get_products_options, function(error,response,body){
    if (error) throw new Error(error);
    //console.log(body);
    products = body.products;
    for (var i = 0; i < products.length; i++){
      if (products[i].product_line == false){
          components.push(products[i].reference_prefix);
      }
    }
    console.log("products.length: " + products.length);
    console.log("components.length: " + components.length);
    console.log("the last component is: " +components[components.length - 1]);
    callback();
  });
}

function getComponentList(file, callback ){
  jsonfile.readFile(file, function(err, obj){
    callback (obj);
  });
}

var release = {
  release:
  {
    name:'2099 - 01',
  	release_date : '2017-01-31'
  }
};


function postMilestone(componentArray){

   //var len = components.length;
   var len = componentArray.length;
   for (var j = 0; j < len; j ++){
     component = componentArray[j];
     console.log(component);
     var post_release_options = {
       method: 'POST',
       url: base_url + '/api/v1/products/' + component + '/releases' ,
       headers: { authorization: access_token },
       body: release,
       json: true
     };

     request(post_release_options,function(error,response,body){
       if (error) throw new Error(error);
       console.log(body);
     });

   }

}

app.post('/milestones', function(req,res){
  getAllComponents(postMilestone);
  res.send()
});

getComponentList(componentfile, function(obj){
    var array = new Array();
    console.dir(obj);
    console.log(obj.components.length);
    components = obj.components;
    for (var i = 0; i < components.length; i ++){
        array.push(components[i].reference_prefix);
    }
    console.log(array);
    postMilestone(array);
});
