<template>
  <div class="home">
    <q-header elevated class="header bg-black text-white">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="q-mr-sm"
          @click="$router.go(-1)"
        />
        <q-toolbar-title
          class="text-center"
          v-if="allTrackMode"
          >All Tracks</q-toolbar-title
        >
        <q-toolbar-title
          @click="renameAction()"
          class="text-center"
          v-else
          >{{
            playlist.name
          }}</q-toolbar-title
        >
        <q-btn
          @click="editing = !editing"
          v-if="!allTrackMode && editing == false"
          flat
          round
          dense
          icon="create"
          class="q-mr-sm"
        />
        <q-btn
          @click="
            editing = !editing;
            saveEdits();
          "
          v-if="!allTrackMode && editing == true"
          flat
          round
          dense
          icon="check"
          class="q-mr-sm"
        />
        <q-btn
          v-if="allTrackMode"
          flat
          round
          class="q-mr-sm"
        />
      </q-toolbar>
      <q-toolbar
        v-if="!allTrackMode"
        style="padding-top: 0; min-height: 25px"
        class="justify-center"
      >
        <q-btn
          v-if="editing == false"
          outline
          rounded
          color="white"
          flat
          icon="play_arrow"
          @click="store.play(`/sd/${playlist.id}.seq`)"
        />
        <q-btn
          v-if="editing == true"
          outline
          rounded
          color="white"
          flat
          icon="delete"
          @click="
            deleteThisPlaylist();
          "
        />
      </q-toolbar>
    </q-header>

    <q-dialog v-model="renameprompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Rename Playlist</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            color="black"
            dense
            v-model="name"
            autofocus
            @keyup.enter="prompt = false"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-black">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Rename" @click="renamePlaylist()" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-list bordered separator>
      <draggable v-model="tracks" :disabled="!editing" item-key="id">
        <template #item="{element}">
          <q-item
          style="border-bottom: 1px solid #ccc"
          clickable
          v-ripple
          @click.stop="openTrack(element.id)"
        >
          <q-item-section avatar>
            <img
              style="height: 100px;"
              :src="
                'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                element.track_id +
                '/thumb_400.png'
              "
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="home__item-title">{{
              element.name
            }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-btn
              @click.stop="tracks.splice(i, 1)"
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
        </template>
      </draggable>
    </q-list>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { useQuasar } from "quasar";
import { useMainStore } from "src/stores/main";
import { store } from "quasar/wrappers";
import { useFilesStore } from "src/stores/files";
import { toRaw } from "vue";

export default {
  name: "PlaylistPage",
  components: {
    draggable,
  },
  data: function () {
    return {
      tracks: [],
      editing: false,
      renameprompt: false,
      name: "",
      playlist: {},
      allTrackMode: false
    };
  },
  methods: {
    renameAction: function () {
      if (this.editing == true) {
        this.renameprompt = true;
      }
    },
    async deleteThisPlaylist() {
      this.quasar.loading.show({
        delay: 100, // ms
      });

      this.files.playlists.splice(this.files.playlists.indexOf(this.playlist), 1);
      await this.files.saveManifest();

      await this.store.delete(`/sd/${playlist.id}.seq`);

      this.quasar.loading.hide();
      this.quasar.notify({
        type: "positive",
        message: "Deleted",
      });

      $router.go(-1);
    },
    renamePlaylist: async function () {
      this.quasar.loading.show({
        delay: 100, // ms
      });

      this.files.playlists[this.files.playlists.indexOf(this.playlist)].name = this.name;

      await this.files.saveManifest();

      this.quasar.loading.hide();
      this.$router.go(-1);
      this.quasar.notify({
        type: "positive",
        message: "Renamed",
      });
    },
    openTrack: function (id) {
      if (this.editing == false) {
        this.$router.push("/library/track/" + id);
      }
    },
    saveEdits: async function () {
      this.quasar.loading.show({
        delay: 100, // ms
      });
      let playlistFile = "";
      this.tracks.forEach((pattern) => {
        playlistFile += pattern.id + ".thr\n";
      });

      this.files.playlists[this.files.playlists.indexOf(this.playlist)].tracks = this.tracks;

      var formData = new FormData();
      var blob = new Blob([playlistFile], { type: "text/plain" });
      formData.append("file", blob, `${this.$route.params.id}.seq`);
      await this.$axios.post(this.store.tableBaseURL + "/uploadtofileman", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await this.files.saveManifest();

      this.quasar.loading.hide();
      this.quasar.notify({
        type: "positive",
        message: "Saved",
      });
    }
  },
  async mounted() {
    if (this.$route.params.id == "all_tracks") {
      this.allTrackMode = true;
    } else {
      this.playlist = this.files.playlists.find((trackobj) => trackobj.id === this.$route.params.id);
      
      this.playlist.tracks.forEach((v, i) => {
        this.tracks.push(this.files.tracks.find((trackobj) => trackobj.id == v.id));
      })
    }
    this.loaded = true;
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
