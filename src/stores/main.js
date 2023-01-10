import { defineStore } from "pinia";
import axios from "axios";

export const useMainStore = defineStore("main", {
  state: () => ({
    status: "",
    raw: {
      Qd: 0,
      playlist: false,
      file: "",
      rpm: 0,
      playlistName: "",
      autoDim: 0,
      redVal: 0,
      greenVal: 0,
      blueVal: 0,
      ledBrightness: 0,
      ledOn: 0,
      effectID: 0,
      effectSpeed: 0,
      espV: "",
    },
    tableBaseURL: "https://sandy2.vigue.me",
    secure: {
      webcenterUsername: "acvigue@me.com",
      webcenterPassword: "Goober312$",
      webcenterToken: "",
    },
    effectArray: [
      "Static",
      "Blink",
      "Breath",
      "Color Wipe",
      "Color Wipe Inverse",
      "Color Wipe Reverse",
      "Color Wipe Reverse Inverse",
      "Color Wipe Random",
      "Random Color",
      "Single Dynamic",
      "Multi Dynamic",
      "Rainbow",
      "Rainbow Cycle",
      "Scan",
      "Dual Scan",
      "Fade",
      "Theater Chase",
      "Theater Chase Rainbow",
      "Running Lights",
      "Twinkle",
      "Twinkle Random",
      "Twinkle Fade",
      "Twinkle Fade Random",
      "Sparkle",
      "Flash Sparkle",
      "Hyper Sparkle",
      "Strobe",
      "Strobe Rainbow",
      "Multi Strobe",
      "Blink Rainbow",
      "Chase White",
      "Chase Color",
      "Chase Random",
      "Chase Rainbow",
      "Chase Flash",
      "Chase Flash Random",
      "Chase Rainbow White",
      "Chase Blackout",
      "Chase Blackout Rainbow",
      "Color Sweep Random",
      "Running Color",
      "Running Red Blue",
      "Running Random",
      "Larson Scanner",
      "Comet",
      "Fireworks",
      "Fireworks Random",
      "Merry Christmas",
      "Fire Flicker",
      "Fire Flicker (soft)",
      "Fire Flicker (intense)",
      "Circus Combustus",
      "Halloween",
      "Bicolor Chase",
      "Tricolor Chase",
      "TwinkleFOX",
      "Custom",
    ],
    _lastRecievedRaw: {
      Qd: 0,
      playlist: false,
      file: "",
      rpm: 0,
      playlistName: "",
      autoDim: 0,
      redVal: 0,
      greenVal: 0,
      blueVal: 0,
      ledBrightness: 0,
      ledOn: 0,
      effectID: 0,
      effectSpeed: 0,
      espV: "",
    },
  }),

  getters: {
    isPlaylist(state) {
      return state.raw.playlist == true;
    },
    queuedMoves(state) {
      return state.raw.Qd;
    },
    trackID(state) {
      return state.raw.file.replace("sd/", "").replace(".thr", "");
    },
    playlistID(state) {
      return state.raw.playlistName.replace("sd/", "").replace(".seq", "");
    },
  },

  actions: {
    pause() {
      axios.get(`${this.tableBaseURL}/exec/pause`);
    },
    resume() {
      axios.get(`${this.tableBaseURL}/exec/resume`);
    },
    play(file) {
      axios.get(`${this.tableBaseURL}/playFile/${file}`);
    },
    stop() {
      axios.get(`${this.tableBaseURL}/exec/stop`);
    },
    reset() {
      axios.get(`${this.tableBaseURL}/reset`);
    },
    exec(cmd) {
      axios.get(`${this.tableBaseURL}/exec/${cmd}`);
    },
    delete(file) {
      axios.get(`${this.tableBaseURL}/deleteFile/${file}`);
    },
    setNewStatus(newStatus) {
      this.raw.Qd = newStatus.Qd;
      this.raw.autoDim = newStatus.autoDim;
      this.raw.blueVal = newStatus.blueVal;
      this.raw.redVal = newStatus.redVal;
      this.raw.effectID = newStatus.effectID;
      this.raw.effectSpeed = newStatus.effectSpeed;
      this.raw.espV = newStatus.espV;
      this.raw.file = newStatus.file ?? "";
      this.raw.greenVal = newStatus.greenVal;
      this.raw.ledBrightness = newStatus.ledBrightness;
      this.raw.ledOn = newStatus.ledOn;
      this.raw.playlist = newStatus.playlist ?? false;
      this.raw.playlistName = newStatus.playlistName ?? "";
      this.raw.rpm = newStatus.rpm ?? 0;

      if (newStatus.pause == 0 && newStatus.file != "" && newStatus.Qd != 0) {
        this.status = "playing";
      } else if (newStatus.pause == 1 && newStatus.file != "") {
        this.status = "paused";
      } else {
        this.status = "idle";
      }
    },

    async setBrightness(number) {
      if (this.raw.ledBrightness != number) {
        console.log(`setting brightness to ${number}`);
        this.raw.ledBrightness = number;
        await this._updateLedConfig();
      }
    },

    async setLedOn(enabled) {
      let int = enabled == true ? 1 : 0;
      if (this.raw.ledOn != int) {
        console.log(`setting ledon to ${int}`);
        this.raw.ledOn = int;
        await this._updateLedConfig();
      }
    },

    async setAutoDim(enabled) {
      if (this.raw.autoDim != enabled) {
        console.log(`setting autodim to ${enabled}`);
        this.raw.autoDim = enabled;
        await this._updateLedConfig();
      }
    },

    async setColor(red, green, blue) {
      if (
        this.raw.redVal != red ||
        this.raw.greenVal != green ||
        this.raw.blueVal != blue
      ) {
        console.log(`setting color to ${red},${green},${blue}`);
        this.raw.redVal = red;
        this.raw.greenVal = green;
        this.raw.blueVal = blue;
        await this._updateLedConfig();
      }
    },

    async setEffect(id) {
      if (this.raw.effectID != id) {
        console.log(`setting effect to ${id}`);
        this.raw.effectID = id;
        await this._updateLedConfig();
      }
    },

    async setSpeed(number) {
      if (this.raw.effectSpeed != number) {
        console.log(`setting effect speed to ${number}`);
        this.raw.effectSpeed = number;
        await this._updateLedConfig();
      }
    },

    fetchInitialStatus() {
      axios.get(this.tableBaseURL + "/status").then((resp) => {
        this.setNewStatus(resp.data);
      });
    },

    async loginToWebCenter() {
      const request = await axios.post(
        "https://webcenter.sisyphus-industries.com/auth_user",
        {
          email: this.secure.webcenterUsername,
          password: this.secure.webcenterPassword,
        }
      );

      this.secure.webcenterToken = request.data.resp[0].auth_token;

      return true;
    },

    async _updateLedConfig() {
      const config = {
        ledOn: this.raw.ledOn,
        ledBrightness: this.raw.ledBrightness,
        redVal: this.raw.redVal,
        greenVal: this.raw.greenVal,
        blueVal: this.raw.blueVal,
        effectID: this.raw.effectID,
        effectSpeed: this.raw.effectSpeed,
        autoDim: this.raw.autoDim,
      };

      await axios.post(`${this.tableBaseURL}/setled`, JSON.stringify(config), {
        headers: {
          "Content-Type": "text/plain",
        },
      });
    },
  },
});
