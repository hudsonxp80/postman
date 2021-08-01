const responses = require("../controllers/responses");

module.exports = (Product) => {
    const crud = require("../controllers/crud")(Product);

    return {
        ...crud,
        checkExistingSKU: async (req, res, next) => {
            sku = req.body.sku;
            count = await Product.count({ where: { sku } });
            if (count) {
                responses.fail(res)({
                    errorCode: "SKU_EXISTED",
                    errorMessage: "SKU existed.",
                });
            } else next();
        },
    };
};
