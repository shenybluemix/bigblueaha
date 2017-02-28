/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv

//cfenv-wrapper is a simple wrapper (a local module called cfenv-wrapper) to make local development of Bluemix/Cloud Foundry apps a little easier
//for more info, see: http://www.tonyerwin.com/2014/10/nodejs-on-bluemix-easier-local.html

var cfenv = require('./cfenv-wrapper');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening

  console.log("server starting on " + appEnv.url);
  console.log("aha_base_url: "+ appEnv.getEnvVar("aha_base_url"));

});

var request = require("request");
var config = require ('./configs.js').config;

var base_url = appEnv.getEnvVar('aha_base_url');
var access_token = appEnv.getEnvVar('aha_access_token');
var ghe_url = appEnv.getEnvVar('ghe_url');
var ghe_personal_token = appEnv.getEnvVar('ghe_personal_token');

//var aha_labels = config.aha_labels;
var aha_labels_file = require('./data/aha_labels.json');
var aha_labels = aha_labels_file.aha_labels;
var componentfile = require('./data/component.json');



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


// start of  SSO

var saml2 = require('saml2-js');
var Saml2js = require('saml2js');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(bodyParser());

// Create service provider
var sp_options = {
  entity_id: "https://bigblue.w3ibm.mybluemix.net/metadata.xml",
  //private_key: fs.readFileSync("cert/key.pem").toString(),
  //certificate: fs.readFileSync("cert/cert.pem").toString(),
  assert_endpoint: "https://bigblue.w3ibm.mybluemix.net/login"
};
var sp = new saml2.ServiceProvider(sp_options);

//

var idp_options = {
  sso_login_url: "https://w3id.alpha.sso.ibm.com/auth/sps/samlidp/saml20/logininitial?RequestBinding=HTTPPost&PartnerId=https://bigblueaha.w3ibm.mybluemix.net/&NameIdFormat=email&Target=https://bigblueaha.w3ibm.mybluemix.net/assert"

  //certificates: fs.readFileSync("cert/w3id.sso.ibm.com").toString()
};
var idp = new saml2.IdentityProvider(idp_options);

// ------ Define express endpoints ------

// Starting point for login
app.get("/login", function(req, res) {
  //console.log(idp);
  sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
    if (err != null)
      return res.send(500);
    console.log(login_url);
    res.redirect(login_url);
  });
});

/**
function createUser(p_product,p_firstName,p_lastName,p_eMail,p_role){
  //p_role:  product_owner, contributor, reviewer, viewer, none
  var newUser = {
      user: {
          email: p_eMail,
          first_name: p_firstName,
          last_name: p_lastName,
          role: p_role
      }
  };

  var create_user_option = {
    method: 'POST',
    url: base_url + '/api/v1/products/' + p_product + '/users' ,
    headers: { authorization: access_token },
    //body: newUser,
    json: true
  };
  create_user_option.body = newUser;

  console.log("newUser to create: " + newUser);

  request(create_user_option,function(error,response,body){
    if (error) throw new Error(error);
    console.log("creat new users:" + body);
  });
}
**/

// Assert endpoint for when login completes
app.post("/assert", function(req, res) {
//app.post("/login/callback", function(req, res) {
  var options = {request_body: req };
  //console.log('Body' + JSON.stringify(req.body)) ;
  var response = new Buffer(req.body.SAMLResponse || req.body.SAMLRequest, 'base64');
  var parser = new Saml2js(response);
  var userFromW3 = parser.toObject();
  //var creatResult = createUser('COMPANY',userFromW3.firstName,userFromW3.lastName,userFromW3.emailaddress,'reviewer');

  var newUser = {
      user: {
          email: userFromW3.emailaddress,
          first_name: userFromW3.firstName,
          last_name: userFromW3.lastName,
          role: 'reviewer'
      }
  };

  var create_user_option = {
    method: 'POST',
    url: base_url + '/api/v1/products/' + 'COMPANY' + '/users' ,
    headers: {
      authorization: access_token,
     },
    //body: newUser,
    json: true
  };
  create_user_option.body = newUser;

  console.log("newUser to create: \n");
  console.log(newUser);

  request(create_user_option,function(error,response,body){
    if (error) throw new Error(error);


    console.log("call Aha API to create user: \n");
    console.log(response.headers);
    //console.log(userFromW3);
    res.write ("w3 login info: \n" + "<div>" + JSON.stringify(userFromW3) + "/div" + "\n");
    res.write ("======================================================\n");
    res.write ("Create User at https://bigblue.aha.io \n" + JSON.stringify(body) + "\n");
    res.end();
  });

});
