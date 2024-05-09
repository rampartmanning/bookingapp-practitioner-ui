cp settings/settings-prod.js src/settings.js
npm run build
aws s3 sync ./dist s3://bookingapp-practitioner-ui-prod
aws cloudfront create-invalidation --distribution-id E2A70KSM0V6IKE --paths "/*" > /dev/null 2>&1
# reset to back to dev version for local development
cp settings/settings-dev.js src/settings.js
echo "DONE: Deployed to prod environment"
echo "https://p.healthcasa.com/"