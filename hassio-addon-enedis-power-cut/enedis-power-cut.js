const axios = require('/usr/src/app/node_modules/axios');
const cron = require('/usr/src/app/node_modules/node-cron');
const { getEnedisToken, getEnedisForecasts } = require('./enedis-api');

const getHomeCoordinates = async () => {
  try {
    const response = await axios.get(
      'http://supervisor/core/api/states/zone.home',
      {
        headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
      },
    );
    console.log('Got Home coordinates from Home Assistant', response.data);
    const {
      attributes: { latitude, longitude },
    } = response.data;
    return { latitude, longitude };
  } catch (error) {
    console.error(
      'Could not get Home coordinates from Home Assistant, ⚠️ PLEASE CHECK YOU CORRECTLY CONFIGURED HOME COORDINATES IN HOME ASSISTANT SETTINGS',
      error,
    );
    process.exit(1);
  }
};

const getHomeInfo = async coordinates => {
  try {
    const response = await axios.get(
      `https://api-adresse.data.gouv.fr/reverse/?lat=${coordinates.latitude}&lon=${coordinates.longitude}`,
      {
        headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
      },
    );
    console.log('Got Home Info from Gouv API', JSON.stringify(response.data));
    return response.data.features[0].properties;
  } catch (error) {
    console.error('Could not get Home Info coordinates from Gouv API', error);
    process.exit(1);
  }
};

const sendHomeAssistant = async (forecasts, label) => {
  try {
    await axios.post(
      'http://supervisor/core/api/states/sensor.enedis_power_cut',
      {
        state: !forecasts.success
          ? 'unavailable'
          : !forecasts.eld
          ? 'not_scheduled'
          : 'scheduled',
        attributes: {
          address: label,
          shedding: forecasts.shedding,
          last_successful_update: new Date(),
          friendly_name: 'Enedis Power Cut',
          icon: !forecasts.success
            ? 'mdi:help'
            : forecasts.eld
            ? 'mdi:power-plug'
            : 'mdi:power-plug-off',
        },
      },
      {
        headers: { Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN },
      },
    );
    console.log('Posted Enedis Power Cut to Hass', {
      state: !forecasts.success
        ? 'unavailable'
        : !forecasts.eld
        ? 'not_scheduled'
        : 'scheduled',
      attributes: {
        address: label,
        shedding: forecasts.shedding,
        last_successful_update: new Date(),
        friendly_name: 'Enedis Power Cut',
        icon: !forecasts.success
          ? 'mdi:help'
          : forecasts.eld
          ? 'mdi:power-plug-off'
          : 'mdi:power-plug',
      },
    });
  } catch (error) {
    console.error(
      'Could not send Enedis Power Cut sensor status to Home Assistant',
      error,
    );
    process.exit(1);
  }
};

module.exports = async options => {
  cron.schedule('0 0-23/2 * * *', async () => {
    const coordinates = await getHomeCoordinates();
    console.log('Coordinates', coordinates);
    const { label, housenumber, name, postcode, citycode, street } =
      await getHomeInfo(coordinates);
    console.log('Home Info', {
      label,
      housenumber,
      name,
      postcode,
      citycode,
      street,
    });
    const token = (await getEnedisToken()).token;
    const forecasts = await getEnedisForecasts(token, { citycode, street });
    console.log('forecasts', forecasts);
    await sendHomeAssistant(forecasts, label);
    console.log('getInfos cronjob executed at: ' + new Date());
  });
};
