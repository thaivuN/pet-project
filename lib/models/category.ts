import { PermissionError } from '../errors';
import { BaseDocument } from './baseModel';
import * as mongoose from 'mongoose'
import timestampsPlugin from '../timestampsPlugin.js'
import EnumValues from '../enumValues'
import { BaseService, Clb, Id } from '../services/baseService'
let ObjectId = mongoose.Schema.Types.ObjectId;
const MODEL = 'Category'

export class CategoryService extends BaseService<Category>{
    async search(filters, user: Category, pagePreferences?: number, page?: number, callback?: Clb<Category[]>) {
        let searchString = filters.filter || "";
        let roleType = filters.roleType;
        var q = this.model.find({}).where('IsDeleted').in([false, null])
        q = this._setSearchFilter(q, searchString);

        if (pagePreferences && page) {
            q = q.skip((page - 1) * pagePreferences).limit(Number(pagePreferences));
        }
        return q.exec(callback);
    }
    _setSearchFilter(q, searchString) {
        if (searchString) {
            var filter = new RegExp('.*' + searchString.toLowerCase() + '.*', 'i')
            q = q.or([{ 'Name': filter }])
        }
        return q;
    }
    userExists(name: string, callback?: Clb<Category>) {
        return this.model.findOne({ Name: name }).exec(callback);
    }
    deleteById(id: Id, callback?: Clb<Category>) {
        return this.updateById(id, { IsDeleted: true }, callback);
    }
    // login(email: string, password: string, callback?: Clb<Category>) {
    //     var q = this.model.findOneAndUpdate(
    //         { Email: email, Password: password },
    //         { LastLoginDate: new Date() });

    //     return q.exec(callback).then(result => {
    //         return result;
    //     }, reason => {
    //         throw reason;
    //     });
    // }
}

export interface Category extends BaseDocument {
    Name: string
}

var categorySchema = new mongoose.Schema({
    Name: String,
}, { collection: 'categories' });
categorySchema.plugin(timestampsPlugin);

export let CategoryModel = mongoose.model(MODEL, categorySchema);
export default new CategoryService(MODEL)