
sheny@us.ibm.com

## Run the app locally

1. [Install Node.js][]
2. cd into the app directory
3. Run `node app.js` to start the app
4. POST http://server:port/milestones
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
5. GET http://server:port/ghelabels/:org/:repo
6. SSO https://bigblueaha.w3ibm.mybluemix.net/login
