const router = require("express").Router();
const { DataTypes } = require("sequelize");
const responses = require("./responses");

module.exports = (sequelize) => {
    /**
     * @typedef Cart
     * @property {integer} user_id
     * @property {number} total
     * @property {string} status
     *
     */

    /**
     * @typedef CartItem
     * @property {integer} order_id
     * @property {integer} product_id
     * @property {number} price
     * @property {integer} qty
     */

    const User = require("../models/user")(sequelize, DataTypes);
    const Cart = require("../models/cart")(sequelize, DataTypes);
    const Product = require("../models/product")(sequelize, DataTypes);
    const CartItem = require("../models/cartitem")(sequelize, DataTypes);
    const mw = require("../middleware/cart.middleware")(
        User,
        Cart,
        Product,
        CartItem
    );
    const mwUser = require("../middleware/user.middleware")(User);

    /**
     * Get user cart
     * @group Cart
     * @route GET /users/{id}/cart
     * @param {integer} id.path.required
     * @returns {Cart.model} 200 Cart model
     * @security JWT
     */
    router.get(
        "/users/:id/cart",
        (req, res, next) => {
            req.body.userId = req.params.id;
            next();
        },
        mw.checkUser,
        mw.getUserCart,
        (req, res) => {
            res.json(req.cart);
        }
    );

    /**
     * Add item to cart
     * @group Cart
     * @route POST /users/{id}/cart
     * @param {integer} id.path.required
     * @param {CartItem.model} cartitem.body.required
     * @returns {Cart.model} 200 Cart model
     * @security JWT
     */
    router.post(
        "/users/:id/cart",
        (req, res, next) => {
            req.body.userId = req.params.id;
            next();
        },
        mw.checkUser,
        mw.checkQty,
        mw.getUserCart,
        mw.addToCart,
        mw.getUserCart,
        (req, res) => {
            res.json(req.cart);
        }
    );
    return router;
};
