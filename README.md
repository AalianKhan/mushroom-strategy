# Mushroom dashboard strategy

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]

![Automatic](./docs/auto.png)

![Views](./docs/views.png)

![customizable](./docs/customizable.png)

## What is Mushroom dashboard strategy ?

Mushroom dashboard strategy provides a strategy for Home assistant to automatically create a dashboard using Mushroom cards, the area configuration and entity configuration.

My goal is to propose a way to create powerful dashaboards without the need of spending hours manualy creating them.

### Features

-   🛠 Automatically create dashboard with 3 lines of yaml
-   😍 Built-in Views for device specific controls
-   🎨 Many options to customize to your needs

## Installation

### HACS

Mushroom dashboard strategy is available in [HACS][hacs] (Home Assistant Community Store).

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Go to "Frontend" section
4. Click button with "+" icon
5. Search for "Mushroom strategy"

### Manual

1. Download `mushroom-strategy.js` file from the [latest-release].
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
## Preresquisites

You need to install these cards first before using this strategy
- [Mushroom cards][mushroom]
- [Mini graph card][mini-graph]
- [Web RTC][webrtc]

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

## Credits

* The cards used are from [Mushroom][mushroom], [Mini graph card][mini-graph] and [Web RTC][webrtc]
* Took inspiration from [Balloob battery strategy][balloobBattery]

<!-- Badges -->

[hacs-url]: https://github.com/hacs/integration
[hacs-badge]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square
[release-badge]: https://img.shields.io/github/v/release/lovelace-rounded/ui?style=flat-square
[downloads-badge]: https://img.shields.io/github/downloads/lovelace-rounded/ui/total?style=flat-square
[build-badge]: https://img.shields.io/github/actions/workflow/status/lovelace-rounded/ui/build.yml?branch=main&style=flat-square

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[home-assitant-theme-docs]: https://www.home-assistant.io/integrations/frontend/#defining-themes
[hacs]: https://hacs.xyz
[mushroom]: https://github.com/piitaya/lovelace-mushroom
[mini-graph]: https://github.com/kalkih/mini-graph-card
[webrtc]: https://github.com/AlexxIT/WebRTC
[balloobBattery]: https://gist.github.com/balloob/4a70c83287ddba4e9085cb578ffb161f
[release-url]: https://github.com/AalianKhan/mushroom-strategy/releases
