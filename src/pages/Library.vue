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

    <q-pull-to-refresh color="white" bg-color="black" @refresh="refreshFiles()">
      <q-list v-if="loaded" bordered separator>
        <q-item clickable v-ripple @click="openPlaylist('all_tracks')">
          <q-item-section avatar class="col">
            <div class="row" style="padding-bottom: 5px">
              <img
                style="padding-right: 5px; border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  files.tracks[0]?.track_id ?? 3113
                }/thumb_400.png`"
              />
              <img
                style="border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  files.tracks[1]?.track_id ?? 3113
                }/thumb_400.png`"
              />
            </div>
            <div class="row">
              <img
                style="padding-right: 5px; border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  files.tracks[2]?.track_id ?? 3113
                }/thumb_400.png`"
              />
              <img
                style="border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  files.tracks[3]?.track_id ?? 3113
                }/thumb_400.png`"
              />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="home__item-title" overline
              >All Tracks</q-item-label
            >
            <q-item-label class="home__item-subtitle"
              >{{ files.tracks.length }} tracks</q-item-label
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
        <q-item
          clickable
          v-ripple
          v-for="playlist in files.playlists"
          :key="playlist.name"
          @click="openPlaylist(playlist.id)"
        >
          <q-item-section avatar class="col">
            <div class="row" style="padding-bottom: 5px">
              <img
                style="padding-right: 5px; border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  playlist.db_tracks[0] ?? 3113
                }/thumb_400.png`"
              />
              <img
                style="border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  playlist.db_tracks[1] ?? 3113
                }/thumb_400.png`"
              />
            </div>
            <div class="row">
              <img
                style="padding-right: 5px; border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  playlist.db_tracks[2] ?? 3113
                }/thumb_400.png`"
              />
              <img
                style="border-radius: 30px; height: 60px"
                :src="`https://webcenter.sisyphus-industries.com/uploads/track/thr/${
                  playlist.db_tracks[3] ?? 3113
                }/thumb_400.png`"
              />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="home__item-title" overline>{{
              playlist.name
            }}</q-item-label>
            <q-item-label class="home__item-subtitle"
              >{{ playlist.tracks.length }} tracks</q-item-label
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
import { useFilesStore } from "src/stores/files";
import { useMainStore } from "src/stores/main";

export default {
  name: "LibraryPage",
  components: {},
  data: function () {
    return {
      loaded: true,
    };
  },
  methods: {
    openPlaylist: function (pname) {
      this.$router.push("/library/playlist/" + pname);
    },
    newPlaylist: async function () {
      this.quasar.loading.show({
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
      this.quasar.loading.hide();

      this.quasar.notify({
        type: "positive",
        message: "Playlist created",
      });
      this.files.refreshFiles();
    },
  },
  setup() {
    const store = useMainStore();
    const files = useFilesStore();
    const quasar = useQuasar();

    return {
      store,
      files,
      quasar,
    };
  },
};
</script>
