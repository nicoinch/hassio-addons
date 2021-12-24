const GoogleWifiApi = require('/usr/src/app/node_modules/google-wifi-api-node/index');
const axios = require('/usr/src/app/node_modules/axios');
const cron = require('/usr/src/app/node_modules/node-cron');

async function getInfos(googleWifiApi) {
  const groups = await googleWifiApi.getGroups();
  const groupsStatus = await googleWifiApi.getGroupStatus(groups.groups[0].id);
  groups.groups[0].accessPoints.forEach(accessPoint => {
    accessPoint.apState = groupsStatus.apStatuses.find(
      apStatus => apStatus.apId === accessPoint.id,
    )?.apState;
  });
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
    console.log('Posted Nest Wifi Access Points to Hass');
  } catch (error) {
    console.log(
      'Could not send Access Points sensor status to Home Assistant',
      error,
    );
    process.exit(1);
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
    console.log('Posted Nest Wifi Devices to Hass');
  } catch (error) {
    console.log(
      'Could not send Devices sensor status to Home Assistant',
      error,
    );
    process.exit(1);
  }

  const speedTestResults = await googleWifiApi.getGroupSpeedTestResults(
    groups.groups[0].id,
  );
  try {
    await axios.post(
      'http://supervisor/core/api/states/sensor.nest_wifi_speed_test_results',
      {
        state: Math.round(
          parseInt(speedTestResults.speedTestResults[0].transmitWanSpeedBps) /
            1000000,
        ),
        attributes: { data: speedTestResults.speedTestResults[0] },
      },
      {
        headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
      },
    );
    console.log('Posted Nest Wifi Speed Test Results to Hass');
  } catch (error) {
    console.log(
      'Could not send Speed Test Results sensor status to Home Assistant',
      error,
    );
    process.exit(1);
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
