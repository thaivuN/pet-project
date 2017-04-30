import { PermissionError, UnauthorizedError } from '../../lib/errors';
import { BaseController, del, Factory, get, post, put, Router, User, UserService } from '../refs';
import { Request, Response } from 'ccd';
import * as utils from '../../lib/utils'
import * as validators from '../../lib/validators'
import errors from '../../lib/errors'
import * as request from 'request';
import EnumValues from '../../lib/enumValues';
import * as multer from 'multer';
import config from '../../config';

let upload = multer().single('Image');

const webSessionCheck = utils.requiresUserSession('web');
export function checkIfMe(req, res, next) {
    if (req.session.user.id == req.params.id) {
        next();
    } else {
        utils.sendNotAuthorized(req, res, 'web');
    }
}

export class UsersController extends BaseController<User>{
    svc: UserService

    @get('/', webSessionCheck)
    async index(req, res) {
        return await this.svc.search(req.query, req.session.user);
    }

    @get('/:id', webSessionCheck)
    view(req, res) {
        //return this.svc.byId(req.params.id)
        res.render('user.ejs', { user: this.svc.byId(req.params.id) });
    }

    @post('/:id', webSessionCheck)
    update(req, res) {
        return this.svc.updateById(req.params.id, req.body)
    }
    @post('/:id/photo', webSessionCheck)
    updatePhoto(req, res) {
        let id = req.params.id;
        let photoUrl = config.serverUrl + req.files[0].path;
        return this.svc.updateById(id, { PhotoUrl: photoUrl });
    }

    @put('/', webSessionCheck)
    async create(req, res) {
        req.body.Client = req.session.user.Client || req.session.user.ClientId;
        let user = await this.svc.create(req.body);
        user.Password = await validators.validatePasswordAndCreateHash(user.Password);
        return this.svc.createAndSave(user);
    }

    @del('/:id', webSessionCheck)
    async remove(req, res) {
        return this.svc.deleteById(req.params.id);
    }
}

export let controller = new UsersController(Factory.Users, Router());