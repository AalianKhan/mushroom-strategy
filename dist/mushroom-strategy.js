(()=>{var t,e,i={84:(t,e,i)=>{"use strict";i.d(e,{W:()=>o});const s={home:{order:1,hidden:!1},light:{order:2,hidden:!1},fan:{order:3,hidden:!1},cover:{order:4,hidden:!1},switch:{order:5,hidden:!1},climate:{order:6,hidden:!1},camera:{order:7,hidden:!1}},r={aliases:[],area_id:null,name:"Undisclosed",picture:null,hidden:!1},a={default:{title:"Miscellaneous",showControls:!1,hidden:!1},light:{title:"Lights",showControls:!0,iconOn:"mdi:lightbulb",iconOff:"mdi:lightbulb-off",onService:"light.turn_on",offService:"light.turn_off",hidden:!1},fan:{title:"Fans",showControls:!0,iconOn:"mdi:fan",iconOff:"mdi:fan-off",onService:"fan.turn_on",offService:"fan.turn_off",hidden:!1},cover:{title:"Covers",showControls:!0,iconOn:"mdi:arrow-up",iconOff:"mdi:arrow-down",onService:"cover.open_cover",offService:"cover.close_cover",hidden:!1},switch:{title:"Switches",showControls:!0,iconOn:"mdi:power-plug",iconOff:"mdi:power-plug-off",onService:"switch.turn_on",offService:"switch.turn_off",hidden:!1},camera:{title:"Cameras",showControls:!1,hidden:!1},climate:{title:"Climates",showControls:!1,hidden:!1},media_player:{title:"Media Players",showControls:!1,hidden:!1},sensor:{title:"Sensors",showControls:!1,hidden:!1},binary_sensor:{title:"Binary Sensors",showControls:!1,hidden:!1}};class o{static#t;static#e;static#i=[];static#s;static#r=!1;static#a={};static debug=false;constructor(){throw new Error("This class should be invoked with method initialize() instead of using the keyword new!")}static get strategyOptions(){return this.#a}static get areas(){return this.#i}static get devices(){return this.#e}static get entities(){return this.#t}static get debug(){return this.debug}static async initialize(t){this.#s=t.hass.states;try{[this.#t,this.#e,this.#i]=await Promise.all([t.hass.callWS({type:"config/entity_registry/list"}),t.hass.callWS({type:"config/device_registry/list"}),t.hass.callWS({type:"config/area_registry/list"})])}catch(t){console.error(o.debug?t:"An error occurred while querying Home assistant's registries!")}this.#a=structuredClone(t.config.strategy.options||{}),this.debug=this.#a.debug,this.#a.areas=this.#a.areas??{},this.#a.views=this.#a.views??{},this.#a.domains=this.#a.domains??{},this.#a.areas.undisclosed?.hidden||(this.#a.areas.undisclosed={...r,...this.#a.areas.undisclosed},this.#a.areas.undisclosed.area_id=null,this.#i.push(this.#a.areas.undisclosed)),this.#i=o.areas.map((t=>({...t,...this.#a.areas[t.area_id??"undisclosed"]}))),this.#i.sort(((t,e)=>(t.order??1/0)-(e.order??1/0)||t.name.localeCompare(e.name)));for(const t of Object.keys(s))this.#a.views[t]={...s[t],...this.#a.views[t]};this.#a.views=Object.fromEntries(Object.entries(this.#a.views).sort((([,t],[,e])=>(t.order??1/0)-(e.order??1/0)||t.title?.localeCompare(e.title))));for(const t of Object.keys(a))this.#a.domains[t]={...a[t],...this.#a.domains[t]};this.#a.domains=Object.fromEntries(Object.entries(this.#a.domains).sort((([,t],[,e])=>(t.order??1/0)-(e.order??1/0)||t.title?.localeCompare(e.title)))),this.#r=!0}static isInitialized(){return this.#r}static getCountTemplate(t,e,i){const s=[];this.isInitialized()||console.warn("Helper class should be initialized before calling this method!");for(const e of this.#i){const i=this.#e.filter((t=>t.area_id===e.area_id)).map((t=>t.id)),r=this.#t.filter(this.#o,{area:e,domain:t,areaDeviceIds:i}).map((t=>`states['${t.entity_id}']`));s.push(...r)}return`{% set entities = [${s}] %} {{ entities | selectattr('state','${e}','${i}') | list | count }}`}static#o(t){return(this.area.area_id?this.areaDeviceIds.includes(t.device_id)||t.area_id===this.area.area_id:(this.areaDeviceIds.includes(t.device_id)||!t.device_id)&&!t.area_id)&&t.entity_id.startsWith(`${this.domain}.`)&&null==t.hidden_by&&null==t.disabled_by}static getDeviceEntities(t,e){this.isInitialized()||console.warn("Helper class should be initialized before calling this method!");const i=this.#e.filter((e=>e.area_id===t.area_id)).map((t=>t.id));return this.#t.filter(this.#o,{area:t,domain:e,areaDeviceIds:i}).sort(((t,e)=>t.original_name?.localeCompare(e.original_name)))}static getStateEntities(t,e){this.isInitialized()||console.warn("Helper class should be initialized before calling this method!");const i=[],s=Object.fromEntries(this.#t.map((t=>[t.entity_id,t]))),r=Object.fromEntries(this.#e.map((t=>[t.id,t]))),a=Object.values(this.#s).filter((t=>t.entity_id.startsWith(`${e}.`)));for(const e of a){const a=s[e.entity_id],o=r[a?.device_id];(a?.area_id===t.area_id||o&&o.area_id===t.area_id)&&i.push(e)}return i}static sanitizeClassName(t){return(t=t.charAt(0).toUpperCase()+t.slice(1)).replace(/([-_][a-z])/g,(t=>t.toUpperCase().replace("-","").replace("_","")))}static#n(t,e,i){const s=[];for(const r of Object.keys(t))t[r][e]===i&&s.push(r);return s}static getExposedViewIds(){return this.isInitialized()||console.warn("Helper class should be initialized before calling this method!"),this.#n(this.#a.views,"hidden",!1)}static getExposedDomainIds(){return this.isInitialized()||console.warn("Helper class should be initialized before calling this method!"),this.#n(this.#a.domains,"hidden",!1)}}},981:(t,e,i)=>{"use strict";i.r(e),i.d(e,{AbstractCard:()=>r});var s=i(84);class r{entity;options={type:"custom:mushroom-entity-card",icon:"mdi:help-circle",double_tap_action:{action:null}};constructor(t){if(this.constructor===r)throw new Error("Abstract classes can't be instantiated.");if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.");this.entity=t}mergeOptions(t,e){this.options={...this.options,...t,...e};try{this.options.double_tap_action.target.entity_id=this.entity.entity_id}catch{}}getCard(){return{entity:this.entity.entity_id,...this.options}}}},138:(t,e,i)=>{"use strict";i.r(e),i.d(e,{AreaCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-template-card",primary:void 0,icon:"mdi:texture-box",icon_color:"blue",tap_action:{action:"navigate",navigation_path:void 0},hold_action:{action:"none"}};constructor(t,e={}){super(t),this.#c.primary=t.name,this.#c.tap_action.navigation_path=t.area_id??t.name,this.mergeOptions(this.#c,e),!e.primary&&e.name&&(this.options.primary=e.name)}}},917:(t,e,i)=>{"use strict";i.r(e),i.d(e,{BinarySensorCard:()=>r});var s=i(408);class r extends s.SensorCard{#c={type:"custom:mushroom-entity-card",icon:"mdi:power-cycle",icon_color:"green"};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},497:(t,e,i)=>{"use strict";i.r(e),i.d(e,{CameraCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"picture-entity",show_name:!1,show_state:!1,camera_view:"live"};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},898:(t,e,i)=>{"use strict";i.r(e),i.d(e,{ClimateCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-climate-card",icon:void 0,hvac_modes:["off","cool","heat","fan_only"],show_temperature_control:!0};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},499:(t,e,i)=>{"use strict";i.r(e),i.d(e,{CoverCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-cover-card",icon:void 0,show_buttons_control:!0,show_position_control:!0,show_tilt_position_control:!0};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},297:(t,e,i)=>{"use strict";i.r(e),i.d(e,{FanCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-fan-card",icon:void 0,show_percentage_control:!0,show_oscillate_control:!0,icon_animation:!0};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},698:(t,e,i)=>{"use strict";i.r(e),i.d(e,{LightCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-light-card",icon:void 0,show_brightness_control:!0,show_color_control:!0,use_light_color:!0,double_tap_action:{target:{entity_id:void 0},action:"call-service",service:"light.turn_on",data:{rgb_color:[255,255,255]}}};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},568:(t,e,i)=>{"use strict";i.r(e),i.d(e,{MediaPlayerCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-media-player-card",use_media_info:!0,media_controls:["on_off","play_pause_stop"],show_volume_level:!0,volume_controls:["volume_mute","volume_set","volume_buttons"]};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},190:(t,e,i)=>{"use strict";i.r(e),i.d(e,{MiscellaneousCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-entity-card",icon_color:"blue-grey"};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},543:(t,e,i)=>{"use strict";i.r(e),i.d(e,{PersonCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-person-card",layout:"vertical",primary_info:"none",secondary_info:"none",icon_type:"entity-picture"};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},408:(t,e,i)=>{"use strict";i.r(e),i.d(e,{SensorCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-entity-card",icon:"mdi:information",animate:!0,line_color:"green"};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},177:(t,e,i)=>{"use strict";i.r(e),i.d(e,{SwitchCard:()=>r});var s=i(981);class r extends s.AbstractCard{#c={type:"custom:mushroom-entity-card",icon:void 0,tap_action:{action:"toggle"}};constructor(t,e={}){super(t),this.mergeOptions(this.#c,e)}}},402:(t,e,i)=>{"use strict";i.r(e),i.d(e,{TitleCard:()=>s});class s{#d;#l={title:void 0,subtitle:void 0,showControls:!0,iconOn:"mdi:power-on",iconOff:"mdi:power-off",onService:"none",offService:"none"};constructor(t,e={}){this.#d=t.map((t=>t.area_id)).filter((t=>t)),this.#l={...this.#l,...e}}createCard(){const t=[{type:"custom:mushroom-title-card",title:this.#l.title,subtitle:this.#l.subtitle}];return this.#l.showControls&&t.push({type:"horizontal-stack",cards:[{type:"custom:mushroom-template-card",icon:this.#l.iconOff,layout:"vertical",icon_color:"red",tap_action:{action:"call-service",service:this.#l.offService,target:{area_id:this.#d},data:{}}},{type:"custom:mushroom-template-card",icon:this.#l.iconOn,layout:"vertical",icon_color:"amber",tap_action:{action:"call-service",service:this.#l.onService,target:{area_id:this.#d},data:{}}}]}),{type:"horizontal-stack",cards:t}}}},244:()=>{},175:(t,e,i)=>{var s={"./AbstractCard":[981,9],"./AbstractCard.js":[981,9],"./AreaCard":[138,9,179],"./AreaCard.js":[138,9,179],"./BinarySensorCard":[917,9,179],"./BinarySensorCard.js":[917,9,179],"./CameraCard":[497,9,179],"./CameraCard.js":[497,9,179],"./ClimateCard":[898,9,179],"./ClimateCard.js":[898,9,179],"./CoverCard":[499,9,179],"./CoverCard.js":[499,9,179],"./FanCard":[297,9,179],"./FanCard.js":[297,9,179],"./LightCard":[698,9,179],"./LightCard.js":[698,9,179],"./MediaPlayerCard":[568,9,179],"./MediaPlayerCard.js":[568,9,179],"./MiscellaneousCard":[190,9,179],"./MiscellaneousCard.js":[190,9,179],"./PersonCard":[543,9,179],"./PersonCard.js":[543,9,179],"./SensorCard":[408,9],"./SensorCard.js":[408,9],"./SwitchCard":[177,9,179],"./SwitchCard.js":[177,9,179],"./TitleCard":[402,9],"./TitleCard.js":[402,9],"./typedefs":[244,7,179],"./typedefs.js":[244,7,179]};function r(t){if(!i.o(s,t))return Promise.resolve().then((()=>{var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}));var e=s[t],r=e[0];return Promise.all(e.slice(2).map(i.e)).then((()=>i.t(r,16|e[1])))}r.keys=()=>Object.keys(s),r.id=175,t.exports=r},354:(t,e,i)=>{"use strict";i.r(e),i.d(e,{ClimateChip:()=>r});var s=i(84);class r{#d;#l={};constructor(t,e={}){if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.");this.#d=t.filter((t=>t)),this.#l={...this.#l,...e}}getChip(){return{type:"template",icon:"mdi:thermostat",icon_color:"orange",content:s.W.getCountTemplate("climate","ne","off"),tap_action:{action:"navigate",navigation_path:"climates"},hold_action:{action:"navigate",navigation_path:"climates"}}}}},454:(t,e,i)=>{"use strict";i.r(e),i.d(e,{CoverChip:()=>r});var s=i(84);class r{#d;#l={};constructor(t,e={}){if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.");this.#d=t.filter((t=>t)),this.#l={...this.#l,...e}}getChip(){return{type:"template",icon:"mdi:window-open",icon_color:"cyan",content:s.W.getCountTemplate("cover","eq","open"),tap_action:{action:"navigate",navigation_path:"covers"}}}}},955:(t,e,i)=>{"use strict";i.r(e),i.d(e,{FanChip:()=>r});var s=i(84);class r{#d;#l={};constructor(t,e={}){if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.");this.#d=t.filter((t=>t)),this.#l={...this.#l,...e}}getChip(){return{type:"template",icon:"mdi:fan",icon_color:"green",content:s.W.getCountTemplate("fan","eq","on"),tap_action:{action:"call-service",service:"fan.turn_off",target:{area_id:this.#d},data:{}},hold_action:{action:"navigate",navigation_path:"fans"}}}}},980:(t,e,i)=>{"use strict";i.r(e),i.d(e,{LightChip:()=>r});var s=i(84);class r{#d;#l={};constructor(t,e={}){if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.");this.#d=t.filter((t=>t)),this.#l={...this.#l,...e}}getChip(){return{type:"template",icon:"mdi:lightbulb-group",icon_color:"amber",content:s.W.getCountTemplate("light","eq","on"),tap_action:{action:"call-service",service:"light.turn_off",target:{area_id:this.#d},data:{}},hold_action:{action:"navigate",navigation_path:"lights"}}}}},25:(t,e,i)=>{"use strict";i.r(e),i.d(e,{SwitchChip:()=>r});var s=i(84);class r{#d;#l={};constructor(t,e={}){if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.");this.#d=t.filter((t=>t)),this.#l={...this.#l,...e}}getChip(){return{type:"template",icon:"mdi:dip-switch",icon_color:"blue",content:s.W.getCountTemplate("switch","eq","on"),tap_action:{action:"call-service",service:"switch.turn_off",target:{area_id:this.#d},data:{}},hold_action:{action:"navigate",navigation_path:"switches"}}}}},369:(t,e,i)=>{"use strict";i.r(e),i.d(e,{WeatherChip:()=>s});class s{#h;#l={show_temperature:!0,show_conditions:!0};constructor(t,e={}){this.#h=t,this.#l={...this.#l,...e}}getChip(){return{type:"weather",entity:this.#h,...this.#l}}}},837:(t,e,i)=>{var s={"./ClimateChip":[354,179],"./ClimateChip.js":[354,179],"./CoverChip":[454,179],"./CoverChip.js":[454,179],"./FanChip":[955,179],"./FanChip.js":[955,179],"./LightChip":[980,179],"./LightChip.js":[980,179],"./SwitchChip":[25,179],"./SwitchChip.js":[25,179],"./WeatherChip":[369,179],"./WeatherChip.js":[369,179]};function r(t){if(!i.o(s,t))return Promise.resolve().then((()=>{var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}));var e=s[t],r=e[0];return i.e(e[1]).then((()=>i(r)))}r.keys=()=>Object.keys(s),r.id=837,t.exports=r},721:(t,e,i)=>{"use strict";i.r(e),i.d(e,{AbstractView:()=>a});var s=i(84),r=i(402);class a{options={title:null,path:null,icon:"mdi:view-dashboard",subview:!1};viewTitleCard;constructor(){if(this.constructor===a)throw new Error("Abstract classes can't be instantiated.");if(!s.W.isInitialized())throw new Error("The Helper module must be initialized before using this one.")}mergeOptions(t,e){this.options={...t,...e}}async createViewCards(){const t=[this.viewTitleCard];for(const e of s.W.areas){const a=[],o=s.W.getDeviceEntities(e,this.domain),n=s.W.sanitizeClassName(this.domain+"Card"),c=await i(175)(`./${n}`);for(const t of o){let e=s.W.strategyOptions.card_options?.[t.entity_id]??{};e.hidden||a.push(new c[n](t,e).getCard())}a.length&&(a.unshift(new r.TitleCard([e],{title:e.name,...this.options.titleCard},this.domain).createCard()),t.push({type:"vertical-stack",cards:a}))}return t.unshift(t.length?this.viewTitleCard:{type:"custom:mushroom-title-card",title:"No Entities Available",subtitle:"They're either hidden by the configuration or by Home Assistant."}),t}async getView(){return{...this.options,cards:await this.createViewCards()}}}},458:(t,e,i)=>{"use strict";i.r(e),i.d(e,{CameraView:()=>o});var s=i(84),r=i(402),a=i(721);class o extends a.AbstractView{#u="camera";#c={title:"Cameras",path:"cameras",icon:"mdi:cctv",subview:!1,titleCard:{showControls:!1}};#p={title:"All Cameras",...this.options.titleCard};constructor(t={}){super(),this.mergeOptions(this.#c,t),this.viewTitleCard=new r.TitleCard(s.W.areas,{...this.#p,...this.options.titleCard}).createCard()}get domain(){return this.#u}}},310:(t,e,i)=>{"use strict";i.r(e),i.d(e,{ClimateView:()=>o});var s=i(84),r=i(402),a=i(721);class o extends a.AbstractView{#u="climate";#c={title:"Climates",path:"climates",icon:"mdi:thermostat",subview:!1,titleCard:{showControls:!1}};#p={title:"All Climates",subtitle:s.W.getCountTemplate(this.domain,"ne","off")+" climates on",...this.options.titleCard};constructor(t={}){super(),this.mergeOptions(this.#c,t),this.viewTitleCard=new r.TitleCard(s.W.areas,{...this.#p,...this.options.titleCard}).createCard()}get domain(){return this.#u}}},401:(t,e,i)=>{"use strict";i.r(e),i.d(e,{CoverView:()=>o});var s=i(84),r=i(402),a=i(721);class o extends a.AbstractView{#u="cover";#c={title:"Covers",path:"covers",icon:"mdi:window-open",subview:!1,titleCard:{iconOn:"mdi:arrow-up",iconOff:"mdi:arrow-down",onService:"cover.open_cover",offService:"cover.close_cover"}};#p={title:"All Covers",subtitle:s.W.getCountTemplate(this.domain,"eq","open")+" covers open"};constructor(t={}){super(),this.mergeOptions(this.#c,t),this.viewTitleCard=new r.TitleCard(s.W.areas,{...this.#p,...this.options.titleCard}).createCard()}get domain(){return this.#u}}},902:(t,e,i)=>{"use strict";i.r(e),i.d(e,{FanView:()=>o});var s=i(84),r=i(402),a=i(721);class o extends a.AbstractView{#u="fan";#c={title:"Fans",path:"fans",icon:"mdi:fan",subview:!1,titleCard:{iconOn:"mdi:fan",iconOff:"mdi:fan-off",onService:"fan.turn_on",offService:"fan.turn_off"}};#p={title:"All Fans",subtitle:s.W.getCountTemplate(this.domain,"eq","on")+" fans on"};constructor(t={}){super(),this.mergeOptions(this.#c,t),this.viewTitleCard=new r.TitleCard(s.W.areas,{...this.#p,...this.options.titleCard}).createCard()}get domain(){return this.#u}}},530:(t,e,i)=>{"use strict";i.r(e),i.d(e,{HomeView:()=>a});var s=i(84),r=i(721);class a extends r.AbstractView{#c={title:"Home",path:"home",subview:!1};constructor(t={}){super(),this.mergeOptions(this.#c,t)}async createViewCards(){return await Promise.all([this.#m(),this.#f(),this.#g()]).then((([t,e,i])=>{const r=s.W.strategyOptions,a=[{type:"custom:mushroom-chips-card",alignment:"center",chips:t},{type:"horizontal-stack",cards:e},{type:"custom:mushroom-template-card",primary:"{% set time = now().hour %} {% if (time >= 18) %} Good Evening, {{user}}! {% elif (time >= 12) %} Good Afternoon, {{user}}! {% elif (time >= 5) %} Good Morning, {{user}}! {% else %} Hello, {{user}}! {% endif %}",icon:"mdi:hand-wave",icon_color:"orange",tap_action:{action:"none"},double_tap_action:{action:"none"},hold_action:{action:"none"}}];return r.quick_access_cards&&a.push(...r.quick_access_cards),a.push({type:"custom:mushroom-title-card",title:"Areas"},{type:"vertical-stack",cards:i}),r.extra_cards&&a.push(...r.extra_cards),a}))}async#m(){const t=[],e=s.W.strategyOptions.chips,r=["light","fan","cover","switch","climate"],a=s.W.areas.map((t=>t.area_id));let o;const n=e?.weather_entity??s.W.entities.find((t=>t.entity_id.startsWith("weather.")&&null==t.disabled_by&&null==t.hidden_by)).entity_id;if(n)try{o=await Promise.resolve().then(i.bind(i,369));const e=new o.WeatherChip(n);t.push(e.getChip())}catch(t){console.error(s.W.debug?t:"An error occurred while creating the weather chip!")}for(let n of r)if(e?.[`${n}_count`]??1){const e=s.W.sanitizeClassName(n+"Chip");try{o=await i(837)(`./${e}`);const s=new o[e](a);t.push(s.getChip())}catch(t){console.error(s.W.debug?t:`An error occurred while creating the ${n} chip!`)}}return e?.extra_chips&&t.push(...e.extra_chips),t}#f(){const t=[];return Promise.resolve().then(i.bind(i,543)).then((e=>{for(const i of s.W.entities.filter((t=>t.entity_id.startsWith("person.")&&null==t.hidden_by&&null==t.disabled_by)))t.push(new e.PersonCard(i).getCard())})),t}#g(){const t=[];return Promise.resolve().then(i.bind(i,138)).then((e=>{const i=[];for(const t of s.W.areas){let r=s.W.strategyOptions.areas[t.area_id??"undisclosed"],a=s.W.strategyOptions.areas[t.area_id]?.temperature,o=s.W.strategyOptions.areas[t.area_id]?.humidity,n=s.W.strategyOptions.areas[t.area_id]?.illuminance;if(!(a||o||n)){const e=s.W.getDeviceEntities(t,"sensor");if(e.length){const i=s.W.getStateEntities(t,"sensor");for(const t of e){const e=i.find((e=>e.entity_id===t.entity_id));"temperature"==e?.attributes.device_class&&"unavailable"!=e?.state&&(a=t.entity_id),"humidity"==e?.attributes.device_class&&"unavailable"!=e?.state&&(o=t.entity_id),"illuminance"==e?.attributes.device_class&&"unavailable"!=e?.state&&(n=t.entity_id)}}}if(a||o||n){let t="";a&&(t+=`❄️{{ states('${a}') | int }}°`),o&&(t+=`💧{{ states('${o}')}}%`),n&&(t+=`☀️{{ states('${n}')}}lx`),r={secondary:t,...r}}s.W.strategyOptions.areas[t.area_id]?.hidden||i.push(new e.AreaCard(t,r).getCard())}for(let e=0;e<i.length;e+=2)t.push({type:"horizontal-stack",cards:i.slice(e,e+2)})})),t}}},587:(t,e,i)=>{"use strict";i.r(e),i.d(e,{LightView:()=>o});var s=i(84),r=i(402),a=i(721);class o extends a.AbstractView{#u="light";#c={title:"Lights",path:"lights",icon:"mdi:lightbulb-group",subview:!1,titleCard:{iconOn:"mdi:lightbulb",iconOff:"mdi:lightbulb-off",onService:"light.turn_on",offService:"light.turn_off"}};#p={title:"All Lights",subtitle:s.W.getCountTemplate(this.domain,"eq","on")+" lights on"};constructor(t={}){super(),this.mergeOptions(this.#c,t),this.viewTitleCard=new r.TitleCard(s.W.areas,{...this.#p,...this.options.titleCard}).createCard()}get domain(){return this.#u}}},133:(t,e,i)=>{"use strict";i.r(e),i.d(e,{SwitchView:()=>o});var s=i(84),r=i(402),a=i(721);class o extends a.AbstractView{#u="switch";#c={title:"Switches",path:"switches",icon:"mdi:dip-switch",subview:!1,titleCard:{iconOn:"mdi:power-plug",iconOff:"mdi:power-plug-off",onService:"switch.turn_on",offService:"switch.turn_off"}};#p={title:"All Switches",subtitle:s.W.getCountTemplate(this.domain,"eq","on")+" switches on"};constructor(t={}){super(),this.mergeOptions(this.#c,t),this.viewTitleCard=new r.TitleCard(s.W.areas,{...this.#p,...this.options.titleCard}).createCard()}get domain(){return this.#u}}},654:(t,e,i)=>{"use strict";i.r(e)},968:(t,e,i)=>{var s={"./AbstractView":[721,179],"./AbstractView.js":[721,179],"./CameraView":[458,179],"./CameraView.js":[458,179],"./ClimateView":[310,179],"./ClimateView.js":[310,179],"./CoverView":[401,179],"./CoverView.js":[401,179],"./FanView":[902,179],"./FanView.js":[902,179],"./HomeView":[530,179],"./HomeView.js":[530,179],"./LightView":[587,179],"./LightView.js":[587,179],"./SwitchView":[133,179],"./SwitchView.js":[133,179],"./typedefs":[654,179],"./typedefs.js":[654,179]};function r(t){if(!i.o(s,t))return Promise.resolve().then((()=>{var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}));var e=s[t],r=e[0];return i.e(e[1]).then((()=>i(r)))}r.keys=()=>Object.keys(s),r.id=968,t.exports=r}},s={};function r(t){var e=s[t];if(void 0!==e)return e.exports;var a=s[t]={exports:{}};return i[t](a,a.exports,r),a.exports}e=Object.getPrototypeOf?t=>Object.getPrototypeOf(t):t=>t.__proto__,r.t=function(i,s){if(1&s&&(i=this(i)),8&s)return i;if("object"==typeof i&&i){if(4&s&&i.__esModule)return i;if(16&s&&"function"==typeof i.then)return i}var a=Object.create(null);r.r(a);var o={};t=t||[null,e({}),e([]),e(e)];for(var n=2&s&&i;"object"==typeof n&&!~t.indexOf(n);n=e(n))Object.getOwnPropertyNames(n).forEach((t=>o[t]=()=>i[t]));return o.default=()=>i,r.d(a,o),a},r.d=(t,e)=>{for(var i in e)r.o(e,i)&&!r.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},r.e=()=>Promise.resolve(),r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{"use strict";var t=r(84),e=r(408),i=r(402);customElements.define("ll-strategy-mushroom-strategy",class{static async generateDashboard(e){await t.W.initialize(e);const i=[];let s;for(let e of t.W.getExposedViewIds())try{const a=t.W.sanitizeClassName(e+"View");s=await r(968)(`./${a}`);const o=await new s[a](t.W.strategyOptions.views[e]).getView();i.push(o)}catch(i){console.error(t.W.debug?i:`View '${e}' couldn't be loaded!`)}for(let e of t.W.areas)e.hidden||i.push({title:e.name,path:e.area_id??e.name,subview:!0,strategy:{type:"custom:mushroom-strategy",options:{area:e}}});return t.W.strategyOptions.extra_views&&i.push(...t.W.strategyOptions.extra_views),{views:i}}static async generateView(s){const a=t.W.getExposedDomainIds(),o=s.view.strategy.options.area,n=[...o.extra_cards??[]];for(const s of a){if("default"===s)continue;const a=t.W.sanitizeClassName(s+"Card");let c=[];try{c=await r(175)(`./${a}`).then((r=>{let n=[];const c=t.W.getDeviceEntities(o,s);if(c.length){const d=new i.TitleCard([o],t.W.strategyOptions.domains[s]).createCard();if("sensor"===s){const i=t.W.getStateEntities(o,"sensor"),s=[];for(const r of c){const a=i.find((t=>t.entity_id===r.entity_id));let o=t.W.strategyOptions.card_options?.[r.entity_id]??{};o.hidden||(a?.attributes.unit_of_measurement&&(o={type:"custom:mini-graph-card",entities:[r.entity_id],...o}),s.push(new e.SensorCard(r,o).getCard()))}return s.length&&(n.push({type:"vertical-stack",cards:s}),n.unshift(d)),n}for(const e of c){let i=t.W.strategyOptions.card_options?.[e.entity_id]??{};i.hidden||n.push(new r[a](e,i).getCard())}if("binary_sensor"===s){const t=[];for(let e=0;e<n.length;e+=2)t.push({type:"horizontal-stack",cards:n.slice(e,e+2)});n=t}n.length&&n.unshift(d)}return n}))}catch(e){console.error(t.W.debug?e:"An error occurred while creating the domain cards!")}c.length&&n.push({type:"vertical-stack",cards:c})}const c=t.W.devices.filter((t=>t.area_id===o.area_id)).map((t=>t.id)),d=t.W.entities.filter((t=>(c.includes(t.device_id)||t.area_id===o.area_id)&&null==t.hidden_by&&null==t.disabled_by&&!a.includes(t.entity_id.split(".",1)[0])));if(d.length){let e=[];try{e=await Promise.resolve().then(r.bind(r,190)).then((e=>{const s=[new i.TitleCard([o],t.W.strategyOptions.domains.default).createCard()];for(const i of d){let r=t.W.strategyOptions.card_options?.[i.entity_id]??{};r.hidden||s.push(new e.MiscellaneousCard(i,r).getCard())}return s}))}catch(e){console.error(t.W.debug?e:"An error occurred while creating the domain cards!")}n.push({type:"vertical-stack",cards:e})}return{cards:n}}})})()})();