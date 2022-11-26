<template>
  <div class="home">
    <q-header elevated class="header bg-black text-white shadow-0">
      <q-toolbar>
        <q-toolbar-title class="text-center">Community</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-pull-to-refresh color="white" bg-color="black" @refresh="refreshFiles">
      <!-- Featured Playlists -->
      <q-carousel
        class="community__carousel rounded-borders"
        autoplay
        slide
        animated
        v-model="slide"
        arrows
        infinite
      >
        <q-carousel-slide
          @click="openPlaylist(playlist.name, playlist.playlist_id)"
          :style="'background-color: ' + playlist.bg_color"
          v-for="(playlist, index) in featured_playlists"
          :key="playlist.id"
          :name="index"
          :img-src="playlist.thumburl"
        >
          <div class="absolute-bottom custom-caption">
            <div class="text-h2">{{ playlist.name }}</div>
            <div class="text-subtitle1">{{ playlist.description }}</div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <q-list bordered separator>
        <q-item
          @click="$router.push('/community/popular')"
          class="community__listitem"
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon style="font-size: 40px" color="black" name="album" />
          </q-item-section>

          <q-item-section>Most Popular</q-item-section>

          <q-item-section avatar>
            <q-icon
              style="font-size: 40px"
              color="black"
              name="navigate_next"
            />
          </q-item-section>
        </q-item>
        <q-item
          @click="$router.push('/community/newest')"
          class="community__listitem"
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon style="font-size: 40px" color="black" name="album" />
          </q-item-section>

          <q-item-section>Newest</q-item-section>

          <q-item-section avatar>
            <q-icon
              style="font-size: 40px"
              color="black"
              name="navigate_next"
            />
          </q-item-section>
        </q-item>
        <q-item
          @click="$router.push('/community/playlists')"
          class="community__listitem"
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon
              style="font-size: 40px"
              color="black"
              name="format_list_bulleted"
            />
          </q-item-section>

          <q-item-section>Playlists</q-item-section>

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

.custom-caption {
  text-align: center;
  padding: 12px;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
}
</style>

<script>
import { useMainStore } from "src/stores/main";
import { useQuasar } from "quasar";

export default {
  name: "CommunityHome",
  components: {},
  data: function () {
    return {
      slide: 1,
      featured_playlists: [],
    };
  },
  methods: {
    openPlaylist: function (pname, pid) {
      this.$router.push("/community/playlist/" + pname + "/" + pid);
    },
    refreshFiles: async function (done) {
      if (this.store.secure.webcenterToken == "") {
        await this.store.loginToWebCenter();
      }

      //Get featured playlists to put at top of page
      await this.$axios
        .get("https://webcenter.sisyphus-industries.com/playlists.json", {
          headers: { Authorization: this.store.secure.webcenterToken },
        })
        .then((response) => {
          const playlists = response.data.resp;
          playlists.forEach((playlist) => {
            if (playlist.is_featured) {
              playlist.thumburl =
                "https://webcenter.sisyphus-industries.com/uploads/track/thr/" +
                playlist.db_tracks[playlist.featured_track] +
                "/thumb_400.png";
              this.featured_playlists.push(playlist);
            }
          });
        });
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
