import * as ccd from 'ccd'
import { AbstractError } from "./../../lib/errors";
import { ItemService } from "./../../lib/models/item";

import { _PostRequest, _GetRequest, _PutRequest } from "./../../lib/requestHelper";
import { BaseController, del, Factory, get, post, put, Router, User } from './../refs';
import * as http from "http";
import { Item } from "../../lib/models/item";
import * as request from 'request'
import {CustomResponces} from "../../lib/baseController"


/**
 * Application level controller which handles the task of send HTTP request to the RESTful API controllers and directing the data to the Views
 * 
 */
export class ItemsClientController extends BaseController<Item>{

    svc: ItemService

    /**
     * Renders the Items page
     * @param req 
     * @param res 
     */
    @get("/")
    async getItemsPage(req, res){
        
        var categories;

        await _GetRequest("http://localhost:3001/api/1/categories/").then(function(result){
            console.log("////////////////////Fetching Categories - Results")
            console.log(result);
            categories = result;
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })

        //Fetch all Items and pass Items and Categories
        await _GetRequest("http://localhost:3001/api/1/items/").then(function(result){
            console.log("//////////// Results " + result);
            res.render("items.ejs",{items: result, categories: categories});
            console.log("////////////////////////");
            return CustomResponces.DO_NOTHING;
             
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })
        
    }

    /**
     * Renders the Item page based on the Item ID
     * 
     * @param req 
     * @param res 
     */
    @get("/:id")
    async itemDetail(req, res){
        await _GetRequest("http://localhost:3001/api/1/items/" + req.params.id).then(function(result){
            console.log("//////////// Results " + result);
            console.log (result)
            console.log("LOL");
            console.log("////////////////////////");
            return res.render("item.ejs",{item: result});
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })

        //res.render("items.ejs");
    }

     @get("/category/:id")
    async getByCategory(req, res){

        var categories;

        await _GetRequest("http://localhost:3001/api/1/categories/").then(function(result){
            console.log("////////////////////Fetching Categories - Results")
            console.log(result);
            categories = result;
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })

        await _GetRequest("http://localhost:3001/api/1/items/category/" + req.params.id).then(function(result){
            console.log("//////////// Results " + result);
            console.log (result)
            console.log("////////////////////////");
            return res.render("items.ejs",{items: result, categories: categories});
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })
    }

    /**
     * 
     * @param req 
     * @param res 
     */
    @get("/user/:id")
    async getByUser(req, res){
        await _GetRequest("http://localhost:3001/api/1/items/user/" + req.params.id).then(function(result){
            console.log("//////////// Results " + result);
            console.log (result)
            console.log("////////////////////////");
            return res.render("items.ejs",{items: result});
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })
    }

    /**
     * Creates an items
     * @param req 
     * @param res 
     */
    @post("/")
    async createItem(req, res){
        let data = req.body;

        data.CreatedBy = req.session.user;


        await _PostRequest("http://localhost:3001/api/1/items/", data).then(function(result){
            console.log("//////////// Results " + result);
            res.redirect("/items");
            return CustomResponces.DO_NOTHING;
             
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP, there was an error somewhere in your request.");
        })
    }

    /**
     * Dummy data testing
     * @param req 
     * @param res 
     */
    @post("/donothing")
    async doNothing(req, res){

        let user: User = req.session.user;
        let data = {
	        "Title": "Evil Stuff",
	        "Description": "Drugs are bad okay?",
	        "Price": 22,
            "CreatedBy": user,
	        "Categories":  [
                { _id:"58f8b48513d6172a7c23ba1b"},
                { _id: "58f8b4a513d6172a7c23ba1c"}
            ] 
        
         };

        await _PostRequest("http://localhost:3001/api/1/items/",data).then(function(result){
            console.log("//////////// Results " + result);
            console.log (result)
            console.log("////////////////////////");
            return res.redirect("http://localhost:3001/");
        }).catch(function(err){
            console.error("Error", err);
            return res.status(400).send("RIP");
        })

    }

    @post("/search")
    async functiom (req, res){
        var filters = { filter: req.body.filter };
        var items = await this.svc.search(filters);
        res.render('search.ejs', {results: items, originalFilters: filters});
        return CustomResponces.DO_NOTHING;

    }
    

    /**
     * NOT WORKING FOR NOW
     * Updates an Item
     * @param req 
     * @param res 
     */
    @post("/update/:id")
    async updateItem(req, res){
        let data = req.body;
        data.CreatedBy = req.session.user;

        let item = await this.svc.byId(req.params.id);
        
        if(checkUser(item, req)){
            console.log("Request body in update ////////////")
            console.log(req.body);
        
            await _PutRequest("http://localhost:3001/api/1/items/" + req.params.id, data).then(function(result){
            
                console.log("//////////// Results");
                console.log(result);
                res.redirect("back");
                return CustomResponces.DO_NOTHING;
            }).catch(function(err){
                return res.status(400).send("RIP");
            })   

        }else{
            res.status(401).send({status: "error", message: "You are not authorized to perform this action" });
        }

    }

}



/**
 * Validation module to check if an item was created by the session user
 * @param item Item
 * @param req Request
 */
function checkUser(item: Item, req){
    let user: User = req.session.user;

    if(user == null){
        return false;
    }

    console.log("///////Currently in CheckUser");
    console.log(user);

    let itemUser: User = item.CreatedBy as User;
    console.log(itemUser)
    console.log("///////////////////////")
    if (itemUser._id == user._id) {
        return true;
    }else{
        return false;
    }
    
}

async function getAllCategories(){
    var categories;

        await _GetRequest("http://localhost:3001/api/1/categories/").then(function(result){
            console.log("////////////////////Fetching Categories - Results")
            console.log(result);
            return result;
        }).catch(function(err){
            console.error("Error", err);
            throw new AbstractError("Sorry");
        })

}
   
export let controller = new ItemsClientController(Factory.Item, Router());
