// all the middleware for our app goes here

const Campground = require("../models/campground");
const Comment = require("../models/comment");

let middlewareObj = {};

// middleware to check for authorization for campgrounds edit, update and destroy routes
// make sure user can only edit/delete campgrounds that they created.
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    /// is user logged in?
    if(req.isAuthenticated()) {
        console.log("User logged in successfully");
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err) {
                console.log(err);
                req.flash("error", "Campground not found in the database");
                res.redirect("back");
            } else {
                // console.log(foundCampground);
                /// does user own campground
                /*
                    Even though both req.user._id and foundCampground.author.id appear to be the same when displayed on the console, they are not. 
                    Both are of type object, but do not equal each other.
                    Hence we cannot compare them using === or ==. That is, the following does not work - it will never evaluate to true 
                    if(req.user._id == foundCampground.author.id) { 
                    We have to use the .equals() method from mongoose:
                    if(foundCampground.author.id.equals(req.user._id)) { 
                        make sure the document found is on the left hand side, and req.user._id is on the right
                */
                // console.log(req.user._id, typeof(req.user._id));  debug
                // console.log(foundCampground.author.id, typeof(foundCampground.author.id));   debug

                if(foundCampground.author.id.equals(req.user._id)) { 
                    console.log("User is Authorized to do this action.");
                    // pass the foundCampground to next() using req - similar to how bodyParser attaches body property to request object 
                    // Thanks to Farid's answer: https://stackoverflow.com/a/23965964/12008034
                    // make sure no other library uses this property - foundCampground - so there's no conflicts within the objects in req
                    req.foundCampground = foundCampground;
                    next();
                } else {
                    console.log("AUTHORIZATION ERROR");
                    console.log(`You - ${req.user.username} -  do not have permissions to edit/delete since you don't own the campground. Campground is owned by ${foundCampground.author.username}`);
                    req.flash("error", "Authorization Error. You don't have permission to do that.");
                    res.redirect("back");
                }
            }  // end else findById no error
        }); // end of .findbyId callback
    } else {
        // user is not logged in
        // if user is not authenticated, don't allow access and redirect to the login page
        console.log("LOGIN FIRST - You need to be logged in to perform that action.");
        // do it before you redirect - it shows up on the page you redirect to
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");   // take the user back to previous page they were on
    }
}   // end of checkCampgroundOwnership

// middleware to check for authorization for comment edit, update and destroy routes
// make sure user can only edit/delete comments that they created.
middlewareObj.checkCommentOwnership = async function(req, res, next) {
    if(req.isAuthenticated()) {
        try {
            let foundComment = await Comment.findById(req.params.comment_id);
            if(foundComment.author.id.equals(req.user._id)) {
                console.log("User is Authorized to do this action.");
                next();
            } else {
                console.log("AUTHORIZATION ERROR");
                console.log(`You - ${req.user.username} -  do not have permissions to edit/delete since you don't own this comment. Comment is owned by ${foundComment.author.username}`);
                req.flash("error", "Authorization Error. You don't have permission to do that.");
                res.redirect("back");
            }

        } catch (error) {
            // error from promise reject - findById error - DB error. We'll hardly ever see this if server is up and running
            req.flash("error", "Comment not found in the database");
            console.log(error);
            res.redirect("back");   // take the user back to previous page they were on
        }

    } else {
        // user is not logged in
        // if user is not authenticated, don't allow access and redirect to the login page
        console.log("LOGIN FIRST - You need to be logged in to perform that action.");
        // do it before you redirect - it shows up on the page you redirect to
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back");   // take the user back to previous page they were on
    }
}   // end of checkCommentOwnership

// middleware to implement authentication - checks if a user is logged in
middlewareObj.isLoggedIn = function(req, res, next) {
    
    if(req.isAuthenticated()){
        console.log("User is authenticated, and good to go");
        return next();  
    }
    // if user is not authenticated, don't allow access and redirect to the login page
    console.log("LOGIN FIRST - You need to be logged in to perform that action.");
    // do it before you redirect - it shows up on the page you redirect to
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/login");

}  // end of isLoggedIn

module.exports = middlewareObj;
