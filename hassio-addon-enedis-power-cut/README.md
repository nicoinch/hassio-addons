# Enedis Power Cut addon

This addons requests the Enedis API to get the power cut schedule every two hours.

It uses home coordinates configured in Home Assistant to get address information needed to call the Enedis API.

It will create an entity `sensor.enedis_power_cut` with the following attributes:
- `address`: the address computed from Home Assitant coordinates,
- `shedding`: the shedding when a power cut is scheduled,
- `last_successful_update`: the last suxxessful update,
- `friendly_name`: 'Enedis Power Cut', 
- `icon`: the icon to use in the frontend.

The sensor state will be `scheduled` if a power cut is scheduled, `not_scheduled` if not power cut is scheduled and `unavailable` is the addon is not able to get Enedis informations fo any reason.