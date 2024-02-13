Practitioner UI Interface

Setup Instructions

- go to public/bookingapp-practitioner-ui
- run npm install
- copy settings/settings-dev.js to src/settings.js
- run npm run serve (to serve the app locally)

Deployment Instructions

- DEV: run deploy_dev.sh
- QA: run deploy_qa.sh
- PROD: run deploy_prod.sh

Architecture Notes

- This is a VUEJS app
- It calls its own API using the settings in settings.js, which is Lambda on API Gateway - see bookingapp-api repo
- It is deployed to S3 using CloudFront fronting.
- 
