const GoogleWifiApi = require("/usr/src/app/node_modules/google-wifi-api-node/index");
const axios = require("/usr/src/app/node_modules/axios");
const cron = require("/usr/src/app/node_modules/node-cron");

async function getAccessPointsInfo(googleWifiApi) {
  let groups;
  try {
    groups = await googleWifiApi.getGroups();
    const groupsStatus = await googleWifiApi.getGroupStatus(
      groups.groups[0].id
    );
    groups.groups[0].accessPoints.forEach((accessPoint) => {
      accessPoint.apState = groupsStatus.apStatuses.find(
        (apStatus) => apStatus.apId === accessPoint.id
      )?.apState;
    });
  } catch (error) {
    console.error("Could not get access points infos", error);
  }

  groups.groups[0].accessPoints.forEach(async (accessPoint) => {
    try {
      await axios.post(
        "http://supervisor/core/api/states/sensor.nest_wifi_access_points_" +
          accessPoint.accessPointSettings.accessPointOtherSettings.apName
            .toLowerCase()
            .replace(/\s/g, "_"),
        {
          state: accessPoint.apState,
          attributes: { data: accessPoint },
        },
        {
          headers: { Authorization: "Bearer " + process.env.SUPERVISOR_TOKEN },
        }
      );
      console.log("Posted Nest Wifi Access Points to Hass");
    } catch (error) {
      console.log(
        "Could not send Access Points sensor status to Home Assistant",
        error
      );
      process.exit(1);
    }
  });

  return groups;
}

async function getDevicesInfo(googleWifiApi, groups) {
  let devices;
  try {
    devices = await googleWifiApi.getGroupDevices(groups.groups[0].id);
  } catch (error) {
    console.error("Could not get devices infos", error);
  }

  try {
    await axios.post(
      "http://supervisor/core/api/states/sensor.nest_wifi_devices",
      {
        state: devices.stations.length,
        attributes: { data: devices.stations },
      },
      {
        headers: { Authorization: "Bearer " + process.env.SUPERVISOR_TOKEN },
      }
    );
    console.log("Posted Nest Wifi Devices to Hass");
  } catch (error) {
    console.log(
      "Could not send Devices sensor status to Home Assistant",
      error
    );
    process.exit(1);
  }
}

async function getSpeedTestResults(googleWifiApi, groups) {
  let speedTestResults;
  try {
    speedTestResults = await googleWifiApi.getGroupSpeedTestResults(
      groups.groups[0].id
    );
  } catch (error) {
    console.error("Could not get speed test results", error);
  }

  try {
    await axios.post(
      "http://supervisor/core/api/states/sensor.nest_wifi_download_speed",
      {
        state: Math.round(
          parseInt(speedTestResults.speedTestResults[0].receiveWanSpeedBps) /
            1000000
        ),
        attributes: {
          data: speedTestResults.speedTestResults[0],
          state_class: "measurement",
          last_successful_update:
            speedTestResults.speedTestResults[0].timestamp,
          unit_of_measurement: "Mbps",
          device_class: "battery",
          friendly_name: "Nest download speed",
        },
      },
      {
        headers: { Authorization: "Bearer " + process.env.SUPERVISOR_TOKEN },
      }
    );
    await axios.post(
      "http://supervisor/core/api/states/sensor.nest_wifi_upload_speed",
      {
        state: Math.round(
          parseInt(speedTestResults.speedTestResults[0].transmitWanSpeedBps) /
            1000000
        ),
        attributes: {
          data: speedTestResults.speedTestResults[0],
          state_class: "measurement",
          last_successful_update:
            speedTestResults.speedTestResults[0].timestamp,
          unit_of_measurement: "Mbps",
          device_class: "battery",
          friendly_name: "Nest upload speed",
        },
      },
      {
        headers: { Authorization: "Bearer " + process.env.SUPERVISOR_TOKEN },
      }
    );
    console.log("Posted Nest Wifi Speed Test Results to Hass");
  } catch (error) {
    console.log(
      "Could not send Speed Test Results sensor status to Home Assistant",
      error
    );
    process.exit(1);
  }
}

async function getInfos(googleWifiApi) {
  const groups = await getAccessPointsInfo(googleWifiApi);
  await getDevicesInfo(googleWifiApi, groups);
  await getSpeedTestResults(googleWifiApi, groups);
}

module.exports = async (options) => {
  if (!options.googleWifiApiKey) {
    console.error("No options.googleWifiApiKey provided");
    return;
  }
  const googleWifiApi = new GoogleWifiApi(options.googleWifiApiKey);
  await googleWifiApi.init();

  cron.schedule("* * * * *", () => {
    getInfos(googleWifiApi);
    console.log("getInfos cronjob executed at: " + new Date());
  });
};
