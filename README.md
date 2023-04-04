# Mushroom dashboard strategy

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]

![Automatic](./docs/preview.gif)

![Automatic](./docs/auto.png)

![Views](./docs/views.png)

![customizable](./docs/customizable.png)

## What is Mushroom dashboard strategy ?

Mushroom dashboard strategy provides a strategy for Home assistant to automatically create a dashboard using Mushroom cards, the area configuration and entity configuration.

My goal is to propose a way to create powerful dashaboards without the need of spending hours manualy creating them.

**Note:** This is my first javascript code and github repository. Any recomendations are always welcome 

### Features

-   🛠 Automatically create dashboard with 3 lines of yaml
-   😍 Built-in Views for device specific controls
-   🎨 Many options to customize to your needs

## Installation

### Preresquisites

You need to install these cards first before using this strategy
- [Mushroom cards][mushroom]
- [Mini graph card][mini-graph]
- [Web RTC][webrtc]

### HACS

Mushroom dashboard strategy is available in [HACS][hacs] (Home Assistant Community Store).

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend" section
4. Click 3 dots on top right and custom repository
5. Add `https://github.com/AalianKhan/mushroom-strategy` with catagory `Lovelace`
5. Search for "Mushroom strategy" and install

### Manual

1. Download `mushroom-strategy.js` file from the [`dist`](https://github.com/AalianKhan/mushroom-strategy/tree/main/dist) directory.
2. Put `mushroom-strategy.js` file into your `config/www` folder.
3. Add reference to `mushroom-strategy.js` in Dashboard. There's two way to do that:
    - **Using UI:** _Settings_ → _Dashboards_ → _More Options icon_ → _Resources_ → _Add Resource_ → Set _Url_ as `/local/mushroom-strategy.js` → Set _Resource type_ as `JavaScript Module`.
      **Note:** If you do not see the Resources menu, you will need to enable _Advanced Mode_ in your _User Profile_
    - **Using YAML:** Add following code to `lovelace` section.
        ```yaml
        resources:
            - url: /local/mushroom-strategy.js
              type: module
        ```

## Usage

All the Rounded cards can be configured using Dashboard UI editor.

1. In Dashboard UI, click 3 dots in top right corner.
2. Click _Edit Dashboard_.
3. Click 3 dots again
4. Click `Raw configuration editor`
5. Add these lines
```yaml
strategy:
  type: custom:mushroom-strategy
views: []
```

### Hidding specific entities

When first creating this dashboard, you probably have many entities that you don't want to see. 

You can easily hide these entities by holding the entity > Click the `cog icon` at the top right corner of the popup > Click `Advanced settings` > Set `entity status` to `hidden`. Refresh the page and it should update

![Views](./docs/Hidden.png)

### Adding devices to areas

You can easiy add devices to an area by going to `Settings` found at the bottom of the sidebar > Click `Devices and integration` > Select the integration of your device > Click the device you wish to add > Click the `pencil icon` found at the top right corner > Enter an area in area field. You can also set an entity of that device to a different area by going to advanced settings of that entity.

If you created a entity in your `configuratation.yaml` you may need to enter a `unique_id` first before you set an area to it. See [docs](https://www.home-assistant.io/faq/unique_id/)

## Strategy options
You can set strategy options to further customize the dashboard. It has the following availible options

| Name                 | Type                   | Default                                                 | Description                                                                              | 
|:---------------------|:-----------------------|:--------------------------------------------------------|:-----------------------------------------------------------------------------------------|
| `areas`              | list                   | Optional                                                | One or more areas in a list, see [areas object](#area-object)                            |
| `entity_config`      | list of cards          | Optional                                                | Card defination for an entity, see [entity config](#entity-config)                       |
| `views`              | object                 | All views enabled                                       | Setting which pre-built views to show, see available [Pre-built views](#pre-built-views) |
| `chips`              | object                 | All count chips enabled with auto selected weather card | See [chips](#pre-built-chips)                                                            |
| `quick_access_cards` | list of cards          | Optional                                                | List of cards to show between welcome card and rooms cards                               |
| `extra_cards`        | list of cards          | Optional                                                | List of cards to show below room cards                                                   |
| `extra_chips`        | list of mushroom chips | Optional                                                | List of chips to show on home view                                                       |
| `extra_views`        | list of view           | Optional                                                | List of views to add to the dashboard                                                    |

#### Example 

```yaml
strategy:
  type: custom:mushroom-strategy
  options:
    areas:
      - name: Family Room
        icon: mdi:sofa
        icon_color: green
views: []
```
### Area Object

The area object includes all options from the template mushroom card and `extra_cards` which is a list of cards to show at the top of the area subview. The order of defination is used to sort the rooms and pre-built views

| Name                  | Type            | Default     | Description                                                                                                                         |
| :-------------------- | :-------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `name`                | string          | Required    | The name of the area                                                                                                                |
| `icon`                | string          | Optional    | Icon to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                              |
| `icon_color`          | string          | Optional    | Icon color to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                        |
| `primary`             | string          | Optional    | Primary info to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                      |
| `secondary`           | string          | Optional    | Secondary info to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                    |
| `badge_icon`          | string          | Optional    | Badge icon to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                        |
| `badge_color`         | string          | Optional    | Badge icon color to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                  |
| `picture`             | string          | Optional    | Picture to render. May contain [templates](https://www.home-assistant.io/docs/configuration/templating/).                           |
| `multiline_secondary` | boolean         | `false`     | Enables support for multiline text for the secondary info.                                                                          |
| `layout`              | string          | Optional    | Layout of the card. Vertical, horizontal and default layout are supported                                                           |
| `fill_container`      | boolean         | `false`     | Fill container or not. Useful when card is in a grid, vertical or horizontal layout                                                 |
| `tap_action`          | action          | `none`      | Home assistant action to perform on tap                                                                                             |
| `hold_action`         | action          | `none`      | Home assistant action to perform on hold                                                                                            |
| `entity_id`           | `string` `list` | Optional    | Only reacts to the state changes of these entities. This can be used if the automatic analysis fails to find all relevant entities. |
| `double_tap_action`   | action          | `more-info` | Home assistant action to perform on double_tap                                                                                      |
| `extra_cards`         | list of cards   | Optional    | A list of cards to show on the top of the area subview                                                                              |

#### Example

```yaml
areas:
  - name: Family Room
    icon: mdi:television
    icon_color: green
    extra_cards:
      - type: custom:mushroom-chips-card
        chips:
          - type: entity
            entity: sensor.family_room_temperature
            icon: mdi:thermometer
            icon_color: pink
        alignment: center
  - name: Kitchen
    icon: mdi:silverware-fork-knife
    icon_color: red
```

### Entity Config

The `entity_config` essentially enables you to give a specific entity any card you wish. 

#### Example
```yaml
entity_config:
  - entity: fan.master_bedroom_fan
    type: custom:mushroom-fan-card
```

### Pre-built views

Mushroom strategy includes pre-built views to control/view specific domains. Only the devices that are in an area and is also defined in `areas` are shown. By default, all views are shown

| Availible views | type | Description |
|:----------------|:-----|:------------|
| `lights` | boolean | View to control all lights and lights of each area |
| `fans` | boolean | View to control all fans and fans of each area |
| `covers` | boolean | View to control all covers and covers of each area |
| `switches` | boolean | View to control all switches and switches of each area |
| `climates` | boolean | View to control climate devices such as thermostates. Seperated by each area |
| `cameras` | boolean | View to show all cameras using WebRTC cards. Seperated by each area | 

#### Example

```yaml
views:
  lights: true
  switches: true
  covers: false
  cameras: true
  thermostats: false
```

### Pre-built chips

Mushroom strategy has chips that count the number of devices active for a specific domain. Only the devices that are in an area and is also defined in `areas` are counted. By default, all chips are enabled. You can also configure a weather entity to use. There is also an option to add more [Mushroom Chips][mushroom-chips]  
##### Note setting the status to hidden for the unwanted weather entity is recomended

| Availible chips | type    | Description                                                                                                       |
|:----------------|:--------|:------------------------------------------------------------------------------------------------------------------|
| `light_count`     | Boolean   | Chip to display the number of lights on, tapping turns off all lights, holding navigates to lights view       |
| `fan_count`       | Boolean   | Chip to display the number of fans on, tapping turns off all fans, holding navigates to fans view             |
| `cover_count`     | Boolean   | Chip to display the number of covers not closed, tapping navigates to covers view                             |
| `switch_count`    | Boolean   | Chip to display the number of switches on, tapping turns off all switches, holding navigates to switches view |
| `climate_count`   | Boolean   | Chip to display the number of climate not off, tapping naviagetes to climates view                            |
| `weather_entity`  | Entity ID | Entity ID for the weather chip to use, accepts `weather.` only                                                |
| `extra_chips`     | List      | List of extra chips to display, see [Mushroom Chips][mushroom-chips]                                          |

#### Example

```yaml
chips:
  climate_count: false
  cover_count: false
  weather_entity: weather.forecast_home
  extra_chips:
    - type: conditional
      conditions:
        - entity: lock.front_door
          state: unlocked
      chip:
        type: entity
        entity: lock.front_door
        icon_color: red
        content_info: none
        icon: ''
        use_entity_picture: false
        tap_action:
          action: toggle
```

## Full Example

```yaml
strategy:
  type: custom:mushroom-strategy
  options:
    views:
      lights: true
      switches: true
      covers: false
      cameras: true
      thermostats: false
    chips:
      weather_entity: weather.forecast_home
      climate_count: false
      cover_count: false
      extra_chips:
        - type: conditional
          conditions:
            - entity: lock.front_door
              state: unlocked
          chip:
            type: entity
            entity: lock.front_door
            icon_color: red
            content_info: none
            icon: ''
            use_entity_picture: false
            tap_action:
              action: toggle
        - type: conditional
          conditions:
            - entity: cover.garage_door
              state_not: closed
          chip:
            type: entity
            entity: cover.garage_door
            icon_color: red
            content_info: none
            tap_action:
              action: toggle
    areas:
      - name: Family Room
        icon: mdi:television
        icon_color: green
        extra_cards:
          - type: custom:mushroom-chips-card
            chips:
              - type: entity
                entity: sensor.family_room_temperature
                icon: mdi:thermometer
                icon_color: pink
            alignment: center
      - name: Kitchen
        icon: mdi:silverware-fork-knife
        icon_color: red
      - name: Master Bedroom
        icon: mdi:bed-king
        icon_color: blue
      - name: Abia's Bedroom
        icon: mdi:flower-tulip
        icon_color: green
      - name: Aalian's Bedroom
        icon: mdi:rocket-launch
        icon_color: yellow
      - name: Rohaan's Bedroom
        icon: mdi:controller
        icon_color: red
      - name: Hallway
      - name: Living Room
        icon: mdi:sofa
      - name: Front Door
        icon: mdi:door-closed
    entity_config:
      - entity: fan.master_bedroom_fan
        type: custom:mushroom-fan-card
    quick_access_cards:
      - type: custom:mushroom-title-card
        title: Security
      - type: custom:mushroom-cover-card
        entity: cover.garage_door
        show_buttons_control: true
      - type: horizontal-stack
        cards:
          - type: custom:mushroom-lock-card
            entity: lock.front_door
          - type: custom:mushroom-entity-card
            entity: sensor.front_door_lock_battery
            name: Battery
    extra_cards:
      - type: custom:xiaomi-vacuum-map-card
        map_source:
          camera: camera.xiaomi_cloud_map_extractor
        calibration_source:
          camera: true
        entity: vacuum.robot_vacuum
        vacuum_platform: default
    extra_views:
      - theme: Backend-selected
        title: cool view
        path: cool-view
        icon: mdi:emoticon-cool
        badges: []
        cards:
          - type: markdown
            content: I am cool
```


## Credits

* The cards used are from [Mushroom][mushroom], [Mini graph card][mini-graph] and [Web RTC][webrtc]
* Took inspiration from [Balloob battery strategy][balloobBattery]

<!-- Badges -->

[hacs-url]: https://github.com/hacs/integration
[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[release-badge]: https://img.shields.io/github/v/release/lovelace-rounded/ui?style=flat-square
[downloads-badge]: https://img.shields.io/github/downloads/lovelace-rounded/ui/total?style=flat-square
[build-badge]: https://img.shields.io/github/actions/workflow/status/lovelace-rounded/ui/build.yml?branch=main&style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[home-assitant-theme-docs]: https://www.home-assistant.io/integrations/frontend/#defining-themes
[hacs]: https://hacs.xyz
[mushroom]: https://github.com/piitaya/lovelace-mushroom
[mushroom-chips]: https://github.com/piitaya/lovelace-mushroom/blob/main/docs/cards/chips.md
[mini-graph]: https://github.com/kalkih/mini-graph-card
[webrtc]: https://github.com/AlexxIT/WebRTC
[balloobBattery]: https://gist.github.com/balloob/4a70c83287ddba4e9085cb578ffb161f
[release-url]: https://github.com/AalianKhan/mushroom-strategy/releases
