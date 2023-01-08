"use strict";

/**
 * `is-content-owner` policy
 */
const { NotFoundError, UnauthorizedError } = require("@strapi/utils").errors;

module.exports = async (ctx, next) => {
  const { user } = ctx.state;

  // post id
  const { id } = ctx.params;

  // const post = await strapi.db
  //   .query("api::post.post")
  //   .findOne({ where: { id }, populate: ["author"] });
  // const post = await strapi
  //   .service("api::post.post")
  //   .findOne(id, { populate: ["author"] });
  const post = await strapi.entityService.findOne("api::post.post", id, { //✅ best practice // i think i should add ...queryObj
    populate: ["author"],
  });


  if (!post) {
    throw new NotFoundError(`Post with id ${id} not found.`);
  }
  if (!post.author) {
    throw new UnauthorizedError(`This is an admin post`);
  }
  if (post.author.id !== user.id) {
    throw new UnauthorizedError(`You are not the owner of this post.`);
  }
  return true
};
