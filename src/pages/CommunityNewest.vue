<template>
  <div class="home">
    <q-header elevated class="header bg-black text-white shadow-0">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="q-mr-sm"
          @click="$router.go(-1)"
        />
        <q-toolbar-title class="text-center">Newest Tracks</q-toolbar-title>
        <q-btn flat round dense class="q-mr-sm" />
      </q-toolbar>
    </q-header>

    <q-infinite-scroll @load="loadMoreTracks" :offset="250">
      <q-list bordered separator>
        <q-item v-for="pattern in patterns" :key="pattern.id">
          <q-inner-loading :showing="pattern.is_downloading">
            <q-spinner size="50px" color="black" />
          </q-inner-loading>
          <q-item-section avatar>
            <img
              style="height: 75px;"
              :src="
                'https://webcenter.sisyphus-industries.com' +
                pattern.large_photo
              "
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="home__item-title">{{
              pattern.name
            }}</q-item-label>
            <q-item-label class="home__item-title text-grey-7"
              >by {{ pattern.created_by_name }}</q-item-label
            >
            <q-item-label class="home__item-title text-grey-7"
              >{{ pattern.download_count }} downloads</q-item-label
            >
          </q-item-section>
          <q-item-section avatar>
            <q-btn
              @click="downloadPattern(pattern)"
              v-if="!pattern.is_downloaded && !pattern.is_downloading"
              round
              flat
              color="white"
              text-color="black"
              size="md"
              icon="get_app"
            />
            <q-btn
              v-if="pattern.is_downloaded"
              round
              flat
              color="white"
              text-color="black"
              size="md"
              icon="check"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-infinite-scroll>
  </div>
</template>

<style lang="scss">
.community {
  &__listitem {
    font-size: 23px;
  }
  &__carousel {
    margin-top: 1vh;
    margin-left: 1vw;
    margin-bottom: 2vh;
    margin-right: 1vw;
  }
}
</style>

<script>
import { useMainStore } from "src/stores/main";

export default {
  name: "CommunityHome",
  components: {},
  data: function () {
    return {
      patterns: [],
      allPatterns: [],
      existingPatterns: [],
    };
  },
  methods: {
    downloadPattern: async function (pattern) {
      pattern.is_downloading = true;

      //Get pattern data from Webcenter
      const ptData = (
        await this.$axios.get(
          "https://webcenter.sisyphus-industries.com/tracks/" +
            pattern.track_id +
            "/download.json",
          { headers: { Authorization: this.store.secure.webcenterToken } }
        )
      ).data.resp;
      var formData = new FormData();
      var blob = new Blob([ptData], { type: "text/plain" });
      formData.append(
        "file",
        blob,
        pattern.track_id + "-" + pattern.name + ".thr"
      );
      await this.$axios.post(
        this.store.tableBaseURL + "/uploadtofileman",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      pattern.is_downloading = false;
      pattern.is_downloaded = true;
    },
    loadMoreTracks: function (index, done) {
      let i = 0;
      this.allPatterns.forEach((pattern) => {
        i++;
        if (i < 10) {
          this.allPatterns.shift();
          this.patterns.push(pattern);
        }
      });
      done();
    },
    openPlaylist: function (pname) {
      this.$router.push("/community/playlist/" + pname);
    },
    refreshFiles: async function (done) {
      if (this.store.secure.webcenterToken == "") {
        //Log in to Webcenter
        await this.store.loginToWebCenter();
      }

      //Get all files on bot
      await this.$axios
        .get(this.store.tableBaseURL + "/filelist")
        .then((response) => {
          response.data.files.forEach((file) => {
            if (file.name.includes(".THR") || file.name.includes(".thr")) {
              //thr
              this.existingPatterns.push(file.name.split("-")[0]);
            }
          });
        });

      //Get popular tracks
      await this.$axios
        .get(
          "https://webcenter.sisyphus-industries.com/tracks.json?sort=newest_designs",
          { headers: { Authorization: this.store.secure.webcenterToken } }
        )
        .then((response) => {
          const tracks = response.data.resp;
          tracks.forEach((track) => {
            track.is_downloading = false;
            track.is_downloaded = false;
            if (this.existingPatterns.includes(track.track_id)) {
              track.is_downloaded = true;
            }
            this.allPatterns.push(track);
          });
        });

      //load first ten patterns into list
      let i = 0;
      this.allPatterns.forEach((pattern) => {
        i++;
        if (i < 10) {
          this.allPatterns.shift();
          this.patterns.push(pattern);
        }
      });
      done();
    },
  },
  mounted: function () {
    this.refreshFiles();
  },
  setup() {
    const store = useMainStore();

    return {
      store,
    };
  },
};
</script>
