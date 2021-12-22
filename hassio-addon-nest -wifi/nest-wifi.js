const GoogleWifiApi = require('/usr/src/app/node_modules/google-wifi-api-node/index');
const axios = require('/usr/src/app/node_modules/axios');
const cron = require('/usr/src/app/node_modules/node-cron');

const postReqOptions = {
  headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
};

async function getStations(googleWifiApi) {
  let sensorName = 'nest_wifi_stations';
  let sensorData;

  const groups = await googleWifiApi.getGroups();
  const devices = await googleWifiApi.getGroupDevices(groups.groups[0].id);
  sensorData = devices.stations.filter(device =>
    device.friendlyName.includes('Pixel'),
  );

  axios.post('http://supervisor/core/api/states/sensor.' + sensorName).then(
    response => {
      console.log('Posted Nest Wifi to Hass');
    },
    error => {
      console.log(error);
    },
  );
}

module.exports = async options => {
  if (!options.googleWifiApiKey) {
    console.error('No options.googleWifiApiKey provided');
    return;
  }
  const googleWifiApi = new GoogleWifiApi(options.googleWifiApiKey);
  await googleWifiApi.init();

  cron.schedule('*/30 * * * *', () => {
    getStations(googleWifiApi);
    console.log('getStations cronjob executed at: ' + new Date());
  });
};
