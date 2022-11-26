<template>
  <div class="home">
    <q-header
      elevated
      class="header bg-black text-white shadow-0 row justify-center"
    >
      <q-toolbar>
        <q-btn flat round icon="" />
        <q-toolbar-title class="text-center">Library</q-toolbar-title>
        <q-btn flat round icon="add" class="q-mr-sm" @click="newPlaylist" />
      </q-toolbar>
    </q-header>

    <q-pull-to-refresh color="white" bg-color="black" @refresh="refreshFiles">
      <q-list v-if="loaded" bordered separator>
        <q-item
          clickable
          v-ripple
          v-for="playlist in playlists"
          :key="playlist.name"
          @click="openPlaylist(playlist.name)"
        >
          <q-item-section
            avatar
            class="col"
            v-if="playlist.name == 'All Tracks.seq'"
          >
            <div class="row" style="padding-bottom: 5px">
              <img
                height="60px"
                style="padding-right: 5px; border-radius: 30px"
                :src="
                  'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                  patterns[0].name.split('-')[0] +
                  '/thumb_400.png'
                "
              />
              <img
                height="60px"
                style="border-radius: 30px"
                :src="
                  'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                  patterns[1].name.split('-')[0] +
                  '/thumb_400.png'
                "
              />
            </div>
            <div class="row">
              <img
                height="60px"
                style="padding-right: 5px; border-radius: 30px"
                :src="
                  'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                  patterns[2].name.split('-')[0] +
                  '/thumb_400.png'
                "
              />
              <img
                height="60px"
                style="border-radius: 30px"
                :src="
                  'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                  patterns[3].name.split('-')[0] +
                  '/thumb_400.png'
                "
              />
            </div>
          </q-item-section>
          <q-item-section
            avatar
            class="col"
            v-if="playlist.name != 'All Tracks.seq'"
          >
            <div class="row" style="padding-bottom: 5px">
              <img
                height="60px"
                style="padding-right: 5px; border-radius: 30px"
                :src="playlist.preview[0]"
              />
              <img
                height="60px"
                style="border-radius: 30px"
                :src="playlist.preview[1]"
              />
            </div>
            <div class="row">
              <img
                height="60px"
                style="padding-right: 5px; border-radius: 30px"
                :src="playlist.preview[2]"
              />
              <img
                height="60px"
                style="border-radius: 30px"
                :src="playlist.preview[3]"
              />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label
              class="home__item-title"
              v-if="playlist.name == 'All Tracks.seq'"
              overline
              >{{ playlist.name.replace(".seq", "") }}</q-item-label
            >
            <q-item-label
              class="home__item-title"
              v-if="playlist.name != 'All Tracks.seq'"
              overline
              >{{
                playlist.name.split("-")[1].replace(".seq", "")
              }}</q-item-label
            >
            <q-item-label
              class="home__item-subtitle"
              v-if="playlist.name != 'All Tracks.seq'"
              >{{ playlist.itemCount }} tracks</q-item-label
            >
            <q-item-label
              class="home__item-subtitle"
              v-if="playlist.name == 'All Tracks.seq'"
              >{{ patterns.length }} tracks</q-item-label
            >
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              style="font-size: 40px"
              color="black"
              name="navigate_next"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-pull-to-refresh>
  </div>
</template>

<style lang="scss">
.header {
  padding-top: 4pt;
  padding-bottom: 4pt;
}

.home__item {
  padding-top: 3pt !important;
  padding-bottom: 3pt !important;

  &-title {
    font-size: 14pt !important;
    letter-spacing: 0.5pt !important;
  }
  &-subtitle {
    font-size: 12pt;
  }
}
</style>

<script>
import { useQuasar } from "quasar";
import { useMainStore } from "src/stores/main";

export default {
  name: "LibraryPage",
  components: {},
  data: function () {
    return {
      patterns: [],
      playlists: [],
      loaded: false,
    };
  },
  methods: {
    openPlaylist: function (pname) {
      this.$router.push("/library/playlist/" + pname);
    },
    newPlaylist: async function () {
      useQuasar().loading.show({
        delay: 400, // ms
      });

      let playlistFile = "466-Erase.thr";
      var formData = new FormData();
      var blob = new Blob([playlistFile], { type: "text/plain" });
      formData.append("file", blob, "333-new_playlist.seq");
      await this.$axios.post(
        this.store.tableBaseURL + "/uploadtofileman",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      useQuasar().loading.hide();

      useQuasar().notify({
        type: "positive",
        message: "Playlist created",
      });
      this.refreshFiles();
    },
    refreshFiles: async function (done) {
      await this.$axios
        .get(this.store.tableBaseURL + "/filelist")
        .then((response) => {
          this.patterns = [];
          this.playlists = [];
          response.data.files.forEach((file) => {
            if (file.name.includes(".thr")) {
              //thr
              this.patterns.push(file);
            } else if (file.name.includes(".seq")) {
              //sequence / playlist
              this.$axios
                .get(this.store.tableBaseURL + "/files/sd/" + file.name)
                .then((response) => {
                  const lines = response.data.split("\n");
                  file.itemCount = lines.length;
                  file.preview = [
                    "/images.png",
                    "/images.png",
                    "/images.png",
                    "/images.png",
                  ];
                  try {
                    file.preview[0] =
                      "https://webcenter.sisyphus-industries.com/uploads/track/thr/" +
                      lines[0].split("-")[0] +
                      "/thumb_400.png";
                  } catch (e) {}
                  try {
                    file.preview[1] =
                      "https://webcenter.sisyphus-industries.com/uploads/track/thr/" +
                      lines[1].split("-")[0] +
                      "/thumb_400.png";
                  } catch (e) {}
                  try {
                    file.preview[2] =
                      "https://webcenter.sisyphus-industries.com/uploads/track/thr/" +
                      lines[2].split("-")[0] +
                      "/thumb_400.png";
                  } catch (e) {}
                  try {
                    file.preview[3] =
                      "https://webcenter.sisyphus-industries.com/uploads/track/thr/" +
                      lines[3].split("-")[0] +
                      "/thumb_400.png";
                  } catch (e) {}
                  this.playlists.push(file);
                });
            }
          });
        });
      //this.playlists.push({ name: "All Tracks.seq" });
      done();
    },
  },
  mounted: async function () {
    useQuasar().loading.show({
      delay: 100, // ms
    });
    await this.refreshFiles(function () {});
    useQuasar().loading.hide();
    this.loaded = true;
  },
  setup() {
    const store = useMainStore();

    return {
      store,
    };
  },
};
</script>
