"use strict";

/**
 * post service
 */
const { UnauthorizedError } = require("@strapi/utils").errors;
const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::post.post", {
  async findNonPremiumPosts(queryObj) {
    const newQueryObj = {
      ...queryObj,
      filters: {
        premium: false,
        ...queryObj.filters,
      },
    };

    const nonPremiumPosts = await strapi.entityService.findMany(
      "api::post.post",
      this.getFetchParams(newQueryObj)
    );

    return nonPremiumPosts;
  },

  async findNonPremiumPost(postId, queryObj) {
    const post = await strapi.entityService.findOne(
      "api::post.post",
      postId,
      this.getFetchParams(queryObj)
    );

    if (post.premium) throw new UnauthorizedError(`This is a premium post`);
    return post;
  },

  async likePost(postId, userId, query) {
    const thePostToLike = await strapi.entityService.findOne(
      "api::post.post",
      postId,
      { populate: ["likedBy"] }
    );

    const usersLikedThisPost = thePostToLike.likedBy.map((user) => user.id);

    const isTheSameUserTryingToLikeAgain = usersLikedThisPost.some(
      (likedUserId) => likedUserId === userId
    );

    const finalUsersToBeSetAsLikes = isTheSameUserTryingToLikeAgain
      ? usersLikedThisPost.filter((likedUserId) => likedUserId !== userId)
      : [...usersLikedThisPost, userId];

    const post = await strapi.entityService.update(
      "api::post.post",
      postId,
      {
        data: {
          likedBy: finalUsersToBeSetAsLikes,
        },
        ...query,
      }
    );
    return post;
  },
});
