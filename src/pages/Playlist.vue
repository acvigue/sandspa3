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
          v-if="$route.params.name == 'All Tracks.seq'"
          >{{ $route.params.name.replace(".seq", "") }}</q-toolbar-title
        >
        <q-toolbar-title
          @click="renameAction()"
          class="text-center"
          v-if="$route.params.name != 'All Tracks.seq'"
          >{{
            $route.params.name.split("-")[1].replace(".seq", "")
          }}</q-toolbar-title
        >
        <q-btn
          @click="editing = !editing"
          v-if="$route.params.name != 'All Tracks.seq' && editing == false"
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
          v-if="$route.params.name != 'All Tracks.seq' && editing == true"
          flat
          round
          dense
          icon="check"
          class="q-mr-sm"
        />
        <q-btn
          v-if="$route.params.name == 'All Tracks.seq'"
          flat
          round
          class="q-mr-sm"
        />
      </q-toolbar>
      <q-toolbar
        v-if="$route.params.name != 'All Tracks.seq'"
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
          @click="store.play('/sd/' + $route.params.name)"
        />
        <q-btn
          v-if="editing == true"
          outline
          rounded
          color="white"
          flat
          icon="delete"
          @click="
            store.delete('/sd/' + $route.params.name);
            $router.go(-1);
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

    <q-list bordered separator v-if="loaded">
      <draggable v-bind="dragOptions" v-model="patterns">
        <q-item
          style="border-bottom: 1px solid #ccc"
          clickable
          v-ripple
          v-for="(pattern, i) in patterns"
          :key="pattern.id"
          @click.stop="openTrack(pattern.name)"
        >
          <q-item-section avatar>
            <img
              height="100px"
              :src="
                'https://webcenter.sisyphus-industries.com/uploads/track/thr/' +
                pattern.name.split('-')[0].replace('sd/', '') +
                '/thumb_400.png'
              "
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="home__item-title">{{
              pattern.name.split("-")[1].replace(".THR", "").replace(".thr", "")
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
      </draggable>
    </q-list>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { useQuasar } from "quasar";
import { useMainStore } from "src/stores/main";
import { store } from "quasar/wrappers";

export default {
  name: "PlaylistPage",
  components: {
    draggable,
  },
  data: function () {
    return {
      patterns: [],
      loaded: false,
      editing: false,
      renameprompt: false,
      name: "",
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        disabled: !this.editing,
        ghostClass: "ghost",
      };
    },
  },
  methods: {
    renameAction: function () {
      if (this.editing == true) {
        this.renameprompt = true;
      }
    },
    renamePlaylist: async function () {
      this.quasar.loading.show({
        delay: 100, // ms
      });

      await this.store.delete("/sd/" + this.$route.params.name);
      let playlistFile = "";
      this.patterns.forEach((pattern) => {
        playlistFile += pattern.name + "\n";
      });

      var formData = new FormData();
      var blob = new Blob([playlistFile], { type: "text/plain" });
      formData.append(
        "file",
        blob,
        this.$route.params.name.split("-")[0] +
          "-" +
          this.name.replace(/-/g, "") +
          ".seq"
      );
      await axios.post(this.store.tableBaseURL + "/uploadtofileman", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      this.quasar.loading.hide();
      this.$router.go(-1);
      this.quasar.notify({
        type: "positive",
        message: "Playlist renamed",
      });
    },
    openTrack: function (pname) {
      if (this.editing == false) {
        this.$router.push("/library/track/" + pname);
      }
    },
    saveEdits: async function () {
      this.quasar.loading.show({
        delay: 100, // ms
      });
      let playlistFile = "";
      this.patterns.forEach((pattern) => {
        playlistFile += pattern.name + "\n";
      });

      var formData = new FormData();
      var blob = new Blob([playlistFile], { type: "text/plain" });
      formData.append("file", blob, this.$route.params.name);
      await axios.post(this.store.tableBaseURL + "/uploadtofileman", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      this.quasar.loading.hide();
      this.quasar.notify({
        type: "positive",
        message: "Playlist saved",
      });
    },
    refreshFiles: async function (done) {
      if (this.store.secure.webcenterToken == "") {
        //Log in to Webcenter
        await store.loginToWebCenter();
      }

      this.patterns = [];
      if (this.$route.params.name != "All Tracks.seq") {
        await axios
          .get(this.store.tableBaseURL + "/files/sd/" + this.$route.params.name)
          .then((response) => {
            const ptrns = response.data.split("\n");
            ptrns.forEach((file) => {
              if (file != "") {
                this.patterns.push({ name: file, size: 1234 });
              }
            });
          });
      } else {
        await axios
          .get(this.store.tableBaseURL + "/filelist")
          .then(async (response) => {
            response.data.files.forEach(async (file) => {
              if (file.name.includes(".THR") || file.name.includes(".thr")) {
                this.patterns.push(file);
              }
            });
          });
      }
      done();
    },
  },
  mounted: async function () {
    if (this.$route.params.name != "All Tracks.seq") {
      this.name = this.$route.params.name.split("-")[1].replace(".seq", "");
    }
    this.quasar.loading.show({
      delay: 100, // ms
    });
    await this.refreshFiles(function () {});
    this.quasar.loading.hide();
    this.loaded = true;
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
