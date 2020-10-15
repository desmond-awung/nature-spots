// all routes for Adventures

// RESTful routes
/**
 * name         url             verb    desc
 * ============================================================
 * INDEX    /dogs           GET     Displays all dogs
 * NEW      /dogs/new       GET     Displays form to make a new dog
 * CREATE   /dogs           POST    Adds new dog to DB    
 * SHOW     /dogs/:id       GET     Shows info about one dog
 * 
 */

const express = require("express");
const router = express.Router();
// import middleware 
// if we require a directory, express automatically requires the content of index.js. So we don't need to write require("../middleware/index")
const middleware = require("../middleware");

// import index.js
// const indexRouter = require("./index");

// import DB models needed
const Adventure = require("../models/adventure");
const Review = require("../models/review");
// const { route } = require("./index");
// const { update } = require("../models/adventure");


// INDEX - all adventures
router.get("/", (req, res) => {                 // REST format
    // console.log(req.user);  // req.user the username and _id of the currently logged in user
    // get all capgrounds from db
    Adventure.find((err, allAdventures) => {
        if(err) {
            console.log(err);
        } else {
            // allAdventures contains a list/array of all objects corresponding to the documents from the db
            res.render("adventures/index", {adventures : allAdventures })
            // console.log((allAdventures));
        }
    });
});

// CREATE
// contains middleware to check for user authentication
router.post("/", middleware.isLoggedIn, (req, res) => {                // REST format
    // get user data first
    const author = {
        id : req.user._id,
        username : req.user.username
    }
    // then get adventures data from form
    let newAdventure = req.body.adventure;
    newAdventure.author = author;
    console.log(newAdventure);
    // const adventureName = req.body.adventure_name;
    // const adventureImgUrl = req.body.image_url;
    // const adventureDescription = req.body.description;
    // console.log(req.user);
    
    // const newAdventure = {
    //     name : adventureName,
    //     image : adventureImgUrl,
    //     price : price,
    //     description : adventureDescription,
    //     author : author
    // };
    // console.log(newAdventure);
    // create a new adventure document and save to adventures collection in DB
    Adventure.create(newAdventure, (err, newlyCreated) => {
        if(err) {
            console.log(err);
            req.flash("error", `Error Creating Adventure: ${newAdventure.name}`)
            res.redirect("/adventures");  
        } else {
            console.log(`New Adventure created: ${newlyCreated.name}`);
            // console.log(newlyCreated);
            // redirect back to /index page
            req.flash("success", `Adventure Successfully Created: ${newlyCreated.name}`)
            res.redirect("/adventures");  
        }
    });  // end of Adventure.create 
});    // end of adventure POST route

// NEW
// shows form that sends data to post route
// contains middleware to check for user authentication
router.get("/new", middleware.isLoggedIn, (req, res) => {                 // REST format
    res.render("adventures/new");
})

// SHOW
// shows more info on one adventure
// make sure this is declared AFTER thee NEW route, since both have similar formats
router.get("/:id", (req, res) => {
    // find the adventure with a specific id, which is passed from the <a> tag for this adventure in the index page
    // we get req.params.id: from the xxxxx portion of the url: /adventures/xxxxx,
    // populate the review data into foundAdventure's _reviews_ array 
    Adventure.findById(req.params.id).populate("reviews").exec((err, foundAdventure) => {
        if(err) {
            console.log(err);
        } else {
            // console.log(foundAdventure);
            // // render the show template for this foundAdventure
            res.render("adventures/show", {adventure : foundAdventure});
            // console.log(req.params);
        }

    });     // end of findById callback
});     // end of SHOW route


// EDIT
// contains middleware to check for user authentication and authorization
router.get("/:id/edit", middleware.checkAdventureOwnership, (req, res) => {
    // console.log(req);
    res.render("adventures/edit", {adventure : req.foundAdventure});
})


// UPDATE
// contains middleware to check for user authentication and authorization
router.put("/:id", middleware.checkAdventureOwnership, (req, res) => {
    // req.body.    ==> for sanitize
    // console.log("Now in put request");    debug
    // console.log(req.body);   debug
    /**
     * I thought of just updating without using findById - i.e. using .updateOne() or .update(), since we already know the adventure: req.foundAdventure (from checkAdventureOwnership() middleware). However, for .update(),
     * MyModel.update( myQuery, new_value, callback);
     *  we still need to do a query here, and there is no point in modifying the query which already works 
     */

    Adventure.findByIdAndUpdate(req.params.id, req.body.adventure, (err, updatedAdventure) => {
        if(err) {
            console.log(err);
            req.flash("error", `Error updating this adventure`)
            res.redirect("/adventures");   // if this adventure's id is not found, redirect to index page
        } else {
            console.log(`Adventure was updated: ${updatedAdventure.name}`);
            // console.log(updatedAdventure);
            req.flash("sucess", `Adventure was successfully updated: ${updatedAdventure.name}`);
            res.redirect(`/adventures/${req.params.id}`);     // redirect to this adventure's show page
        }
    });
})

// DESTROY
// contains middleware to check for user authentication and authorization
router.delete("/:id", middleware.checkAdventureOwnership, (req, res) => {
    // res.send("You really want to delete...")
    // display the canpground name first..
    let adventureToDel_name;
    Adventure.findById(req.params.id, (err, adventureToDelete) => {
        if(err) {
            console.log(err);
            req.flash("error", `Error deleting this adventure`)
            res.redirect("/adventures");   // redirect to the index page
        } else {
            // console.log(foundAdventure);
            adventureToDel_name = adventureToDelete.name; 
            console.log(`Adventure to be deleted: ${adventureToDel_name}`);   // will use this for the "Are you sure you want to delete" pop-up      
            // .remove() is deprecated. Use deleteOne,deleteMany, or bulkWrite instead.
            // Adventure.remove({_id : foundAdventure._id}, (err, result) => {
            Adventure.deleteOne({_id : adventureToDelete._id}, (err, result_adventure) => {
                if(err) {
                    console.log(err);
                    console.log("adventure could not be deleted");
                    res.redirect("/adventures");
                } else {
                    // delete all reviews associated with this adventure from DB
                    Review.deleteMany({_id : {$in : adventureToDelete.reviews}}, (err, result_review) => {
                        if(err) {
                            console.log("This Adventure's reviews could not be deleted");
                            console.log(err);
                            res.redirect("/adventures");   // redirect to the index page
                        } else {
                            console.log("Reviews deletion info:");
                            console.log(result_review);
                        }
                    });
                    // code reaches here if successfully deleted
                    console.log(`Adventure successfully deleted: ${adventureToDel_name}, with all associated reviews.`);            
                    console.log("Adventuregrrounds deletions info:");
                    console.log(result_adventure);    // displays object with details on what was deleted
                    req.flash("success", `Adventure successfully deleted: ${adventureToDel_name}, with all associated reviews.`)
                    res.redirect("/adventures");   // redirect to the index page
                }
            });
        }
    });

    // another way - the old way?
    // Adventure.findByIdAndRemove(req.params.id, (err) => {
    //     if(err) {
    //         console.log(err);
    //         res.redirect("/adventures");   // redirect to the index page
    //     } else {
    //         console.log(`Adventure successfully deleted: ${adventure_name}`);
    //         res.redirect("/adventures");   // redirect to the index page
    //     }

    // });
})


module.exports = router;