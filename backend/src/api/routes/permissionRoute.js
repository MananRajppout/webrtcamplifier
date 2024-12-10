const controller = require("../controllers/permissionController");

module.exports = function (app) {
    app.get("/api/getPermissions", controller.getPermissions);
};
