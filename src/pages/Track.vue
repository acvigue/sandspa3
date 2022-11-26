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
          $route.params.name.split("-")[1].replace(".thr", "")
        }}</q-toolbar-title>
        <q-btn flat round class="q-mr-sm" />
      </q-toolbar>
    </q-header>

    <div class="row justify-center">
      <div class="track__data">
        <img
          width="100%"
          :src="
            'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
            $route.params.name.split('-')[0].replace('sd/', '') +
            '/thumb_400.png'
          "
        />
        <div class="row justify-around" style="margin-top: 12vh">
          <q-btn
            flat
            round
            icon="play_arrow"
            size="xl"
            class="q-mr-sm"
            @click="store.play('/sd/' + $route.params.name)"
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
            @click="store.delete('/sd/' + $route.params.name)"
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
import { useQuasar } from "quasar";

export default {
  name: "TrackPage",
  components: {},
  data: function () {
    return {
      patterns: [],
    };
  },
  methods: {
    getTrackMetadata: async function (done) {
      done();
    },
  },
  mounted: function () {
    this.refreshFiles();
  },
  setup() {
    const store = useMainStore();
    const quasar = useQuasar();

    return {
      store,
      quasar,
    };
  },
};
</script>
