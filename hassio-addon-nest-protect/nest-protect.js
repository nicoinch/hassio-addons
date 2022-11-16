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

  async updateSensorState(
    sensorId,
    state,
    friendlyName,
    deviceClass,
    icon,
    swVersion,
    unitOfMeasurement = undefined,
  ) {
    const payload = {
      state: state,
      entity_category: 'diagnostic',
      attributes: {
        unique_id: sensorId,
        friendly_name: friendlyName,
        device_class: deviceClass,
        icon: icon,
        device_info: {
          identifiers: [sensorId],
          manufacturer: 'Nest',
          model: 'Protect',
          name: friendlyName,
          sw_version: swVersion,
        },
      },
    };

    if (unitOfMeasurement) {
      payload.attributes = {
        ...payload.attributes,
        unit_of_measurement: unitOfMeasurement,
      };
    }

    try {
      await axios.post(
        'http://supervisor/core/api/states/' + sensorId,
        payload,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.SUPERVISOR_TOKEN,
          },
        },
      );
      console.log('Posted Nest Protect');
    } catch (error) {
      console.error(
        'Could not send Nest Protect Devices sensor status to Home Assistant',
        error,
      );
      process.exit(1);
    }
  }

  async start() {
    this.conn = await this.setupConnection(true, false);

    const handleUpdates = async data => {
      console.log('Got Nest Protect Devices data');
      Object.values(data?.devices?.smoke_co_alarms || []).forEach(
        async device => {
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_co_status`,
            device.co_status !== 0,
            device.name + ' CO Status',
            'co',
            'mdi:molecule-co',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_smoke_status`,
            device.smoke_alarm_state !== 'ok',
            device.name + ' Smoke Status',
            'smoke',
            'mdi:smoke-detector',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_heat_status`,
            device.heat_status !== 0,
            device.name + ' Heat Status',
            'problem',
            'mdi:fire',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_speaker_test_passed`,
            device.component_speaker_test_passed,
            device.name + ' Speaker Test',
            'problem',
            'mdi:speaker-wireless',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_battery_health_state`,
            device.battery_health_state !== 0,
            device.name + ' Battery Health',
            'battery',
            'mdi:battery',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_is_online`,
            device.is_online,
            device.name + ' Online',
            'connectivity',
            'mdi:wifi',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_smoke_test_passed`,
            device.component_smoke_test_passed,
            device.name + ' Smoke Test',
            'problem',
            'mdi:smoke',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_co_test_passed`,
            device.component_co_test_passed,
            device.name + ' CO Test',
            'problem',
            'mdi:molecule-co',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_wifi_test_passed`,
            device.component_wifi_test_passed,
            device.name + ' WiFi Test',
            'problem',
            'mdi:wifi',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_led_test_passed`,
            device.component_led_test_passed,
            device.name + ' LED Test',
            'problem',
            'mdi:led-off',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_pir_test_passed`,
            device.component_pir_test_passed,
            device.name + ' PIR Test',
            'problem',
            'mdi:run',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_buzzer_test_passed`,
            device.component_buzzer_test_passed,
            device.name + ' Buzzer Test',
            'problem',
            'mdi:alarm-bell',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_heat_test_passed`,
            device.component_heat_test_passed,
            device.name + ' Heat Test',
            'problem',
            'mdi:fire',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_component_hum_test_passed`,
            device.component_hum_test_passed,
            device.name + ' Humidity Test',
            'problem',
            'mdi:water-percent',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_auto_away`,
            device.auto_away,
            device.name + ' Occupancy',
            'occupancy',
            'mdi:water-percent',
            device.software_version,
          );
          await this.updateSensorState(
            `binary_sensor.nest_protect_${device.device_id}_line_power_present`,
            device.line_power_present,
            device.name + ' Line Power',
            'power',
            'mdi:electricity',
            device.software_version,
          );
          await this.updateSensorState(
            `sensor.nest_protect_${device.device_id}_battery_level`,
            device.battery_level,
            device.name + ' Battery Level',
            'battery',
            'mdi:battery',
            device.software_version,
            'percentage',
          );
          await this.updateSensorState(
            `sensor.nest_protect_${device.device_id}_replace_by_date_utc_secs`,
            device.replace_by_date_utc_secs,
            device.name + ' Replace By',
            'date',
            'mdi:battery',
            device.software_version,
            'percentage',
          );
          console.log('Posted Nest Protect Devices to Hass');
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

/*
NestProtectBinarySensorDescription(
    key="co_status",
    name="CO Status",
    device_class=BinarySensorDeviceClass.CO,
    value_fn=lambda state: state == 3,
),
NestProtectBinarySensorDescription(
    key="smoke_status",
    name="Smoke Status",
    device_class=BinarySensorDeviceClass.SMOKE,
    value_fn=lambda state: state == 3,
),
NestProtectBinarySensorDescription(
    key="heat_status",
    name="Heat Status",
    device_class=BinarySensorDeviceClass.HEAT,
    value_fn=lambda state: state == 3,
),
NestProtectBinarySensorDescription(
    key="component_speaker_test_passed",
    name="Speaker Test",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:speaker-wireless",
),
NestProtectBinarySensorDescription(
    key="battery_health_state",
    name="Battery Health",
    value_fn=lambda state: state,
    device_class=BinarySensorDeviceClass.BATTERY,
    entity_category=EntityCategory.DIAGNOSTIC,
),
NestProtectBinarySensorDescription(
    key="component_wifi_test_passed",
    name="Online",
    value_fn=lambda state: state,
    device_class=BinarySensorDeviceClass.CONNECTIVITY,
    entity_category=EntityCategory.DIAGNOSTIC,
),
NestProtectBinarySensorDescription(
    name="Smoke Test",
    key="component_smoke_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:smoke",
),
NestProtectBinarySensorDescription(
    name="CO Test",
    key="component_co_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:molecule-co",
),
NestProtectBinarySensorDescription(
    name="WiFi Test",
    key="component_wifi_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:wifi",
),
NestProtectBinarySensorDescription(
    name="LED Test",
    key="component_led_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:led-off",
),
NestProtectBinarySensorDescription(
    name="PIR Test",
    key="component_pir_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:run",
),
NestProtectBinarySensorDescription(
    name="Buzzer Test",
    key="component_buzzer_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:alarm-bell",
),
# Disabled for now, since it seems like this state is not valid
# NestProtectBinarySensorDescription(
#     name="Heat Test",
#     key="component_heat_test_passed",
#     value_fn=lambda state: not state,
#     device_class=BinarySensorDeviceClass.PROBLEM,
#     entity_category=EntityCategory.DIAGNOSTIC,
#     icon="mdi:fire",
# ),
NestProtectBinarySensorDescription(
    name="Humidity Test",
    key="component_hum_test_passed",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.PROBLEM,
    entity_category=EntityCategory.DIAGNOSTIC,
    icon="mdi:water-percent",
),
NestProtectBinarySensorDescription(
    name="Occupancy",
    key="auto_away",
    value_fn=lambda state: not state,
    device_class=BinarySensorDeviceClass.OCCUPANCY,
    wired_only=True,
),
NestProtectBinarySensorDescription(
    name="Line Power",
    key="line_power_present",
    value_fn=lambda state: state,
    device_class=BinarySensorDeviceClass.POWER,
    entity_category=EntityCategory.DIAGNOSTIC,
    wired_only=True,
),


NestProtectSensorDescription(
    key="battery_level",
    name="Battery Level",
    value_fn=lambda state: state if state <= 100 else None,
    device_class=SensorDeviceClass.BATTERY,
    native_unit_of_measurement=PERCENTAGE,
    entity_category=EntityCategory.DIAGNOSTIC,
),
NestProtectSensorDescription(
    name="Replace By",
    key="replace_by_date_utc_secs",
    value_fn=lambda state: datetime.datetime.utcfromtimestamp(state),
    device_class=SensorDeviceClass.DATE,
    entity_category=EntityCategory.DIAGNOSTIC,
),
NestProtectSensorDescription(
    name="Temperature",
    key="current_temperature",
    value_fn=lambda state: round(state, 2),
    device_class=SensorDeviceClass.TEMPERATURE,
    native_unit_of_measurement=TEMP_CELSIUS,
),

auto_away_decision_time_secs: 600
auto_away: true
battery_health_state: 0
battery_health: ok
battery_level: 5185
buzzer_test_results: 16384
capability_level: 2
certification_body: 2
co_alarm_state: ok
co_blame_duration: 0
co_blame_threshold: 0
co_previous_peak: 0
co_sequence_number: 0
co_status: 0
component_als_test_passed: true
component_buzzer_test_passed: true
component_co_test_passed: true
component_heat_test_passed: false
component_hum_test_passed: true
component_led_test_passed: true
component_pir_test_passed: true
component_smoke_test_passed: true
component_speaker_test_passed: true
component_temp_test_passed: true
component_us_test_passed: false
component_wifi_test_passed: true
creation_time: 1637431097384
device_born_on_date_utc_secs: 1625443200
device_external_color: white
device_id: 18B43000418A6EBE
device_locale: fr_FR
fabric_id: 38C2E9B1880D77E2
friendly_name: Upstairs
gesture_hush_enable: false
heads_up_enable: true
heat_status: 0
home_alarm_link_capable: false
home_alarm_link_connected: false
home_alarm_link_type: 0
home_away_input: false
hushed_state: false
icon: mdi:smoke-detector
installed_locale: fr_FR
is_online: true
is_rcs_capable: false
is_rcs_used: false
kl_software_version: 3.4.5
last_audio_self_test_end_utc_secs: 1668598029
last_audio_self_test_start_utc_secs: 1668598026
latest_manual_test_cancelled: false
latest_manual_test_end_utc_secs: 1637431340
latest_manual_test_start_utc_secs: 1637431277
line_power_present: false
model: Topaz-2.33
name: Upstairs
night_light_brightness: 2
night_light_continuous: false
night_light_enable: true
ntp_green_led_brightness: 2
ntp_green_led_enable: true
product_id: 9
removed_from_base: false
replace_by_date_utc_secs: 1940976000
resource_id: topaz_resource.5
serial_number: 06AA01AC272100QA
smoke_alarm_state: ok
smoke_sequence_number: 0
smoke_status: 0
software_version: 3.4.1rc1
speaker_test_results: 16384
spoken_where_id: 00000000-0000-0000-0000-00010000000f
steam_detection_enable: true
structure_id: d58a18c0-c795-11e5-bce4-22000b5c12ea
thread_ip_address: fe80:0000:0000:0000:1ab4:3000:418a:6ebe, fdb1:880d:77e2:0002:1ab4:3000:418a:6ebe
thread_mac_address: 18b43000418a6ebe
where_id: 00000000-0000-0000-0000-00010000000f
where_name: Upstairs
wifi_ip_address: 192.168.86.233
wifi_mac_address: cca7c15ae40c
wifi_regulatory_domain: A1
wired_led_enable: true
wired_or_battery: 1
*/
