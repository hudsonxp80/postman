const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const url = require("url");
const env = process.env.NODE_ENV || "development";
const { Sequelize } = require("sequelize");
const { request } = require("http");
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "db.sqlite",
    logging: console.log,
});

app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.NODE_ENV != "production") {
    const expressSwagger = require("express-swagger-generator")(app);

    let options = {
        swaggerDefinition: {
            info: {
                description: "This is a sample server",
                title: "Swagger",
                version: "1.0.0",
            },
            host: "localhost:3000",
            basePath: "/",
            produces: ["application/json", "application/xml"],
            schemes: ["http"],
            securityDefinitions: {
                JWT: {
                    type: "apiKey",
                    in: "header",
                    name: "Authorization",
                    description: "",
                },
            },
        },
        basedir: __dirname, //app absolute path
        files: ["./controllers/auth.controller.js", "./controllers/*.js"], //Path to the API handle folder
    };
    expressSwagger(options);
}

app.use("/", require("./controllers/auth.controller")(sequelize));

app.get("/", (req, res) => {
    res.send("ok");
});

app.use("/users", require("./controllers/user.controller")(sequelize));
app.use("/products", require("./controllers/product.controller")(sequelize));
app.use("/", require("./controllers/cart.controller")(sequelize));

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running: ${process.env.PORT || 3000}`);
});
