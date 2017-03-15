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

app.set('views', __dirname + '/public/views')
app.set('view engine', 'pug');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening

  console.log("server starting on " + appEnv.url);
  console.log("__dirname: " + __dirname);
});

var request = require("request");


//variable for https://bigblue.aha.io
var aha_base_url = appEnv.getEnvVar('aha_base_url');
var aha_access_token = appEnv.getEnvVar('aha_access_token');

//variable for https://github.ibm.com
var ghe_url = appEnv.getEnvVar('ghe_url');
var ghe_personal_token = appEnv.getEnvVar('ghe_personal_token');

//variable for w3id SSO
var sp_entity_id = appEnv.getEnvVar('sp_entity_id');
var sp_assert_endpoint = appEnv.getEnvVar('sp_assert_endpoint');
var idp_sso_login_url = appEnv.getEnvVar('idp_sso_login_url');


var aha_labels_file = require('./data/aha_labels.json');
var aha_labels = aha_labels_file.aha_labels;
var componentfile = require('./data/component.json');



function postMilestone(components, releases){

   for (var i = 0; i < components.length; i ++){
     component = components[i].reference_prefix;
     for (var j =  0; j < releases.length; j++){
       var post_release_options = {
         method: 'POST',
         url: aha_base_url + '/api/v1/products/' + component + '/releases' ,
         headers: { authorization: aha_access_token },
         //body: releases[j],
         json: true
       };
       console.log(component);
       post_release_options.body = releases[j];

       console.log(post_release_options.body);

       request(post_release_options,function(error,response,body){
         if (error) throw new Error(error);
         console.log("postMilestones: " + body.url.toString());

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
        console.log(body);
      });
  }
  res.send("https://github.ibm.com/" + req.params.org + "/" + req.params.repo + "/labels \n"+ "\n Aha labels created successfully!");

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
  entity_id: sp_entity_id,
  //private_key: fs.readFileSync("cert/key.pem").toString(),
  //certificate: fs.readFileSync("cert/cert.pem").toString(),
  assert_endpoint: sp_assert_endpoint
};
var sp = new saml2.ServiceProvider(sp_options);

//

var idp_options = {
  sso_login_url: idp_sso_login_url
  //certificates: fs.readFileSync("cert/w3id.sso.ibm.com").toString()
};
var idp = new saml2.IdentityProvider(idp_options);

// ------ Define express endpoints ------

// Starting point for login
app.use("/login", function(req, res) {
  //console.log(idp);
  sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
    if (err != null)
      return res.send(500);
    console.log(login_url);
    res.redirect(login_url);
  });
});


function createUser(p_product,p_firstName,p_lastName,p_eMail,p_role, callback){
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
    url: aha_base_url + '/api/v1/products/' + p_product + '/users' ,
    headers: { authorization: aha_access_token },
    //body: newUser,
    json: true
  };
  create_user_option.body = newUser;

  request(create_user_option,function(error,response,body){
    if (error) throw new Error(error);
    callback(body);
  });
}


// Assert endpoint for when login completes
app.post("/assert", function(req, res) {
//app.post("/login/callback", function(req, res) {
  var options = {request_body: req };
  //console.log('Body' + JSON.stringify(req.body)) ;
  var response = new Buffer(req.body.SAMLResponse || req.body.SAMLRequest, 'base64');
  var parser = new Saml2js(response);
  var userFromW3 = parser.toObject();
  console.log("userFromW3:" + JSON.stringify(userFromW3) + "\n");

  var qs_options = { method: 'GET',
      url: aha_base_url + '/api/v1/users/',
      qs: { email: userFromW3.emailaddress },
      headers:{ authorization: aha_access_token }, 
      json: true
  };


  request(qs_options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log("User Query: " + body);
    if (body.users == undefined){
      //the user does not exist in Aha! create the user with "reviewer" role!
      console.log("user does not exist in Aha! Create user with reviewer role");
      createUser('COMPANY',userFromW3.firstName,userFromW3.lastName,userFromW3.emailaddress,'reviewer', function(body){
        if (body.error){
          res.json(body);
          res.end();
        }
        else{
          res.render('assert', {
            title: 'Create User at https://bigblue.aha.io successfully',
            message: "User: " + body.user.name + " " + body.user.email + " has been created in Aha as a " + body.role_description
          });
          res.end();
        }
      });

    }// end of (body.users == undefined)
    else if ((body.users).length == 1){
      console.log("user exist");
      var user = body.users[0];
      console.log( user.product_roles);
      var product_role = user.product_roles[0];
      var user_id = user.id;
      if ( product_role == undefined || product_role == null || (product_role.product_id == '6296862418650925049' && product_role.role == 0) ) {
          console.log("user is a none on IBM");
          //TODO: update user role
            var update_product_roles = {
              method: 'POST',
              url: aha_base_url + '/api/v1/users/' + user_id + '/product_roles' ,
              headers: { authorization: aha_access_token },
              body: { product_role: { role: 'reviewer', product_id: '6296862418650925049' } },
              json: true
            };

            request(update_product_roles, function(error,response,body){
                if (error) throw new Error(error);
                console.log(body);
                res.render('assert', {
                  title: 'Update User at https://bigblue.aha.io successfully',
                  message: 'Your role in Aha! has been updated to a reviewer on IBM.' 
                });
                res.end();
            });

      } 
      else {


        res.render('assert',
          { title: 'Create User at https://bigblue.aha.io failed',
            message: "Create user at https://bigblue.aha.io failed. \n Reason: the email is already in use \n You should already have a user in Aha!\n Contact your OM to grant your role in Aha!"
          }
        );
        res.end();
      }

    }
    else{

      // more than one user has the same email addres...
      // should not exist
      console.log("More than one user has the same email address...");
      res.json(body);
    }

  }); // end of user qs request

});
