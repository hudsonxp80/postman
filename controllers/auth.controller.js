const router = require("express").Router();
var crypto = require("crypto");
const { DataTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const responses = require("./responses");
const config = {
  secret: "some-secret",
  clientSecret: "819ba5aac968be4c",
  appIds: ["client", "backend"],
  refreshTokenSecret: "some-secret-refresh", // make sure it's not the same with secret
  port: 3000,
  tokenLife: 900,
  refreshTokenLife: 86400,
};
const tokenList = {};

module.exports = (sequelize) => {
  /**
   * @typedef UserLogin
   * @property {string} email.required
   * @property {string} password.required
   */

  /**
   * @typedef TokenMetadata
   * @property {string} token.required
   * @property {string} refreshToken.required
   * @property {string} user_id.required
   *
   */

  const User = require("../models/user")(sequelize, DataTypes);

  function generateToken(profile) {
    const token = jwt.sign(profile, config.secret, {
      expiresIn: config.tokenLife,
    });
    const refreshToken = jwt.sign(profile, config.refreshTokenSecret, {
      expiresIn: config.refreshTokenLife,
    });
    return {
      token: token,
      refreshToken: refreshToken,
    };
  }

  router.all("*", (req, res, next) => {
    // console.log(req.url, req._parsedUrl, req.headers);
    const whitelistUrls = ["/login", "/token", "/client"];
    if (whitelistUrls.indexOf(req._parsedUrl.pathname) > -1) {
      next();
    } else {
      let token =
        req.body.token ||
        req.query.token ||
        req.headers["authorization"] ||
        req.headers["Authorization"];
      // decode token
      if (token) {
        token = token.replace(/^Bearer /, "");
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function (err, decoded) {
          if (err) {
            return responses.fail(res)({
              errorCode: "INVALID TOKEN",
              errorMessage: "Invalid token.",
            });
          }
          req.__user = decoded;
          console.log(req.__user);
          next();
        });
      } else {
        return res.status(401).json({
          errorCode: "UNAUTHORIZED",
          errorMessage: "No token provided",
        });
      }
    }
  });

  /**
   * Login
   * @group Authentication
   * @route POST /login
   * @param {UserLogin.model} UserLogin.body.required email and password to login
   * @returns {TokenMetadata.model} 200 - Login successfully
   * @returns {Error.model} 400 - Invalid login credential
   */
  router.post("/login", async (req, res) => {
    user = await User.findOne({ where: { email: req.body.email } });
    if (!user || !user.password)
      return responses.fail(res)({
        errorCode: "INVALID CREDENTIAL",
        errorMessage: "Invalid login credential",
      });
    else {
      const salt = user.password.slice(0, user.password.indexOf(":"));
      const hash = crypto
        .pbkdf2Sync(req.body.password, salt, 1000, 64, `sha512`)
        .toString(`hex`);
      if (user.password !== salt + ":" + hash) {
        return responses.fail(res)({
          errorCode: "INVALID CREDENTIAL",
          errorMessage: "Invalid login credential",
        });
      }
    }

    // do the database authentication here, with user name and password combination.
    profile = {
      email: user.email,
      id: user.id,
      role: "user",
    };

    data = generateToken(profile);
    data.user_id = profile.id;

    res.json(data);
  });

  /**
   * Get app token
   * @group Authentication
   * @route POST /token
   * @param {string} app-id.header.required application ID, 'client' or 'backend'
   * @param {string} sign.header.required a time-based password genereted using app ID, secret and timestamp
   * @returns {TokenMetadata.model} 200
   * @returns {Error.model} 400
   */
  router.post("/token", async (req, res) => {
    const salt = config.clientSecret;
    const appId = req.headers["app-id"];

    if (config.appIds.indexOf(appId) == -1) {
      return responses.fail(res)({
        errorCode: "INVALID CREDENTIAL",
        errorMessage: "Not a valid client",
      });
    }

    const sign = req.headers["sign"];
    const time = sign.slice(0, sign.indexOf(":"));

    if (Math.abs(Date.now() - parseInt(time)) >= 5 * 3600)
      return responses.fail(res)({
        errorCode: "INVALID CREDENTIAL",
        errorMessage: "Expired signature",
      });

    const hash = crypto
      .pbkdf2Sync(appId + time, salt, 1000, 64, `sha512`)
      .toString(`hex`);

    if (config.appIds.indexOf(appId) == -1 || sign !== time + ":" + hash) {
      return responses.fail(res)({
        errorCode: "INVALID CREDENTIAL",
        errorMessage: "Invalid login credential",
      });
    } else {
      // do the database authentication here, with user name and password combination.
      profile = {
        email: "",
        id: appId,
        role: appId == "client" ? "guest" : "admin",
      };

      data = generateToken(profile);
      data.user_id = appId;

      res.json(data);
    }
  });

  /**
   * Login
   * @group Authentication
   * @route POST /token/refresh
   * @param {string} refresh-token.header.required refresh token provided when login or get token successfully
   * @returns {TokenMetadata.model} 200
   * @returns {Error.model} 400
   */
  router.post("/token/refresh", (req, res) => {
    token = req.headers["refresh-token"];
    jwt.verify(token, config.refreshTokenSecret, function (err, decoded) {
      if (err) {
        return responses.fail(res)({
          errorCode: "INVALID TOKEN",
          errorMessage: "The token is expired or invalid",
        });
      }
      profile = {
        email: decoded.email,
        id: decoded.id,
      };
      return res.json(generateToken(profile));
    });
  });

  router.get("/client", (req, res) => {
    res.status(200).send(`
        <form method="post" action="/client">
        <label>Client ID (either 'client' or 'backend')</label><br>
        <input place-holder="app id" name="appId" /><br>
        <input place-holder="SECRET" value="${config.clientSecret}" name="sign" disabled/><br>
        <input type="submit" value="Submit" />
        </form>
        `);
  });

  router.post("/client", (req, res) => {
    const salt = config.clientSecret;
    const time = Date.now();
    const hash = crypto
      .pbkdf2Sync(req.body.appId + time, salt, 1000, 64, `sha512`)
      .toString(`hex`);
    res.send(time.toString() + ":" + hash);
  });

  return router;
};
