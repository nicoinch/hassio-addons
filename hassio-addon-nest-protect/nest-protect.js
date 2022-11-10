Promise.delay = function (time_ms) {
  return new Promise(resolve => setTimeout(resolve, time_ms));
};

Promise.prototype.asCallback = function (callback) {
  this.then(res => callback(null, res)).catch(err => callback(err));
};

Promise.prototype.return = function (val) {
  this.then(function () {
    return val;
  });
};

const axios = require('axios');
const NestConnection = require('/usr/src/app/node_modules/homebridge-nest/lib/nest-connection.js');

class NestProtect {
  constructor(log, config) {
    this.log = log;
    this.config = config;
    this.start();
  }

  async start() {
    this.conn = await this.setupConnection(true, false);

    const handleUpdates = async data => {
      console.log('Got Nest Protect Devices data');
      Object.values(data?.devices?.smoke_co_alarms || []).forEach(
        async device => {
          try {
            await axios.post(
              'http://supervisor/core/api/states/binary_sensor.nest_protect_' +
                device.device_id,
              {
                state:
                  device.is_online &&
                  device.smoke_alarm_state === 'ok' &&
                  device.co_alarm_state === 'ok' &&
                  device.battery_health === 'ok'
                    ? 'on'
                    : 'off',
                attributes: {
                  ...device,
                  friendly_name: device.name,
                  icon: 'mdi:smoke-detector',
                },
              },
              {
                headers: {
                  Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN,
                },
              },
            );
            console.log('Posted Nest Protect Devices to Hass');
          } catch (error) {
            console.error(
              'Could not send Nest Protect Devices sensor status to Home Assistant',
              error,
            );
            process.exit(1);
          }
        },
      );
    };
    await this.conn.subscribe(handleUpdates);
    await this.conn.observe(handleUpdates);
  }

  async setupConnection(verbose, fieldTestMode) {
    if (!this.config.googleAuth) {
      throw 'You did not specify your Nest account credentials googleAuth, in config';
    }

    if (
      this.config.googleAuth &&
      (!this.config.googleAuth.issueToken || !this.config.googleAuth.cookies)
    ) {
      // || !this.config.googleAuth.apiKey)) {
      throw 'When using googleAuth, you must provide issueToken and cookies in config.json. Please see README.md for instructions';
    }

    const conn = new NestConnection(
      this.config,
      this.log,
      verbose,
      fieldTestMode,
    );

    if (await conn.auth()) {
      return conn;
    } else {
      throw 'Unable to authenticate with Google/Nest.';
    }
  }
}

module.exports = async options => {
  if (!options.issueToken) {
    console.error('No options.issueToken provided');
    return;
  }
  if (!options.cookies) {
    console.error('No options.cookies provided');
    return;
  }
  new NestProtect(console, {
    googleAuth: {
      issueToken: options.issueToken,
      cookies: options.cookies,
    },
  });
};
