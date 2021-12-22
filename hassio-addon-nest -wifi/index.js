const options = require('./options');
const nestWifi = require('/usr/src/app/nest-wifi');

(async () => {
  console.log(options);
  await nestWifi(options);
})();
