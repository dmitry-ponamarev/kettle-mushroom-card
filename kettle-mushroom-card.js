/*
 * Kettle Mushroom Card — минималистичная карточка чайника в стиле Mushroom
 * для Home Assistant (тестировалась на Polaris PWK-1775CGLD).
 *
 * Отображает текущую температуру, объём воды, состояние;
 * кнопки: кипячение, меню пресетов чая, меню настроек (звук, подсветка, блокировка).
 * Иконка: по умолчанию из сущности; можно задать одну (icon) или по состояниям
 * (icon_off / icon_heating / icon_unavailable либо словарь icons).
 */

const CARD_VERSION = "1.2.0";

const DEFAULT_PRESETS = {
  black_tea:      { name: "Чёрный чай",       temp: 100 },
  red_tea:        { name: "Красный чай",      temp: 95  },
  puerh_tea:      { name: "Пуэр",             temp: 95  },
  oolong_tea:     { name: "Улун",             temp: 90  },
  flower_tea:     { name: "Цветочный чай",    temp: 85  },
  herbal_tea:     { name: "Травяной чай",     temp: 90  },
  green_tea:      { name: "Зелёный чай",      temp: 80  },
  white_tea:      { name: "Белый чай",        temp: 75  },
  tea_bag:        { name: "Чай в пакетиках",  temp: 90  },
  instant_coffee: { name: "Растворимый кофе", temp: 85  },
  baby_bottle:    { name: "Детская смесь",    temp: 40  },
};

const ICONS = {
  kettle:
    "M12.5,3C7.81,3 4,5.69 4,9V9C4,10.19 4.5,11.34 5.44,12.33C4.53,13.5 4,14.96 4,16.5C4,20.09 7.81,21 12.5,21C17.19,21 21,20.09 21,16.5C21,14.96 20.47,13.5 19.56,12.33C20.5,11.34 21,10.19 21,9V9C21,5.69 17.19,3 12.5,3M12.5,12C14.43,12 16.66,11.47 18,10.24C17.76,10.74 17.4,11.2 16.9,11.6C15.8,12.5 14.06,13 12.5,13C10.94,13 9.2,12.5 8.1,11.6C7.6,11.2 7.24,10.74 7,10.24C8.34,11.47 10.57,12 12.5,12Z",
  water:
    "M12,3.25C12,3.25 6,10 6,14C6,17.32 8.69,20 12,20A6,6 0 0,0 18,14C18,10 12,3.25 12,3.25Z",
  boil:
    "M13,0H11V3H13V0M12,5A8,8 0 0,0 4,13H20A8,8 0 0,0 12,5M3,15V17H21V15H3M5,19V21H19V19H5Z",
  tea:
    "M20,3H4V10A6,6 0 0,0 10,16H14A6,6 0 0,0 20,10H22V5H20V3M20,8V5H22V8H20M4,19H20V21H4V19Z",
  dots:
    "M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z",
  sound:
    "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M3,9V15H7L12,20V4L7,9H3Z",
  light:
    "M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z",
  lock:
    "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",
  wifi:
    "M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z",
};

function svg(path, color) {
  return `<svg viewBox="0 0 24 24" fill="${color}"><path d="${path}"/></svg>`;
}

class KettleMushroomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._openMenu = null; // 'presets' | 'settings' | null
    this._ptrDown = false;
    this._needRender = false;
    this._lastSig = null;
    this._onDocClick = (ev) => {
      // клик вне карточки закрывает открытое меню.
      // ВАЖНО: composedPath для кликов внутри shadow DOM содержит хост-карточку,
      // поэтому меню не закрывается и DOM не пересоздаётся до обработчиков кнопок.
      if (this._openMenu && !ev.composedPath().includes(this)) {
        this._openMenu = null;
        this._render();
      }
    };
    // не перерисовывать карточку между pointerdown и pointerup,
    // иначе re-render обрывает клик (температура обновляется часто)
    this._onPtrDown = () => { this._ptrDown = true; };
    this._onPtrUp = () => {
      this._ptrDown = false;
      if (this._needRender) {
        this._needRender = false;
        this._render(true);
      }
    };
  }

  connectedCallback() {
    document.addEventListener("click", this._onDocClick, true);
    this.addEventListener("pointerdown", this._onPtrDown, true);
    window.addEventListener("pointerup", this._onPtrUp);
    window.addEventListener("pointercancel", this._onPtrUp);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick, true);
    this.removeEventListener("pointerdown", this._onPtrDown, true);
    window.removeEventListener("pointerup", this._onPtrUp);
    window.removeEventListener("pointercancel", this._onPtrUp);
  }

  static getStubConfig() {
    return { entity: "water_heater.kettle" };
  }

  static getConfigForm() {
    const entitySel = (domain) => ({
      entity: { filter: { domain } },
    });
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: entitySel("water_heater"),
        },
        { name: "name", selector: { text: {} } },
        {
          name: "volume_max",
          selector: {
            number: {
              min: 0.3,
              max: 5,
              step: 0.1,
              mode: "box",
              unit_of_measurement: "л",
            },
          },
        },
        { name: "icon", selector: { icon: {} } },
        {
          name: "icons_by_state",
          type: "expandable",
          title: "Иконки по состояниям",
          schema: [
            { name: "icon_off", selector: { icon: {} } },
            { name: "icon_heating", selector: { icon: {} } },
            { name: "icon_unavailable", selector: { icon: {} } },
          ],
        },
        {
          name: "entities",
          type: "expandable",
          title: "Сущности (переопределение)",
          schema: [
            { name: "temperature_entity", selector: entitySel("sensor") },
            { name: "volume_entity", selector: entitySel("sensor") },
            { name: "power_entity", selector: entitySel("switch") },
            { name: "preset_entity", selector: entitySel("select") },
            { name: "base_entity", selector: entitySel("binary_sensor") },
            { name: "sound_entity", selector: entitySel("switch") },
            { name: "backlight_entity", selector: entitySel("switch") },
            { name: "lock_entity", selector: entitySel("switch") },
          ],
        },
      ],
      computeLabel: (schema) =>
        ({
          entity: "Чайник (water_heater)",
          name: "Название",
          volume_max: "Максимальный объём",
          icon: "Иконка (одна для всех состояний)",
          icon_off: "Иконка: выключен",
          icon_heating: "Иконка: нагрев",
          icon_unavailable: "Иконка: недоступен",
          temperature_entity: "Датчик температуры",
          volume_entity: "Датчик объёма воды",
          power_entity: "Переключатель кипячения",
          preset_entity: "Пресеты (select)",
          base_entity: "Датчик базы",
          sound_entity: "Звук",
          backlight_entity: "Подсветка",
          lock_entity: "Защита от детей",
        }[schema.name] || schema.name),
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Укажите entity (water_heater.*)");
    this._config = config;
    const prefix = config.entity.split(".")[1];
    this._e = {
      heater: config.entity,
      temperature: config.temperature_entity || `sensor.${prefix}_temperature`,
      volume: config.volume_entity || `sensor.${prefix}_weight`,
      power: config.power_entity || `switch.${prefix}_power`,
      preset: config.preset_entity || `select.${prefix}_preset`,
      base: config.base_entity || `binary_sensor.${prefix}_base`,
      sound: config.sound_entity || `switch.${prefix}_sound`,
      backlight: config.backlight_entity || null,
      lock: config.lock_entity || `switch.${prefix}_child_lock`,
    };
    this._lastSig = null;
    this._render(true);
  }

  set hass(hass) {
    this._hass = hass;
    // ленивый автопоиск сущностей, которые не удалось вывести из префикса
    // (например switch.kettle_pwk_1775cgld_backlight)
    if (!this._e.backlight) {
      this._e.backlight = this._discover("switch", "backlight");
    }
    this._render();
  }

  _discover(domain, suffix) {
    const prefix = this._config.entity.split(".")[1];
    const head = `${domain}.${prefix}_`;
    const found = Object.keys(this._hass.states).find(
      (id) => id.startsWith(head) && id.endsWith(suffix)
    );
    return found || null;
  }

  getCardSize() {
    return 3;
  }

  _state(id) {
    return id && this._hass ? this._hass.states[id] : undefined;
  }

  _call(domain, service, data) {
    if (this._hass) this._hass.callService(domain, service, data);
  }

  _fmtTemp(v) {
    const n = parseFloat(v);
    return isNaN(n) ? "—" : String(Math.round(n));
  }

  // Приоритет: icons[state] -> icons.default -> icon -> icon_* -> иконка сущности -> default
  _resolveIcon(stateKey, heater) {
    const cfg = this._config;
    if (cfg.icons && cfg.icons[stateKey]) return cfg.icons[stateKey];
    if (cfg["icon_" + stateKey]) return cfg["icon_" + stateKey];
    if (cfg.icons && cfg.icons.default) return cfg.icons.default;
    if (cfg.icon) return cfg.icon;
    if (heater && heater.attributes.icon) return heater.attributes.icon;
    return "mdi:kettle";
  }

  _render(force) {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    if (this._ptrDown && !force) {
      // палец/кнопка нажаты — отложим перерисовку, чтобы не оборвать клик
      this._needRender = true;
      return;
    }
    const cfg = this._config;
    const e = this._e;

    const heater = this._state(e.heater);
    const tempSt = this._state(e.temperature);
    const volSt = this._state(e.volume);
    const powerSt = this._state(e.power);
    const presetSt = this._state(e.preset);
    const baseSt = this._state(e.base);

    const curTemp =
      tempSt && !isNaN(parseFloat(tempSt.state))
        ? tempSt.state
        : heater && heater.attributes.current_temperature != null
        ? String(heater.attributes.current_temperature)
        : null;

    const targetTemp = heater ? heater.attributes.temperature : null;
    const heating =
      (powerSt && powerSt.state === "on") ||
      (heater && heater.state !== "off" && heater.state !== "unavailable");

    const volume = volSt ? parseFloat(volSt.state) : NaN;
    const volMax = cfg.volume_max || 1.7;
    const volPct = isNaN(volume) ? 0 : Math.min(100, Math.round((volume / volMax) * 100));

    const name = cfg.name || (heater && heater.attributes.friendly_name) || "Чайник";

    // binary_sensor.kettle_base: on = чайник СНЯТ с базы, off = на базе
    const offBase = baseSt ? baseSt.state === "on" : false;

    let stateText;
    if (!heater || heater.state === "unavailable") {
      stateText = "Недоступен";
    } else if (offBase) {
      stateText = "Снят с базы";
    } else if (heating) {
      stateText = targetTemp ? `Нагрев до ${Math.round(targetTemp)}°C` : "Нагрев";
    } else {
      stateText = "Выключен";
    }

    const unavailable = !heater || heater.state === "unavailable";
    const stateKey = unavailable ? "unavailable" : heating ? "heating" : "off";
    const icon = this._resolveIcon(stateKey, heater);

    // не перерисовываем, если ничего значимого не изменилось —
    // защита кликов от частых обновлений температуры
    const sig = [
      name, stateText, this._fmtTemp(curTemp), volPct,
      isNaN(volume) ? "" : volume.toFixed(2),
      heating, unavailable, offBase, icon, this._openMenu,
      this._state(e.sound)?.state, this._state(e.backlight)?.state, this._state(e.lock)?.state,
      presetSt && presetSt.state,
    ].join("|");
    if (!force && sig === this._lastSig) return;
    this._lastSig = sig;

    const iconColor = heating ? "#ff5722" : "var(--secondary-text-color)";
    const iconBg = heating
      ? "rgba(255,87,34,.18)"
      : "color-mix(in srgb, var(--secondary-text-color) 15%, transparent)";

    // --- меню пресетов ---
    let presetRows = "";
    const presetMap = Object.assign({}, DEFAULT_PRESETS, cfg.presets || {});
    if (presetSt && presetSt.attributes.options) {
      presetRows = presetSt.attributes.options
        .filter((o) => o !== "not_selected")
        .map((o) => {
          const meta = presetMap[o] || { name: o };
          const sel = presetSt.state === o ? " sel" : "";
          const t = meta.temp ? `<span class="mi-temp">${meta.temp}°</span>` : "";
          return `<div class="menu-item${sel}" data-preset="${o}">
                    <span class="mi-name">${meta.name}</span>${t}
                  </div>`;
        })
        .join("");
    }

    // --- меню настроек ---
    const toggleRow = (id, icon, label) => {
      const st = this._state(id);
      if (!st) return "";
      const on = st.state === "on";
      return `<div class="menu-item toggle" data-toggle="${id}">
                <span class="mi-icon">${svg(icon, on ? "#03a9f4" : "var(--secondary-text-color)")}</span>
                <span class="mi-name">${label}</span>
                <span class="switch${on ? " on" : ""}"><span class="knob"></span></span>
              </div>`;
    };
    const settingsRows =
      toggleRow(e.sound, ICONS.sound, "Звук") +
      toggleRow(e.backlight, ICONS.light, "Подсветка") +
      toggleRow(e.lock, ICONS.lock, "Защита от детей");

    const presetsOpen = this._openMenu === "presets";
    const settingsOpen = this._openMenu === "settings";

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          border-radius: 12px;
          padding: 14px 16px;
          position: relative;
          overflow: visible;
        }
        .top { display: flex; align-items: center; gap: 12px; }
        .shape {
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background .3s;
          background: ${iconBg};
        }
        .shape ha-icon {
          --mdc-icon-size: 24px;
          color: ${iconColor};
          transition: color .3s;
        }
        .names { display: flex; flex-direction: column; min-width: 0; }
        .primary {
          font-size: 14px; font-weight: 500; color: var(--primary-text-color);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .secondary { font-size: 12px; color: var(--secondary-text-color); }
        .temp {
          margin-left: auto; font-size: 30px; font-weight: 600;
          color: var(--primary-text-color); line-height: 1; flex-shrink: 0;
        }
        .temp small { font-size: 14px; font-weight: 400; color: var(--secondary-text-color); }
        .vol-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
        .vol-row > svg { width: 16px; height: 16px; flex-shrink: 0; }
        .bar {
          flex: 1; height: 6px; border-radius: 3px;
          background: color-mix(in srgb, var(--secondary-text-color) 15%, transparent);
          overflow: hidden;
        }
        .bar > div { height: 100%; border-radius: 3px; background: #03a9f4; transition: width .5s; }
        .vol-row .v {
          font-size: 12px; font-weight: 500; color: var(--primary-text-color);
          min-width: 48px; text-align: right;
        }
        .btns { display: flex; gap: 8px; margin-top: 12px; }
        .abtn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          height: 38px; border-radius: 10px; cursor: pointer; user-select: none;
          border: 1px solid var(--divider-color, rgba(128,128,128,.3));
          font-size: 12.5px; font-weight: 500; color: var(--primary-text-color);
          transition: background .2s;
        }
        .abtn svg { width: 17px; height: 17px; }
        .abtn:active { filter: brightness(.92); }
        .abtn.main {
          background: ${heating ? "rgba(255,87,34,.18)" : "transparent"};
          border-color: ${heating ? "transparent" : "var(--divider-color, rgba(128,128,128,.3))"};
          color: ${heating ? "#ff7043" : "var(--primary-text-color)"};
        }
        .abtn.open { background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent); }
        .abtn.disabled {
          opacity: .4;
          pointer-events: none;
          cursor: default;
        }
        .menu {
          position: absolute; left: 8px; right: 8px; bottom: -8px;
          transform: translateY(100%);
          background: var(--card-background-color);
          border: 1px solid var(--divider-color, rgba(128,128,128,.25));
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
          padding: 6px; z-index: 10;
          max-height: 300px; overflow-y: auto;
        }
        .menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px; cursor: pointer;
        }
        .menu-item:hover { background: color-mix(in srgb, var(--secondary-text-color) 10%, transparent); }
        .menu-item.sel { background: rgba(121,85,72,.18); }
        .menu-item.sel .mi-name, .menu-item.sel .mi-temp { color: #a1887f; font-weight: 600; }
        .mi-icon { display: flex; }
        .mi-icon svg { width: 20px; height: 20px; }
        .mi-name { flex: 1; font-size: 13.5px; color: var(--primary-text-color); }
        .mi-temp { font-size: 12.5px; color: var(--secondary-text-color); }
        .switch {
          width: 36px; height: 20px; border-radius: 10px;
          background: color-mix(in srgb, var(--secondary-text-color) 30%, transparent);
          position: relative; transition: background .2s; flex-shrink: 0;
        }
        .switch.on { background: #03a9f4; }
        .knob {
          position: absolute; top: 2px; left: 2px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; transition: left .2s;
        }
        .switch.on .knob { left: 18px; }
        .unavail { opacity: .55; }
      </style>
      <ha-card class="${heater && heater.state === "unavailable" ? "unavail" : ""}">
        <div class="top">
          <div class="shape"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="names">
            <span class="primary">${name}</span>
            <span class="secondary">${stateText}</span>
          </div>
          <div class="temp">${curTemp != null ? this._fmtTemp(curTemp) : "—"}<small> °C</small></div>
        </div>

        ${offBase ? "" : `
        <div class="vol-row">
          ${svg(ICONS.water, "#03a9f4")}
          <div class="bar"><div style="width:${volPct}%"></div></div>
          <span class="v">${isNaN(volume) ? "—" : volume.toFixed(2) + " л"}</span>
        </div>
        `}

        <div class="btns">
          <div class="abtn main${offBase ? " disabled" : ""}" id="boil">
            ${svg(ICONS.boil, heating ? "#ff7043" : "var(--primary-text-color)")}
            ${heating ? "Остановить" : "Кипятить"}
          </div>
          <div class="abtn${presetsOpen ? " open" : ""}${offBase ? " disabled" : ""}" id="presets">
            ${svg(ICONS.tea, "var(--primary-text-color)")}Пресеты
          </div>
          <div class="abtn${settingsOpen ? " open" : ""}${offBase ? " disabled" : ""}" id="settings" style="flex:0 0 46px;">
            ${svg(ICONS.dots, "var(--primary-text-color)")}
          </div>
        </div>

        ${presetsOpen ? `<div class="menu" id="menu-presets">${presetRows || '<div class="menu-item"><span class="mi-name">Нет пресетов</span></div>'}</div>` : ""}
        ${settingsOpen ? `<div class="menu" id="menu-settings">${settingsRows || '<div class="menu-item"><span class="mi-name">Нет настроек</span></div>'}</div>` : ""}
      </ha-card>
    `;

    // --- обработчики ---
    const $ = (sel) => this.shadowRoot.querySelector(sel);

    $("#boil").addEventListener("click", () => {
      if (offBase) return;
      const st = this._state(e.power);
      if (st) {
        this._call("switch", "toggle", { entity_id: e.power });
      } else if (heater) {
        this._call("water_heater", heating ? "set_operation_mode" : "set_temperature", {
          entity_id: e.heater,
          ...(heating ? { operation_mode: "off" } : { temperature: 100 }),
        });
      }
    });

    $("#presets").addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._openMenu = presetsOpen ? null : "presets";
      this._render();
    });

    $("#settings").addEventListener("click", (ev) => {
      ev.stopPropagation();
      this._openMenu = settingsOpen ? null : "settings";
      this._render();
    });

    this.shadowRoot.querySelectorAll("[data-preset]").forEach((el) => {
      el.addEventListener("click", () => {
        this._call("select", "select_option", {
          entity_id: e.preset,
          option: el.dataset.preset,
        });
        this._openMenu = null;
        this._render();
      });
    });

    this.shadowRoot.querySelectorAll("[data-toggle]").forEach((el) => {
      el.addEventListener("click", () => {
        this._call("switch", "toggle", { entity_id: el.dataset.toggle });
        // меню остаётся открытым — состояние обновится по событию hass
      });
    });
  }
}

customElements.define("kettle-mushroom-card", KettleMushroomCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "kettle-mushroom-card",
  name: "Kettle Mushroom Card",
  description: "Минималистичная карточка чайника: температура, объём воды, кипячение, пресеты и настройки.",
  preview: false,
});

console.info(
  `%cKETTLE-MUSHROOM-CARD%c v${CARD_VERSION}`,
  "color:#ff7043;font-weight:bold",
  "color:inherit"
);
