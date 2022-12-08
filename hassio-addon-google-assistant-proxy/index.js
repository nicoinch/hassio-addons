const googleAssistantProxy = require('/usr/src/app/google-assistant-proxy');
const options = require('./options');

(async () => {
  await googleAssistantProxy(options);
})();
