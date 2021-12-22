const options = require('./options');
const nestWifi = require('./services/nest-wifi');

(async () => {
  console.log(options);
  await nestWifi(options);
})();
