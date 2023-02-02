// create and export config vars

//for ports by convention http happens on port 80; https happens on port 443

const environments = {} ;

// staging (default)
environments.staging = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName' : 'stagging',
    'mainIP' : '192.168.2.11',
    'gyroIP' : '192.168.0.101'
}

// production env
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'mainIP' : '192.168.2.11',
    'gyroIP' : '192.168.0.101'
}

//determine which env was passed in the command line
const currentEnvironment = typeof(process.env.NODE_ENV)  == 'string' ? process.env.NODE_ENV.toLowerCase(): '';

//check that the current env is one of the above, else go to staging
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

//export module
module.exports = environmentToExport;