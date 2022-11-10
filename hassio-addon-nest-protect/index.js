const options = require('./options');
const nestProtect = require('/usr/src/app/nest-protect');

(async () => {
  await nestProtect(options);
})();
