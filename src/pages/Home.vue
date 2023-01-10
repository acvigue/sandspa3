<template>
  <div class="home">
    <q-header elevated class="header bg-black text-white">
      <q-toolbar>
        <q-toolbar-title class="text-center" v-if="store.status == 'idle'"
          >Nothing Playing</q-toolbar-title
        >
        <q-toolbar-title
          class="text-center"
          v-if="store.status != 'idle' && store.queuedMoves != 0"
          >SandSPA</q-toolbar-title
        >
        <q-toolbar-title
          class="text-center"
          v-if="store.status != 'idle' && store.queuedMoves == 0"
          >Last Played</q-toolbar-title
        >
      </q-toolbar>
      <q-toolbar
        style="height: 5px !important; margin-top: -25px"
        v-if="store.isPlaylist"
      >
        <q-toolbar-title
          class="text-center text-grey-4"
          v-if="store.status != 'idle' && store.queuedMoves != 0"
          >Playing from
          {{ files.getPlaylist(store.playlistID)?.name }}</q-toolbar-title
        >
      </q-toolbar>
    </q-header>

    <q-card
      v-if="store.status == 'idle'"
      style="margin: 2vw"
      bordered
      class="my-card"
    >
      <q-card-section>
        <div class="text-h6 text-center">
          <q-icon
            style="font-size: 4.4em"
            name="sentiment_dissatisfied"
            color="black"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none text-center text-h6">
        Nothing is currently playing
      </q-card-section>
    </q-card>

    <q-card
      v-if="store.status != 'idle'"
      style="margin: 2vw"
      bordered
      class="my-card"
    >
      <q-card-section class="text-center">
        <img
          style="width: 80vw; max-width: 400px"
          :src="
            'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
            files.getTrack(store.trackID)?.track_id +
            '/thumb_400.png'
          "
        /><br />
        <div class="text-h6">{{ files.getTrack(store.trackID)?.name }}</div>
        <br />
        <q-btn
          @click="store.pause()"
          v-if="store.status == 'playing' && store.queuedMoves != 0"
          round
          color="black"
          size="lg"
          icon="pause"
        />
        <q-btn
          @click="store.resume()"
          v-if="store.status == 'paused' && store.queuedMoves != 0"
          round
          color="black"
          size="lg"
          icon="play_arrow"
        />
      </q-card-section>
      <q-card-section
        class="q-pt-none text-h6"
        style="padding-top: 1vh"
        v-if="false"
      >
        Next Up<br />
        <q-list separator style="margin-top: 2vh">
          <q-item
            clickable
            v-ripple
            v-for="pattern in nextup"
            :key="pattern.name"
          >
            <q-item-section avatar>
              <img
                height="60px"
                :src="
                  'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                  pattern.name.split('-')[0].replace('sd/', '') +
                  '/thumb_400.png'
                "
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="home__item-title">{{
                pattern.name
                  .split("-")[1]
                  .replace(".THR", "")
                  .replace(".thr", "")
              }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-btn
                @click.stop="patterns.splice(i, 1)"
                v-if="editing == true"
                round
                flat
                color="white"
                text-color="black"
                size="lg"
                icon="remove"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useMainStore } from "src/stores/main";
import { useQuasar } from "quasar";
import { useFilesStore } from "src/stores/files";

export default {
  name: "HomePage",
  data: function () {
    return {
      nextup: [],
    };
  },
  mounted() {
    setTimeout(() => {
      console.log(this.store);
    }, 2000);
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
