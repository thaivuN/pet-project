"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const utils_1 = require("./lib/utils");
const index_1 = require("./controllers/index");
const apiBase = '/api/1';
const apiSessionCheck = utils_1.requiresUserSession('api');
const webSessionCheck = utils_1.requiresUserSession('web');
class RestServices {
    static setApiRoutes(app) {
        app.get('/', render('index'));
        app.use('/auth', index_1.ControllerFactory.Auth.router);
        let api = express.Router()
            .use('/users', index_1.ControllerFactory.Users.router);
        app.use(apiBase, api);
        return app;
    }
}
exports.default = RestServices;
function render(templateName) {
    return (req, res) => res.render(templateName);
}
//# sourceMappingURL=rest_server.js.map