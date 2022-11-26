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
    },
    tableBaseURL: "http://sandy2.local",
    secure: {
      webcenterUsername: "acvigue@me.com",
      webcenterPassword: "Goober312$",
      webcenterToken: "",
    },
  }),

  getters: {
    isPlaylist(state) {
      return state.raw.playlist == "true";
    },
    queuedMoves(state) {
      return state.raw.Qd;
    },
    fileName(state) {
      return state.raw.file
        .split("-")[1]
        .replace(".thr", "")
        .replace(".THR", "");
    },
    playlistName(state) {
      return state.raw.playlistName
        .split("-")[0]
        .replace("sd/", "")
        .replace(".seq", "")
        .replace(".SEQ", "");
    },
    trackID(state) {
      return state.raw.file.split("-")[0].replace("sd/", "");
    },
    playlistID(state) {
      return state.raw.playlistName.split("-")[0].replace("sd/", "");
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
      this.raw == newStatus;

      if (newStatus.pause == 0 && newStatus.file != "") {
        this.status = "playing";
      } else if (newStatus.pause == 1 && newStatus.file != "") {
        this.status = "paused";
      } else {
        this.status = "idle";
      }
    },

    setBrightness(number) {
      console.log(`setting brightness to ${number}`);
    },

    setAutoDim(enabled) {
      console.log(`setting autodim to ${enabled}`);
    },

    setColor(red, green, blue) {
      console.log(`setting color to ${red},${green},${blue}`);
    },

    setEffect(id) {
      console.log(`setting effect to ${id}`);
    },

    setSpeed(number) {
      console.log(`setting effect speed to ${number}`);
    },

    fetchInitialStatus() {
      axios.get(this.tableBaseURL + "/status").then((resp) => {
        this.setNewStatus(resp);
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
  },
});
