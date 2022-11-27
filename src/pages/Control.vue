<template>
  <div class="home">
    <q-header elevated class="header bg-black text-white shadow-0">
      <q-toolbar>
        <q-toolbar-title class="text-center">Control</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-card style="margin: 2vw" bordered class="my-card">
      <q-card-section>
        <div class="row justify-between">
          <div class="text-h5">Lights</div>
          <q-toggle v-model="ledOnBool"/>
        </div>
        <br>
        <div class="text-h6">Brightness</div>
      </q-card-section>

      <q-card-section class="q-pt-none row justify-around items-center">
        <q-icon name="brightness_6" style="font-size: 19px" />
        <q-slider
          color="black"
          style="width: 75% !important"
          v-model="store.raw.ledBrightness"
          :min="0"
          :max="255"
          :disable="!ledOnBool || autoDimBool"
          label
          @change="updateLights()"
        />
        <q-icon name="brightness_7" style="font-size: 25px" />
        <q-toggle left-label label="Auto-Dim" v-model="autoDimBool"/>
      </q-card-section>

      <q-card-section>
        <div class="text-h6">Lighting Mode</div>
      </q-card-section>

      <q-card-section class="q-pt-none row justify-around items-center">
        <q-select
          style="width: 95% !important"
          outlined
          v-model="lightingMode"
          :disable="!ledOnBool"
          :options="store.effectArray"
          color="black"
        >
        </q-select>
        <template v-if="ledOnBool">
            <q-icon
              name="colorize"
              :style="'color: ' + solidcolor"
              class="cursor-pointer"
              size="sm"
            >
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-color no-header no-footer v-model="solidcolor"/>
              </q-popup-proxy>
            </q-icon>
          </template>
      </q-card-section>

      <q-card-section>
        <div class="text-h6">Effect Speed</div>
      </q-card-section>

      <q-card-section class="q-pt-none row justify-around items-center">
        <q-icon name="remove" style="font-size: 19px" />
        <q-slider
          color="black"
          style="width: 75% !important"
          v-model="invertSpeed"
          :disable="!ledOnBool"
          :min="0"
          :max="5000"
          label
        />
        <q-icon name="add" style="font-size: 25px" />
      </q-card-section>
    </q-card>
    <q-card style="margin: 2vw" bordered class="my-card">
      <q-card-section class="row justify-between">
        <div class="text-h6">Commands</div>
        <div class="text-h6">{{ store.queuedMoves }} in queue</div>
      </q-card-section>

      <q-card-section class="q-pt-none row justify-around">
        <q-btn color="black" icon="home" @click="home()" label="Home" />
        <q-btn color="black" icon="stop" @click="stop()" label="Halt" />
        <q-btn color="black" icon="power" @click="reset()" label="Reset" />
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="scss">
.header {
  padding-top: 4pt;
  padding-bottom: 4pt;
}

.home__item {
  padding-top: 3pt !important;
  padding-bottom: 3pt !important;

  &-title {
    font-size: 14pt !important;
    letter-spacing: 0.5pt !important;
  }
  &-subtitle {
    font-size: 12pt;
  }
}
</style>

<script>
import { useQuasar } from "quasar";
import { useMainStore } from "src/stores/main";
import { toRaw } from "vue";


export default {
  name: "ControlPage",
  components: {},
  data: function () {
    return {
      patterns: [],
      playlists: [],
      solidcolor: "",
      lightingMode: null
    };
  },
  methods: {
    stop() {
      this.store.stop();
      this.quasar.notify({
        type: "warning",
        message: "Robot halted",
      });
    },
    componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    },
    rgbToHex(r, g, b) {
      return (
        "#" +
        this.componentToHex(r) +
        this.componentToHex(g) +
        this.componentToHex(b)
      );
    },
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    },
    home() {
      this.store.exec("G28");
      this.quasar.notify({
        type: "positive",
        message: "Robot is now homing",
      });
    },
    reset() {
      this.store.reset();
      this.quasar.notify({
        type: "negative",
        message: "Robot reset",
      });
    },
    async updateLights() {
      this.quasar.loading.show({ delay: 250 });
      await this.store._updateLedConfig();
      this.quasar.loading.hide();
    }
  },
  mounted() {
    this.solidcolor = this.rgbToHex(
      this.store.raw.redVal,
      this.store.raw.greenVal,
      this.store.raw.blueVal
    );
    this.lightingMode = this.store.effectArray[this.store.raw.effectID];
  },
  computed: {
    ledOnBool: {
       get () {
         return this.store.raw.ledOn === 1
       },
      set (value) {
         this.store.raw.ledOn = value ? 1 : 0
         this.updateLights();
      }
    },
    autoDimBool: {
       get () {
         return this.store.raw.autoDim === 1
       },
      set (value) {
         this.store.raw.autoDim = value ? 1 : 0
         this.updateLights();
      }
    },
    invertSpeed: {
       get () {
         return 5000 - this.store.raw.effectSpeed;
       },
      set (value) {
         this.store.raw.effectSpeed = 5000 - value;
         this.updateLights();
      }
    }
  },
  watch: {
    solidcolor: async function (val) {
      const newR = this.hexToRgb(val).r;
      const newG = this.hexToRgb(val).g;
      const newB = this.hexToRgb(val).b;

      this.quasar.loading.show({ delay: 250 });
      await this.store.setColor(newR, newG, newB);
      this.quasar.loading.hide();
    },
    lightingMode: async function (val) {
      this.quasar.loading.show({ delay: 250 });
      this.store.setEffect(this.store.effectArray.indexOf(val));
      this.quasar.loading.hide();
    }
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
