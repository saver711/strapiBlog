"use strict";

/**
 * post router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::post.post", {
  config: {
    delete: {
      policies: [
        // point to a registered policy
        "is-content-owner",
      ],
    },
    update: {
      policies: ["is-content-owner"],
    },
  },
});
