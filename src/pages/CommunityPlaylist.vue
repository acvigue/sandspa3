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
        <q-toolbar-title class="text-center">{{
          playlist.name
        }}</q-toolbar-title>
        <q-btn flat round dense class="q-mr-sm" />
      </q-toolbar>
    </q-header>

    <q-infinite-scroll @load="function () {}" :offset="250">
      <q-list bordered separator>
        <q-item v-for="track in tracks" :key="track.id">
          <q-inner-loading :showing="track.is_downloading">
            <q-spinner size="50px" color="black" />
          </q-inner-loading>
          <q-item-section avatar>
            <img
              style="height: 75px"
              :src="
                'https://webcenter.sisyphus-industries.com/' + track.large_photo
              "
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="home__item-title">{{
              track.name
            }}</q-item-label>
            <q-item-label class="home__item-title text-grey-7"
              >by {{ track.created_by_name }}</q-item-label
            >
            <q-item-label class="home__item-title text-grey-7"
              >{{ track.download_count }} downloads</q-item-label
            >
          </q-item-section>
          <q-item-section avatar>
            <q-btn
              @click.stop="downloadPattern(track)"
              v-if="!track.is_downloaded && !track.is_downloading"
              round
              flat
              color="white"
              text-color="black"
              size="md"
              icon="get_app"
            />
            <q-btn
              v-if="track.is_downloaded"
              @click.stop="function() {}"
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
import { useQuasar } from "quasar";
import { useFilesStore } from "src/stores/files";

export default {
  name: "CommunityPlaylist",
  components: {},
  data: function () {
    return {
      is_downloading: false,
      playlist: {
        name: "",
      },
      tracks: [],
    };
  },
  methods: {
    downloadPattern: async function (pattern) {
      pattern.is_downloading = true;

      await this.files.addTrack(pattern);

      pattern.is_downloading = false;
      pattern.is_downloaded = true;
    },
  },
  async mounted() {
    this.quasar.loading.show({ delay: 400 });
    if (this.store.secure.webcenterToken == "") {
      //Log in to Webcenter
      await this.store.loginToWebCenter();
    }

    //Get popular tracks
    await this.$axios
      .get(
        "https://webcenter.sisyphus-industries.com/playlists/" +
          this.$route.params.id +
          ".json",
        { headers: { Authorization: this.store.secure.webcenterToken } }
      )
      .then((response) => {
        const tracks = response.data.resp;
        tracks.forEach((track) => {
          if (track.type == "track") {
            track.is_downloading = false;
            track.is_downloaded =
              this.files.tracks.find((trackobj) => trackobj.id === track.id) !=
              undefined;
            this.tracks.push(track);
          } else {
            this.playlist = track;
          }
        });
      });
    this.quasar.loading.hide();
  },
  setup() {
    const store = useMainStore();
    const files = useFilesStore();
    const quasar = useQuasar();

    return { store, files, quasar };
  },
};
</script>
