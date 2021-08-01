const router = require("express").Router();
const { DataTypes } = require("sequelize");
const responses = require("./responses");

module.exports = (sequelize) => {
    /**
     * @typedef User
     * @property {string} firstName
     * @property {string} lastName
     * @property {string} email
     * @property {string} password
     *
     */

    const User = require("../models/user")(sequelize, DataTypes);
    const mw = require("../middleware/user.middleware")(User);

    /**
     * Get all users
     * @group User
     * @route GET /users
     * @param {integer} pageSize.query.required
     * @param {integer} pageIndex.query
     * @returns [User.model]
     * @security JWT
     */
    router.get("/", mw.adminOnly, mw.getAll, (req, res) => {
        res.json(req.models);
    });

    /**
     * Get a user
     * @group User
     * @route GET /users/{id}
     * @param {integer} id.path.required
     * @returns {User.model}  200 - Unexpected error
     * @security JWT
     */
    router.get("/:id", mw.isAuthenticated, mw.get, (req, res) => {
        if (req.model == null) responses.notFound(res);
        else res.json(req.model);
    });

    /**
     * Delete a user
     * @group User
     * @route DELETE /users/{id}
     * @param {integer} id.path.required
     * @security JWT
     */
    router.delete("/:id", mw.isAuthenticated, mw.delete, (req, res) => {
        responses.noContent(res);
    });

    /**
     * Create a user
     * @group User
     * @route POST /users
     * @param {User.model} user.body.required
     * @security JWT
     */
    router.post(
        "/",
        mw.checkExistingEmail,
        mw.hashPassword,
        mw.create,
        (req, res) => {
            res.json(req.model);
        }
    );

    /**
     * Update a user
     * @group User
     * @route PUT /users/{id}
     * @param {integer} id.path.required
     * @param {User.model} user.body.required
     * @security JWT
     */
    router.put(
        "/:id",
        mw.hashPassword,
        mw.isAuthenticated,
        mw.update,
        (req, res) => {
            if (req.model == null) responses.notFound(res);
            else res.json(req.model);
        }
    );

    return router;
};
