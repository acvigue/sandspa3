const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("pages/Home.vue"),
  },
  {
    path: "/library",
    name: "Library",
    component: () => import("pages/Library.vue"),
  },
  {
    path: "/library/playlist/:name",
    name: "Playlist",
    component: () => import("pages/Playlist.vue"),
  },
  {
    path: "/library/track/:name",
    name: "Track",
    component: () => import("pages/Track.vue"),
  },
  {
    path: "/community",
    name: "CommunityHome",
    component: () => import("pages/Community.vue"),
  },
  {
    path: "/community/:sort",
    name: "CommunityItemList",
    component: () => import("pages/CommunityItemList.vue"),
  },
  {
    path: "/community/playlist/:name/:id",
    name: "CommunityPlaylist",
    component: () => import("pages/CommunityPlaylist.vue"),
  },
  {
    path: "/control",
    name: "Control",
    component: () => import("pages/Control.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
