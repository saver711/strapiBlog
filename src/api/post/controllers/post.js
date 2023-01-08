"use strict";
//////👁️ edit each controller OR make a policy to run before desired controllers for desired routes, See:
///// policies/.....
///// routes/.....
/**
 * post controller
 */
const { UnauthorizedError } = require("@strapi/utils").errors;
const { parseBody } = require("./transform");
const isObject = (a) => a instanceof Object;

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::post.post", ({ strapi }) => ({
  // Edited the core code https://github.com/strapi/strapi/blob/main/packages/core/strapi/lib/core-api/controller/collection-type.js
  async create(ctx) {
    const { query } = ctx.request;

    const { data, files } = parseBody(ctx);

    if (!isObject(data)) {
      throw new ValidationError('Missing "data" payload in the request body');
    }
    data.author = ctx.state.user.id; //👁️
    const sanitizedInputData = await this.sanitizeInput(data, ctx);

    const entity = await strapi
      .service("api::post.post")
      .create({ ...query, data: sanitizedInputData, files });
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // rewrite the find action to distinguish between auth user and not to filter out premium posts
  async find(ctx) {
    const { query } = ctx.request;
    const isAuthUser = ctx.state.user;
    const acquiringNonPremiumPosts = query.filters?.premium == false;
    if (isAuthUser || acquiringNonPremiumPosts) return await super.find(ctx); // is auth he can see all posts, or the client is explicitly acquiring nonPremiumPosts

    // else (public) (can see only nonPremiumPosts), (best) solution will be to built a new custom service (findNonPremiumPosts)
    // const newQueryObj = {
    //   ...query,
    //   filters: {
    //     premium: false,
    //     ...query.filters, // if i need to overwrite this behavior from client side, i can with query: filters[premium]=true
    //   },
    // };

    // // i should use only one of these ⬇️, maybe the second one is better
    // const nonPremiumPosts = await strapi.service("api::post.post").find(newQueryObj);

    // const nonPremiumPosts = await strapi.entityService.findMany(
    //   "api::post.post",
    //   newQueryObj
    // );

    // the (best) solution
    const nonPremiumPosts = await strapi
      .service("api::post.post")
      .findNonPremiumPosts(ctx.query);

    // these 2 steps will be applied in either cases
    const sanitizedNonPremiumPosts = await this.sanitizeOutput(
      nonPremiumPosts,
      ctx
    );
    return this.transformResponse(sanitizedNonPremiumPosts);
  },

  // similar to ↗️
  async findOne(ctx) {
    const { query } = ctx.request;
    const isAuthUser = ctx.state.user;
    const acquiringNonPremiumPost = query.filters?.premium == false;
    if (isAuthUser || acquiringNonPremiumPost) return await super.findOne(ctx);

    // esle
    const { id } = ctx.params;
    const nonPremiumPost = await strapi
      .service("api::post.post")
      .findNonPremiumPost(id, query);
    const sanitizedNonPremiumPost = await this.sanitizeOutput(
      nonPremiumPost,
      ctx
    );
    return this.transformResponse(sanitizedNonPremiumPost);
  },

  // async update(ctx) {
  //   const { id } = ctx.params;
  //   const { query } = ctx.request;

  //   const { data, files } = parseBody(ctx);

  //   if (!isObject(data)) {
  //     throw new ValidationError('Missing "data" payload in the request body');
  //   }

  //   const sanitizedInputData = await this.sanitizeInput(data, ctx);

  //   //👁️
  //   //const post = await strapi.db
  //     //.query("api::post.post")
  //     //.findOne({ where: { id }, populate: ["author"] });
  // //const post = await strapi
  //   //.service("api::post.post")
  //   //.findOne(id, { populate: ["author"] });
  // const post = await strapi.entityService.findOne("api::post.post", id, { //✅ best practice
  //     populate: ["author"],
  //   });
  //   if (!post) {
  //     // https://github.com/jshttp/http-errors#list-of-all-constructors
  //     return ctx.notFound(`Post with id ${id} not found.`);
  //   }
  // if (!post.author) {
  //   throw new UnauthorizedError(`This is an admin post`);
  // }
  //   //👁️
  //ctx.state.user > public user : null // auth user : user data
  //   if (post.author.id !== ctx.state.user.id) {
  //     return ctx.unauthorized(`You are not the owner of this post.`);
  //   }

  //   const entity = await strapi
  //     .service("api::post.post")
  //     .update(id, { ...query, data: sanitizedInputData, files });
  //   const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

  //   return this.transformResponse(sanitizedEntity);
  // },

  // async delete(ctx) {
  //   const { id } = ctx.params;
  //   const { query } = ctx;

  //   const post = await strapi.db
  //     .query("api::post.post")
  //     .findOne({ where: { id }, populate: ["author"] });
  //   if (!post) {
  //     return ctx.notFound(`Post with id ${id} not found.`);
  //   }
  // if (!post.author) {
  //   throw new UnauthorizedError(`This is an admin post`);
  // }

  //   if (post.author.id !== ctx.state.user.id) {
  //     return ctx.unauthorized(`You are not the owner of this post.`);
  //   }

  //   const entity = await strapi.service("api::post.post").delete(id, query);
  //   const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

  //   return this.transformResponse(sanitizedEntity);
  // },

  // like action for like-post custom route
  async likePost(ctx) {
    // if (!ctx.state.user) throw new UnauthorizedError("You need to login first"); // i don't really need to do this because it is a handler for new custom route which is not reachable for public users -or auth users actually- by default
    const postId = ctx.params.id;
    const { query } = ctx.request;
    const userId = ctx.state.user.id;
    const likedPost = await strapi
      .service("api::post.post")
      .likePost(postId, userId, query);

      const sanitizedLikedPost = await this.sanitizeOutput(
        likedPost,
        ctx
      );
      return this.transformResponse(sanitizedLikedPost);
  },
}));
