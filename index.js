require('dotenv').config()
const newman = require('newman');

const postmanApiKey = process.env.POSTMAN_API_KEY
const postmanEnvironmentId = process.env.POSTMAN_ENVIRONMENT_ID
const environmentUrl = `https://api.getpostman.com/environments/${ postmanEnvironmentId }?apikey=${ postmanApiKey }`

const collections = Object.keys(process.env)
	.filter(k => /^POSTMAN_COLLECTION_ID/.test(k))
	.map(k => process.env[k])

let collectionUrl = null
let promises = []
for(i = 0; i < collections.length; i++) {
	collectionUrl = `https://api.getpostman.com/collections/${ collections[i] }?apikey=${ postmanApiKey }`
	promises.push(new Promise(resolve => {
		const runner = newman.run({
			collection: collectionUrl,
			environment: environmentUrl,
			iterationCount: 1,
			reporters: ['cli']
		}, (err) => {
			if (err) {
				console.error(err);
			}
			resolve(err) 
		})

		runner.on('done', function (err, summary) {
		    if (err || summary.error) {
			console.error('collection run encountered an error.');
		    }
		    else {
			console.log('collection run completed.');
		    }
		})

		runner.on('exception', function(e) {
			console.error('exception occurred', e)
		})
	}))
}

Promise.all(promises).then(p => console.info('all done'))
