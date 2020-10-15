// =====================
// REVIEW ROUTES
// =====================

const express = require("express");
// since the review routes are nested routes: for example the review edit route will be:
// adventures/:id/reviews/:review_id/edit
// and we appended ** adventures/:id/reviews ** to all the review routes in this file in app.js, we need to merge the params from the adventure and the review together, so in the review routes, we can access ":id" --> req.params.id, which gets us the adventure id
// we also rename the review's id to review_id, to avoid :id and :id from conflicting in the req object
const router = express.Router({mergeParams : true});   

// import DB models needed
const Adventure = require("../models/adventure");
const Review = require("../models/review");
const User = require("../models/user");
// import middleware 
// if we require a directory, express automatically requires the content of index.js. So we don't need to write require("../middleware/index")
const middleware = require("../middleware");

// NEW REVIEW
// contains middleware to check for user authentication
router.get("/new", middleware.isLoggedIn, (req, res) => {
    // res.send("This will be the NEW REVIEW form")
    // const campID = req.params.id; 
    // lookup adventure using ID
    Adventure.findById(req.params.id, (err, foundAdventure) => {
        if(err) {
            console.log(err);
        } else {
            console.log(foundAdventure);
            // pass that adventure to the reviews/new template
            res.render("reviews/new", {adventure : foundAdventure})
        }
    })
    // res.render("reviews/new", {adventure : camp});
});

// CREATE REVIEW
// contains middleware to check for user authentication
router.post("/", middleware.isLoggedIn, (req, res) => {
    // 1. lookup adventure using ID
    Adventure.findById(req.params.id, (err, foundAdventure) => {
        if(err) {
            console.log(err);
            req.flash("error", "Adventure not found in the database");
            res.redirect("/adventures");
        } else {
            console.log("Adventure found: ");
            // console.log(foundAdventure);
            // 2. create new review
            Review.create(req.body.review, (err, newReview) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Review created:");
                    // console.log(newReview);

                    //  3. add username and id to the review - we know that user is logged in before we get here
                    newReview.author.username = req.user.username;
                    newReview.author.id = req.user._id;
                    // console.log(`******** ${req.user} *********`);

                    // and save review
                    newReview.save();
                    console.log(newReview);

                    // 4. associate review to adventure and save the adventure
                    foundAdventure.reviews.push(newReview);
                    foundAdventure.save((err, savedAdventure) => {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("adventure + review associated & saved:");
                            // console.log(savedAdventure);
                            req.flash("success", `Review Successfully Created.`)
                            // 4. redirect to adventure show route  
                            res.redirect(`/adventures/${savedAdventure._id}`);
                        }
                    }); // .save callback
                }
            }); // .create callback
        }
    })  // .findbyOne Callback
})

// REVIEW EDIT
// using async / await for this one
router.get("/:review_id/edit", middleware.checkReviewOwnership, async(req, res) => {
    // res.send(`EDIT ROUTE FOR REVIEW - ${req.params.review_id}`);
    try {
        // get the adventure, then find the review
        let foundAdventure = await Adventure.findById(req.params.id);
        // console.log(foundAdventure); for debug
        let foundReview = await Review.findById(req.params.review_id);
        console.log(`Editing Review: ${foundAdventure._id}`);
        // console.log(foundReview); for debug
        res.render("reviews/edit", {adventure : foundAdventure, review : foundReview});   // relative to the views directory
        
    } catch (error) {
        // catches error both in finding adventure and in finding review 
        req.flash("error", `Error finding Adventure/Review in database.`)
        console.log(error);
        res.redirect("back");
    }

});

// REVIEW UPDATE
router.put("/:review_id", middleware.checkReviewOwnership, async(req, res) => {
    const reviewId = req.params.review_id;
    const adventureId = req.params.id;
    try {
        // let updatedReview = await Review.findByIdAndUpdate(reviewId, req.body.review)
        await Review.findByIdAndUpdate(reviewId, req.body.review);
        console.log(`Review was updated: ${reviewId}`);
        req.flash("success", "Review was successfully updated");
        res.redirect(`/adventures/${adventureId}`);       // redirect to this adventure's show page
    } catch (error) {
        console.log(error);
        req.flash("error", `Error updating this review`);
        res.redirect("back");
    }
});

 // REVIEW DESTROY
 router.delete("/:review_id", middleware.checkReviewOwnership, async(req, res) => {
    const reviewId = req.params.review_id;
    const adventureId = req.params.id;
    console.log(`Review to be deleted: ${reviewId}`);
    
    try {
        await Review.findByIdAndDelete(reviewId);
        console.log(`Review deleted: ${reviewId}`);
        req.flash("success", "Review deleted successfully")
        res.redirect(`/adventures/${adventureId}`);       // redirect to adventures show page
    } catch (error) {
        console.log(error);
        req.flash("error", `Error deleting this review`);
        res.redirect("back");
    }
    
 });


// export these modules to be used by app.js
module.exports = router;