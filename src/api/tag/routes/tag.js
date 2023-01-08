"use strict";

/**
 * tag router
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::tag.tag", {
  only: ["find", "findOne"],
  except: ["create"], // exclude
  config: {
    // find: {
    //   auth: true, //default :true, (enabling the JWT auth system (make it public or not by default for this specific route))
    //   policies: [],
    //   middlewares: [],
    // },
    // create,
    // delete,
    // findOne,
    // update
  },
});
