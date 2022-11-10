const options = require('./options');
const nestWifi = require('/usr/src/app/nest-wifi');

(async () => {
  await nestWifi(options);
})();
