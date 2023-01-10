<template>
  <div
    class="bg-black text-white row justify-center items-center nowplaying__container"
  >
    <div class="col" @click="$router.push('/')">
      <div v-if="store.isPlaylist" class="nowplaying__container-topline">
        Playing from
        {{ files.getPlaylist(store.playlistID)?.name }}
      </div>
      <div v-if="!store.isPlaylist" class="nowplaying__container-topline">
        Now Playing
      </div>
      <div class="nowplaying__container-trackname">
        {{ files.getTrack(store.trackID)?.name }}
      </div>
    </div>
    <div>
      <q-btn
        @click.stop="store.pause()"
        v-if="store.status == 'playing'"
        round
        color="black"
        size="lg"
        icon="pause"
      />
      <q-btn
        @click.stop="store.resume()"
        v-if="store.status == 'paused'"
        round
        color="black"
        size="lg"
        icon="play_arrow"
      />
    </div>
  </div>
</template>

<style lang="scss">
.nowplaying__container {
  padding-right: 15pt;
  padding-left: 15pt;
  padding-top: 4pt;
  padding-bottom: 4pt;
  border-bottom: 1px solid #fff;

  &-trackname {
    font-size: 14pt;
    letter-spacing: 0.7pt;
    font-weight: 500;
  }

  &-topline {
    font-size: 10pt;
    letter-spacing: 0.5pt;
    font-weight: 700;
  }
}
</style>

<script>
import { useMainStore } from "src/stores/main";
import { useFilesStore } from "src/stores/files";
import { useQuasar } from "quasar";

export default {
  name: "NowPlaying",
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
