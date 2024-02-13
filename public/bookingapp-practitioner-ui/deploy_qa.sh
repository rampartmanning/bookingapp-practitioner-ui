cp settings/settings-qa.js src/settings.js
npm run build
aws s3 sync ./dist s3://bookingapp-practitioner-ui-qa
# reset to back to dev version for local development
cp settings/settings-dev.js src/settings.js
echo "DONE: Deployed to qa environment"
echo "https://p-qa.healthcasa.com/"