
sheny@us.ibm.com

## Run the app locally

1. [Install Node.js][]
2. cd into the app directory
3. Update  'component.json' file under data folder
4. Update  'Release' variable in 'app.js'
5. Run `node app.js` to start the app
6. POST http://localhost:6001/milestones
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

7. The program will create the Milestones in all the component

[Install Node.js]: https://nodejs.org/en/download/
