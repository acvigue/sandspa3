<template>
  <q-tabs
    v-model="tab"
    :breakpoint="0"
    align="justify"
    inline-label
    indicator-color="transparent"
    active-color="white"
    class="row bg-black text-grey-6"
  >
    <q-route-tab name="home" to="/" icon="home" label="" />
    <q-route-tab name="mails" to="/library" icon="blur_on" />
    <q-route-tab name="alarms" to="/community" icon="public" label="" />
    <q-route-tab name="movies" to="/control" icon="gps_fixed" label="" />
  </q-tabs>
</template>

<style></style>

<script>
export default {
  name: "SPAFooter",
  data() {
    return {
      tab: ""
    }
  }
};
</script>
