//config.js file to do the testing

var config =
{
  aha_base_url: 'https://bigblue.aha.io',
  aha_access_token: 'Bearer 14828d1e592ec3ae51b09f89dd4b4988af1a69320c9ca1c941342ef08b0f5077',
  ghe_url: 'https://github.ibm.com/api/v3',
  ghe_personal_token: 'f760dfddcc197a4384cb367349675180058e7730',
  aha_labels:[
    {
      name: 'Aha!:Dev Complete',
      color: '5319e7'
    },
    {
      name: 'Aha!:Defining',
      color: '5319e7'
    },
    {
      name: 'Aha!:In Design',
      color: '5319e7'
    },
    {
      name: 'Aha!:In Development',
      color: '5319e7'
    },
    {
      name: 'Aha!:New',
      color: '5319e7'
    },
    {
      name: 'Aha!:Ready for Design',
      color: '5319e7'
    },
    {
      name: 'Aha!:Ready for Development',
      color: '5319e7'
    },
    {
      name: 'Aha!:Shipped',
      color: '5319e7'
    },
    {
      name: 'Aha!:Will not do',
      color: '5319e7'
    }
  ]

};

exports.config = config;
