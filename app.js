// Yelpcamp v5: - Adding a sidebar to the show template
//              - Style display of comments 

// to start a MongoDB service/daemon: $ brew services start mongodb-community@4.4
// to stop the service: $ brew services stop mongodb-community@4.4


// declare packages used - stylistic aligning
const   express     = require("express"),
        app         = express(),
        bodyParser  = require("body-parser"),
        flash       = require("connect-flash"),
        mongoose    = require("mongoose"),
        passport    = require("passport"),
        LocalStrategy = require("passport-local"),
        methodOverride = require("method-override"),
        seedDB      = require("./seeds")        // make sure the last one has no comma :)
 
// requiring routes
const campgroundRoutes  = require("./routes/campgrounds"),
      commentRoutes     = require("./routes/comments"),
      indexRoutes       = require("./routes/index")

// init mongoose for MongoDB
// should this be "mongodb://localhost:27017/yelp_camp" instead (as per mongoodes docs?)
mongoose.connect("mongodb://localhost/yelp_camp_v13", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to the Yelpcamp v13 DB"))
.catch(error => console.log(error.message));

// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

// import DB models
const User = require("./models/user");
const Campground = require("./models/campground");
const Comment = require("./models/comment");

// init express
app.set("view engine", "ejs");  // skip all .ejs file extensions in routes
// tell express to use the public/ directory, which will contain our front-end styling: css, js & bootstrap
// so all html <link> tags in the head will point to public/...
app.use(express.static(__dirname +  "/public"));    // just to be safe: dir name is absolute path, and will always point to this public dir  

// init body-parser  - for pssing objects b/w front-end and back-end 
app.use(bodyParser.urlencoded({extended : true}));

// method override : for PUT and DELETE HTTP requests
app.use(methodOverride("_method"));

// init connect-flash for flash messages - make sure this comes BEFORE the passport configuration
// if not we get the error: req.flash is not a function
app.use(flash());

// init node server
const port = 3000;

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret : "2020, despite the craziness so far, has been a blessing",
    resave : false,
    saveUninitialized : false,
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware called in every single route, to pass the user info to all templates
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    // if there is anything in req.flash, we will have access to it in any template under success_msg or error_msg 
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// import the routes to be used by the express app
app.use(indexRoutes);
// takes all the campgrounds routes and appends "/campgrounds" in front of them
app.use( "/campgrounds", campgroundRoutes);
// takes all the comment routes and appends "/campgrounds/:id/comments" in front of them.
/// because of the id param in the url, we need  **  router = express.Router({mergeParams : true});  ** in routes/comments.js
app.use("/campgrounds/:id/comments", commentRoutes);

// start server
app.listen(port, () => {
    console.log(`YelpCamp started at port: ${port}`);
})