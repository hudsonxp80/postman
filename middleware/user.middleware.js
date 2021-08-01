const responses = require("../controllers/responses");
var crypto = require("crypto");

module.exports = (User) => {
    const crud = require("../controllers/crud")(User);

    return {
        ...crud,
        hashPassword: async (req, res, next) => {
            const password = req.body.password;
            if (!password)
                return responses.fail(res)({
                    errorCode: "NO PASSWORD",
                    errorMessage: "Password is required for this action.",
                });
            salt = crypto.randomBytes(16).toString("hex");

            hash = crypto
                .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
                .toString(`hex`);
            req.body.password = salt + ":" + hash;
            next();
        },
        checkExistingEmail: async (req, res, next) => {
            email = req.body.email;
            count = await User.count({ where: { email } });
            if (count) {
                responses.fail(res)({
                    errorCode: "EMAIL_EXISTED",
                    errorMessage: "Email existed.",
                });
            } else next();
        },
        isAuthenticated: async (req, res, next) => {
            if (req.__user.role == "admin") return next();
            if (req.__user.id != req.params.id) {
                return responses.forbidden(res)({
                    errorCode: "NOT THE OWNER",
                    errorMessage: "Cannot update this user's resource.",
                });
            } else next();
        },
        adminOnly: async (req, res, next) => {
            if (req.__user.role == "admin") return next();
            else {
                return responses.forbidden(res)({
                    errorCode: "NO PERMISSION",
                    errorMessage:
                        "This user does not has permission to perform the action",
                });
            }
        },
    };
};
