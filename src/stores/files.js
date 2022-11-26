import { defineStore } from "pinia";
import axios from "axios";
import { useMainStore } from "./main";
import { toRaw } from "vue";

export const useFilesStore = defineStore("files", {
  state: () => ({
    tracks: [{
			"id": "3ace37f6-7b9c-4328-860e-04c97e93afdd",
			"track_id": "229",
			"type": "track",
			"name": "snowflake",
			"original_file_type": "thr",
			"created_by_name": "ddkengr",
			"sm_thumb": "/uploads/track/thr/229/thumb_50.png",
			"thumb": "/uploads/track/thr/229/thumb_100.png",
			"large_photo": "/uploads/track/thr/229/thumb_400.png",
			"download_count": 4949,
			"created_at": "2019-09-25T13:12:58.826Z",
			"date_created": "2019-09-25",
			"is_public": "true",
			"is_locked": "",
			"two_ball": "true",
			"reversible": "true",
			"popularity": 2621.7118063427,
			"default_vel": 1,
			"user_id": "344852ca-f4b4-47f5-b4f3-08f1b1a54ece",
			"r_type": "r00",
			"firstR": 0,
			"lastR": 0,
			"is_approved": true
		}],
    playlists: [{
			"id": "a37b6c30-644c-4a18-9b8d-3739f082f260",
			"playlist_id": "37",
			"type": "playlist",
			"name": "November 2022 Staff Picks",
			"description": "November  2022 Community Track Submissions Our Staff Loves",
			"db_tracks": [

			],
			"created_by_name": "Sam",
			"created_at": "2022-11-21T20:34:50.961Z",
			"date_created": "2022-11-21",
			"is_public": "true",
			"is_featured": "true",
			"bg_color": "#9e4029",
			"featured_track": 0,
			"sort_order": 1,
			"user_id": "d71ccdba-890c-43dd-abe4-374a3187beb5"
    }]
  }),

  actions: {
    async refreshFiles() {
      const main = useMainStore();

      await axios.get(`${main.tableBaseURL}/files/sd/manifest.json`).then((response) => {
        this.tracks = response.data.tracks;
        this.playlists = response.data.playlists;
      });

      return this
    },
    async addTrack(track) {
      const main = useMainStore();

      const ptData = (
        await axios.post(
          "https://webcenter.sisyphus-industries.com/tracks/" +
            track.track_id +
            "/download",
          "pi_id=00000000dad7f8cc&mac_address=",
          { headers: { Authorization: main.secure.webcenterToken } }
        )
      ).data;

      var formData = new FormData();
      var blob = new Blob([ptData], { type: "text/plain" });
      formData.append("file", blob, `${track.id}.thr`);
      await axios.post(`${main.tableBaseURL}/uploadtofileman`, formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      this.tracks.push(track);
      try {
        await this.saveManifest();
        return true;
      } catch(e) {
        console.error(e);
        await axios.get(`${main.tableBaseURL}/deleteFile/sd/${track.id}.thr`);
      }
    },
    async saveManifest() {
      const main = useMainStore();

      await axios.get(`${main.tableBaseURL}/deleteFile/sd/manifest.json`);
      
      const manifest = {
        tracks: toRaw(this.tracks),
        playlists: toRaw(this.playlists)
      }

      let content = JSON.stringify(manifest)

      var formData = new FormData();
      var blob = new Blob([content], { type: "text/plain" });
      formData.append("file", blob, `manifest.json`);
      await axios.post(`${main.tableBaseURL}/uploadtofileman`, formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return true;
    }
  },
});
