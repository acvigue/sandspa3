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
        <q-toolbar-title class="text-center">{{ pageTitle }}</q-toolbar-title>
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
              style="height: 75px"
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
import { useFilesStore } from "src/stores/files";
import { useQuasar } from "quasar";

export default {
  name: "CommunityItemList",
  components: {},
  data: function () {
    return {
      patterns: [],
      allPatterns: []
    };
  },
  computed: {
    pageTitle() {
      if (this.$route.params.sort == "newest") {
        return "Newest Tracks";
      } else if (this.$route.params.sort == "popular") {
        return "Popular Tracks";
      } else {
        return "Playlists";
      }
    },
  },
  methods: {
    downloadPattern: async function (pattern) {
      pattern.is_downloading = true;

      await this.files.addTrack(pattern);

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
  },
  async mounted() {
    this.quasar.loading.show({
      delay: 0, // ms
    });

    if (this.store.secure.webcenterToken == "") {
      //Log in to Webcenter
      await this.store.loginToWebCenter();
    }

    if (this.$route.params.sort != "playlists") {
      const sort = this.$route.params.sort == "newest" ? "newest_designs" : "most_popular";

      await this.$axios
        .get(
          `https://webcenter.sisyphus-industries.com/tracks.json?sort=${sort}`,
          { headers: { Authorization: this.store.secure.webcenterToken } }
        )
        .then((response) => {
          const tracks = response.data.resp;
          tracks.forEach((track) => {
            track.is_downloading = false;
            track.is_downloaded = (this.files.tracks.find(trackobj => trackobj.id === track.id) != undefined);
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
    } else {
    }

    this.quasar.loading.hide();
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
