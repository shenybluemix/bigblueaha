https://bigblueaha.w3ibm.mybluemix.net/

Web Application for enhancement of Aha!(bigblue.aha.io) 

Contact: sheny@us.ibm.com

##Following API Endpoint##

1. POST /milestones
   -> Create milestones(releases) for components	
   Example:
   
    {
      "components":[
        {
          "reference_prefix":  "BP"
        },
        {
          "reference_prefix":  "TRAN"
        }
      ],
      "releases":[
        {
          "release":
          {
            "name":"TEST 2",
            "release_date": "2017-02-28"
          }
        },
        {
          "release":
          {
            "name":"TEST 3",
            "release_date": "2017-02-30"
          }
        }
      ]
    }
2. GET /ghelabels/:org/:repo
	-> Automatically create Aha! Labels 
3. GET /login
	-> Automatica create Aha "Reviewer" user through w3ID SSO 

