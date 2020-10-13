// =====================
// COMMENT ROUTES
// =====================

const express = require("express");
// since the comment routes are nested routes: for example the comment edit route will be:
// adventures/:id/comments/:comment_id/edit
// and we appended ** adventures/:id/comments ** to all the comment routes in this file in app.js, we need to merge the params from the adventure and the comment together, so in the comment routes, we can access ":id" --> req.params.id, which gets us the adventure id
// we also rename the comment's id to comment_id, to avoid :id and :id from conflicting in the req object
const router = express.Router({mergeParams : true});   

// import DB models needed
const Adventure = require("../models/adventures");
const Comment = require("../models/comment");
const User = require("../models/user");
// import middleware 
// if we require a directory, express automatically requires the content of index.js. So we don't need to write require("../middleware/index")
const middleware = require("../middleware");

// NEW COMMENT
// contains middleware to check for user authentication
router.get("/new", middleware.isLoggedIn, (req, res) => {
    // res.send("This will be the NEW COMMENT form")
    // const campID = req.params.id; 
    // lookup adventure using ID
    Adventure.findById(req.params.id, (err, foundAdventure) => {
        if(err) {
            console.log(err);
        } else {
            console.log(foundAdventure);
            // pass that adventure to the comments/new template
            res.render("comments/new", {adventure : foundAdventure})
        }
    })
    // res.render("comments/new", {adventure : camp});
});

// CREATE COMMENT
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
            // 2. create new comment
            Comment.create(req.body.comment, (err, newComment) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Comment created:");
                    // console.log(newComment);

                    //  3. add username and id to the comment - we know that user is logged in before we get here
                    newComment.author.username = req.user.username;
                    newComment.author.id = req.user._id;
                    // console.log(`******** ${req.user} *********`);

                    // and save comment
                    newComment.save();
                    console.log(newComment);

                    // 4. associate comment to adventure and save the adventure
                    foundAdventure.comments.push(newComment);
                    foundAdventure.save((err, savedAdventure) => {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("adventure + comment associated & saved:");
                            // console.log(savedAdventure);
                            req.flash("success", `Comment Successfully Created.`)
                            // 4. redirect to adventure show route  
                            res.redirect(`/adventures/${savedAdventure._id}`);
                        }
                    }); // .save callback
                }
            }); // .create callback
        }
    })  // .findbyOne Callback
})

// COMMENT EDIT
// using async / await for this one
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async(req, res) => {
    // res.send(`EDIT ROUTE FOR COMMENT - ${req.params.comment_id}`);
    try {
        // get the adventure, then find the comment
        let foundAdventure = await Adventure.findById(req.params.id);
        // console.log(foundAdventure); for debug
        let foundComment = await Comment.findById(req.params.comment_id);
        console.log(`Editing Comment: ${foundAdventure._id}`);
        // console.log(foundComment); for debug
        res.render("comments/edit", {adventure : foundAdventure, comment : foundComment});   // relative to the views directory
        
    } catch (error) {
        // catches error both in finding adventure and in finding comment 
        req.flash("error", `Error finding Adventure/Commentin database.`)
        console.log(error);
        res.redirect("back");
    }

});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, async(req, res) => {
    const commentId = req.params.comment_id;
    const adventureId = req.params.id;
    try {
        // let updatedComment = await Comment.findByIdAndUpdate(commentId, req.body.comment)
        await Comment.findByIdAndUpdate(commentId, req.body.comment);
        console.log(`Comment was updated: ${commentId}`);
        req.flash("success", "Comment was successfully updated");
        res.redirect(`/adventures/${adventureId}`);       // redirect to this adventure's show page
    } catch (error) {
        console.log(error);
        req.flash("error", `Error updating this comment`);
        res.redirect("back");
    }
});

 // COMMENT DESTROY
 router.delete("/:comment_id", middleware.checkCommentOwnership, async(req, res) => {
    const commentId = req.params.comment_id;
    const adventureId = req.params.id;
    console.log(`Comment to be deleted: ${commentId}`);
    
    try {
        await Comment.findByIdAndDelete(commentId);
        console.log(`Comment deleted: ${commentId}`);
        req.flash("success", "Comment deleted successfully")
        res.redirect(`/adventures/${adventureId}`);       // redirect to adventures show page
    } catch (error) {
        console.log(error);
        req.flash("error", `Error deleting this comment`);
        res.redirect("back");
    }
    
 });


// export these modules to be used by app.js
module.exports = router;