const enedisPowerCut = require('/usr/src/app/enedis-power-cut');
const options = require('./options');

(async () => {
  await enedisPowerCut(options);
})();
