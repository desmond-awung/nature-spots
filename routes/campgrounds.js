// all routes for Campgrounds

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
const campground = require("../models/campground");


// import index.js
// const indexRouter = require("./index");

// import DB models needed
const Campground = require("../models/campground");
const Comment = require("../models/comment");
// const { route } = require("./index");
// const { update } = require("../models/campground");


// INDEX - all campgrounds
router.get("/", (req, res) => {                 // REST format
    // console.log(req.user);  // req.user the username and _id of the currently logged in user
    // get all capgrounds from db
    Campground.find((err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
            // allCampgrounds contains a list/array of all objects corresponding to the documents from the db
            res.render("campgrounds/index", {camps : allCampgrounds })
            // console.log((allCampgrounds));
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
    // then get campgrounds data from form
    let newCampground = req.body.campground;
    newCampground.author = author;
    console.log(newCampground);
    // const campName = req.body.camp_name;
    // const campImgUrl = req.body.image_url;
    // const campDescription = req.body.description;
    // console.log(req.user);
    
    // const newCampground = {
    //     name : campName,
    //     image : campImgUrl,
    //     price : price,
    //     description : campDescription,
    //     author : author
    // };
    // console.log(newCampground);
    // create a new campground document and save to campgrounds collection in DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if(err) {
            console.log(err);
            req.flash("error", `Error Creating Campground: ${newCampground.name}`)
            res.redirect("/campgrounds");  
        } else {
            console.log(`New Campground created: ${newlyCreated.name}`);
            // console.log(newlyCreated);
            // redirect back to /index page
            req.flash("success", `Campground Successfully Created: ${newlyCreated.name}`)
            res.redirect("/campgrounds");  
        }
    });  // end of Campground.create 
});    // end of campground POST route

// NEW
// shows form that sends data to post route
// contains middleware to check for user authentication
router.get("/new", middleware.isLoggedIn, (req, res) => {                 // REST format
    res.render("campgrounds/new");
})

// SHOW
// shows more info on one campground
// make sure this is declared AFTER thee NEW route, since both have similar formats
router.get("/:id", (req, res) => {
    // find the campground with a specific id, which is passed from the <a> tag for this campground in the index page
    // we get req.params.id: from the xxxxx portion of the url: /campgrounds/xxxxx,
    // populate the comment data into foundCampground's _comments_ array 
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err) {
            console.log(err);
        } else {
            // console.log(foundCampground);
            // // render the show template for this foundCampground
            res.render("campgrounds/show", {campground : foundCampground});
            // console.log(req.params);
        }

    });     // end of findById callback
});     // end of SHOW route


// EDIT
// contains middleware to check for user authentication and authorization
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    // console.log(req);
    res.render("campgrounds/edit", {campground : req.foundCampground});
})


// UPDATE
// contains middleware to check for user authentication and authorization
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    // req.body.    ==> for sanitize
    // console.log("Now in put request");    debug
    // console.log(req.body);   debug
    /**
     * I thought of just updating without using findById - i.e. using .updateOne() or .update(), since we already know the campground: req.foundCampground (from checkCampgroundOwnership() middleware). However, for .update(),
     * MyModel.update( myQuery, new_value, callback);
     *  we still need to do a query here, and there is no point in modifying the query which already works 
     */

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err) {
            console.log(err);
            req.flash("error", `Error updating this campground`)
            res.redirect("/campgrounds");   // if this campground's id is not found, redirect to index page
        } else {
            console.log(`Campground was updated: ${updatedCampground.name}`);
            // console.log(updatedCampground);
            req.flash("sucess", `Campground was successfully updated: ${updatedCampground.name}`);
            res.redirect(`/campgrounds/${req.params.id}`);     // redirect to this campground's show page
        }
    });
})

// DESTROY
// contains middleware to check for user authentication and authorization
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    // res.send("You really want to delete...")
    // display the canpground name first..
    let campToDel_name;
    Campground.findById(req.params.id, (err, campgroundToDelete) => {
        if(err) {
            console.log(err);
            req.flash("error", `Error deleting this campground`)
            res.redirect("/campgrounds");   // redirect to the index page
        } else {
            // console.log(foundCampground);
            campToDel_name = campgroundToDelete.name; 
            console.log(`Campground to be deleted: ${campToDel_name}`);   // will use this for the "Are you sure you want to delete" pop-up      
            // .remove() is deprecated. Use deleteOne,deleteMany, or bulkWrite instead.
            // Campground.remove({_id : foundCampground._id}, (err, result) => {
            Campground.deleteOne({_id : campgroundToDelete._id}, (err, result_camp) => {
                if(err) {
                    console.log(err);
                    console.log("campground could not be deleted");
                    res.redirect("/campgrounds");
                } else {
                    // delete all comments associated with this campground from DB
                    Comment.deleteMany({_id : {$in : campgroundToDelete.comments}}, (err, result_comment) => {
                        if(err) {
                            console.log("This Campground's comments could not be deleted");
                            console.log(err);
                            res.redirect("/campgrounds");   // redirect to the index page
                        } else {
                            console.log("Comments deletion info:");
                            console.log(result_comment);
                        }
                    });
                    // code reaches here if successfully deleted
                    console.log(`Campground successfully deleted: ${campToDel_name}, with all associated comments.`);            
                    console.log("Campgrrounds deletions info:");
                    console.log(result_camp);    // displays object with details on what was deleted
                    req.flash("success", `Campground successfully deleted: ${campToDel_name}, with all associated comments.`)
                    res.redirect("/campgrounds");   // redirect to the index page
                }
            });
        }
    });

    // another way - the old way?
    // Campground.findByIdAndRemove(req.params.id, (err) => {
    //     if(err) {
    //         console.log(err);
    //         res.redirect("/campgrounds");   // redirect to the index page
    //     } else {
    //         console.log(`Campground successfully deleted: ${camp_name}`);
    //         res.redirect("/campgrounds");   // redirect to the index page
    //     }

    // });
})


module.exports = router;