<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer elevated>
      <NowPlaying v-if="!isHome && store.status != 'idle'"></NowPlaying>
      <SPAFooter></SPAFooter>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import SPAFooter from "./components/SPAFooter.vue";
import NowPlaying from "./components/NowPlaying.vue";
import { useMainStore } from "./stores/main";
import { useQuasar } from "quasar";
import { useFilesStore } from "./stores/files";

export default defineComponent({
  name: "App",
  components: {
    SPAFooter,
    NowPlaying,
  },
  mounted() {
    this.store.fetchInitialStatus();
    this.files.refreshFiles();

    this.$sse
      .create({ url: this.store.tableBaseURL + "/events", format: "json" })
      .on("status", (message) => {
        this.store.setNewStatus(message);
      })
      .on("error", (err) => {
        this.quasar.notify({
          type: "negative",
          message: "Lost SSE connection!",
        });
      })
      .connect();
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
  computed: {
    isHome() {
      return this.$route.path == "/";
    },
  },
});
</script>
