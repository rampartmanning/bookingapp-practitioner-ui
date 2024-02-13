cp settings/settings-dev.js src/settings.js
npm run build
aws s3 sync ./dist s3://bookingapp-practitioner-ui-dev
# reset to back to dev version for local development
cp settings/settings-dev.js src/settings.js
echo "DONE: Deployed to dev environment"
echo "https://bookingapp-practitioner-ui-dev.healthcasa.com/"