const router = require("express").Router();
const { DataTypes } = require("sequelize");
const responses = require("./responses");

module.exports = (sequelize) => {
  /**
   * @typedef Product
   * @property {string} name
   * @property {string} sku.required
   * @property {number} price.required
   * @property {integer} stock
   *
   */

  const Product = require("../models/product")(sequelize, DataTypes);
  const User = require("../models/user")(sequelize, DataTypes);
  const mw = require("../middleware/product.middleware")(Product);
  const mwUser = require("../middleware/user.middleware")(User);

  /**
   * Get all products
   * @group Product
   * @route GET /products
   * @param {integer} pageSize.query.required number of items in one page
   * @param {integer} pageIndex.query page index, starting from 0
   * @returns {Array.<Product>} 200 - list of product
   * @security JWT
   */
  router.get("/", mw.getAll, (req, res) => {
    res.json(req.models);
  });

  /**
   * Get a product
   * @group Product
   * @route GET /products/{id}
   * @param {integer} id.path.required product ID
   * @returns {Product.model}  200
   * @security JWT
   */
  router.get("/:id", mw.get, (req, res) => {
    if (req.model == null) responses.notFound(res);
    else res.json(req.model);
  });

  /**
   * Delete a product
   * @group Product
   * @route DELETE /products/{id}
   * @param {integer} id.path.required product ID
   * @returns {string} 204 - no content
   * @security JWT
   */
  router.delete("/:id", mwUser.adminOnly, mw.delete, (req, res) => {
    responses.noContent(res);
  });

  /**
   * Create a product
   * @group Product
   * @route POST /products
   * @param {Product.model} product.body.required Product payload
   * @returns {Product.model}  200
   * @security JWT
   */
  router.post(
    "/",
    mwUser.adminOnly,
    mw.checkExistingSKU,
    mw.create,
    (req, res) => {
      res.json(req.model);
    }
  );

  /**
   * Update a user
   * @group Product
   * @route PUT /products/{id}
   * @param {integer} id.path.required product ID
   * @param {Product.model} product.body.required Product payload
   * @returns {Product.model}  200
   * @security JWT
   */
  router.put("/:id", mwUser.adminOnly, mw.update, (req, res) => {
    if (req.model == null) responses.notFound(res);
    else res.json(req.model);
  });

  return router;
};
