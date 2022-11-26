<template>
  <div class="home">
    <q-header elevated class="header bg-black text-white">
      <q-toolbar>
        <q-btn
          flat
          round
          icon="arrow_back"
          class="q-mr-sm"
          @click="$router.go(-1)"
        />
        <q-toolbar-title class="text-center">{{
          track.name
        }}</q-toolbar-title>
        <q-btn flat round class="q-mr-sm" />
      </q-toolbar>
    </q-header>

    <div class="row justify-center">
      <div class="track__data">
        <img
          style="width: 100%;"
          :src="
            `https://webcenter.sisyphus-industries.com/uploads/track/thr/${track.track_id}/thumb_400.png`
          "
        />
        <div class="row justify-around" style="margin-top: 12vh">
          <q-btn
            flat
            round
            icon="play_arrow"
            size="xl"
            class="q-mr-sm"
            @click="store.play(`/sd/${track.id}.thr`)"
          />
          <q-btn
            flat
            round
            icon="playlist_add"
            size="xl"
            class="q-mr-sm"
            @click="addToPlaylist()"
          />
          <q-btn
            flat
            round
            icon="delete"
            size="xl"
            class="q-mr-sm"
            @click="deleteThisTrack()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.track {
  &__data {
    margin-top: 4vh;
    padding-left: 4vw;
    padding-right: 4vw;
  }
  &__title {
    font-size: 20px;
  }
}
</style>

<script>
import { useMainStore } from "src/stores/main";
import { useFilesStore } from "src/stores/files";
import { useQuasar } from "quasar";

export default {
  name: "TrackPage",
  components: {},
  data: function () {
    return {
      track: {}
    };
  },
  mounted: function () {
    this.track = this.files.tracks.find((trackobj) => trackobj.id === this.$route.params.id)
  },
  methods: {
    async deleteThisTrack() {
      this.quasar.loading.show({
        delay: 100, // ms
      });

      this.files.tracks.splice(this.files.tracks.indexOf(this.track), 1);
      await this.files.saveManifest();

      await this.store.delete(`/sd/${track.id}.thr`);

      this.quasar.loading.hide();
      this.quasar.notify({
        type: "positive",
        message: "Deleted",
      });

      $router.go(-1);
    }
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
