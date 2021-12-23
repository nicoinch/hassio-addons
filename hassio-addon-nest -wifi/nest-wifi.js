const GoogleWifiApi = require('/usr/src/app/node_modules/google-wifi-api-node/index');
const axios = require('/usr/src/app/node_modules/axios');
const cron = require('/usr/src/app/node_modules/node-cron');

async function getInfos(googleWifiApi) {
  const groups = await googleWifiApi.getGroups();
  try {
    await axios.post(
      'http://supervisor/core/api/states/sensor.nest_wifi_access_points',
      {
        state: groups.groups[0].accessPoints.length,
        attributes: { data: groups.groups[0].accessPoints },
      },
      {
        headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
      },
    );
    console.log('Posted Nest Wifi to Hass');
  } catch (error) {
    console.log('Could not send sensor status to Home Assistant', error);
  }

  const devices = await googleWifiApi.getGroupDevices(groups.groups[0].id);
  try {
    await axios.post(
      'http://supervisor/core/api/states/sensor.nest_wifi_devices',
      {
        state: devices.stations.length,
        attributes: { data: devices.stations },
      },
      {
        headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
      },
    );
    console.log('Posted Nest Wifi to Hass');
  } catch (error) {
    console.log('Could not send sensor status to Home Assistant', error);
  }
}

module.exports = async options => {
  if (!options.googleWifiApiKey) {
    console.error('No options.googleWifiApiKey provided');
    return;
  }
  const googleWifiApi = new GoogleWifiApi(options.googleWifiApiKey);
  await googleWifiApi.init();

  cron.schedule('* * * * *', () => {
    getInfos(googleWifiApi);
    console.log('getInfos cronjob executed at: ' + new Date());
  });
};
