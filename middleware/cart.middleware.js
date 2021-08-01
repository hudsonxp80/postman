const responses = require("../controllers/responses");

module.exports = (User, Cart, Product, CartItem) => {
    const crud = require("../controllers/crud")(Cart);
    const crudCartItem = require("../controllers/crud")(CartItem);

    return {
        ...crud,
        getUserCart: async (req, res, next) => {
            cart = await Cart.findOne({
                where: {
                    user_id: req.body.userId,
                    status: "pending",
                },
            });
            if (!cart) {
                cart = Cart.build({
                    user_id: req.body.userId,
                    status: "pending",
                    total: 0,
                });
                cart = await cart.save();
            }
            if (cart instanceof Cart) {
                cart = cart.toJSON();
                items = await CartItem.findAll({
                    where: {
                        order_id: cart.id,
                    },
                });
                cart.items = items;
            }
            req.cart = cart;

            responses.next(res, next);
        },
        addToCart: async (req, res, next) => {
            req.body.order_id = req.cart.id;
            let itemExisted = false;
            cart.items.map((item) => {
                if (item.product_id == req.body.product_id) {
                    itemExisted = true;
                    req.body.qty += item.qty;
                }
            });

            if (req.body.price == 0) req.body.price = req.product.price;

            if (itemExisted)
                await CartItem.destroy({
                    where: {
                        order_id: req.body.order_id,
                        product_id: req.body.product_id,
                    },
                });
            crudCartItem.create(req, res, next);
        },
        checkQty: async (req, res, next) => {
            if (req.body.qty < 1)
                responses.fail(res)({
                    errorCode: "MIN QTY ERROR",
                    errorMessage: "Quantity is too small.",
                });
            product = await Product.findByPk(req.body.product_id);
            if (!product)
                responses.fail(res)({
                    errorCode: "PRODUCT NOT FOUND",
                    errorMessage: "Product is not found",
                });
            if (product.stock < req.body.qty)
                responses.fail(res)({
                    errorCode: "OUT OF STOCK",
                    errorMessage:
                        "Not enough inventory. Can order no ore than " +
                        product.stock,
                });
            req.product = product;
            responses.next(res, next);
        },
        checkUser: async (req, res, next) => {
            user = await User.findByPk(req.body.userId);
            if (!user)
                responses.fail(res)({
                    errorCode: "USER NOT FOUND",
                    errorMessage: "User is not found",
                });
            else responses.next(res, next);
        },
    };
};
