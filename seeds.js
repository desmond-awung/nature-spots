const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment = require("./models/comment");

const allCamps = [
    { 
        name : "Cloud's Rest", 
        image : "https://images.unsplash.com/photo-1573111651692-39ec7f38fec9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo cumque animi aspernatur eligendi quia aperiam ducimus tempora corporis alias perferendis excepturi quisquam, dolor eos commodi dolore exercitationem eveniet amet autem porro veritatis est? Vel libero voluptatum labore deserunt iste dolorem. Aperiam, quaerat aliquid? Commodi, in assumenda unde corrupti laborum temporibus ducimus perspiciatis, soluta, amet ad maiores porro praesentium. Cumque, ratione eos! Aperiam velit sequi impedit! Magni voluptate adipisci laboriosam vitae veniam! Repudiandae nobis harum maxime aspernatur! Sit, perferendis reiciendis? Est."
    },
    
    { 
        name : "Great Austin Woods", 
        image : "https://images.unsplash.com/photo-1537565266759-34bbc16be345?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description : "the Austin woods Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur voluptatibus debitis quos at nostrum facere neque vitae in maxime nulla ex enim, asperiores laborum velit autem ut omnis et minus cum hic culpa beatae sint excepturi quidem. Quas incidunt et nam officia delectus minima molestias, exercitationem debitis fugiat quia veritatis nemo quibusdam eum est quod qui itaque explicabo dolorum at sit odio? Exercitationem optio ipsum error dignissimos quae ea illum nobis libero!!"
    },
    { 
        name : "Hill Country Mountains", 
        image : "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
        description : "Country Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo quisquam delectus nesciunt ratione, sed saepe commodi quaerat provident quas mollitia nulla odit itaque maxime dicta excepturi illum. Amet ipsum similique qui molestiae eos, delectus voluptas voluptates obcaecati excepturi quae ipsa dicta voluptatum! Laudantium debitis minima aliquam consectetur amet nulla hic consequuntur ipsa cum cumque delectus numquam dolores, eum molestiae, assumenda mollitia asperiores fugit! Labore at error nobis molestias laudantium rerum nostrum hic ipsam est beatae. Quaerat asperiores exercitationem ipsam vel dolore itaque, ullam saepe explicabo? Velit, commodi numquam nam illo iusto suscipit hic vitae ipsum quisquam dolor optio minima."
    },
    {
        name : "Sunny Hills",
        image : "https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description : "Where the sun touches the hills casting rays of beauty on the Calming Brook of Broken Arrow Oklahoma"
    }

]

function seedDB() {
    // remove every document from the campgrounds and comments collections:
    // remove all comments
    Comment.remove((err) => {
        if(err) {
            console.log(err);
        } else {
            console.log("removed all comments");
        }
    });

    // remove all campgrounds
    Campground.remove((err) => {
        if(err) {
            console.log(err);
        } else {
            // do this only in case of no error above
            console.log("removed all campgrounds!");
            console.log("******************");
            // add a few campgrounds + comments
            addCamgrounds();
        }
    })
}

// add a few campgrounds
function addCamgrounds() {
    allCamps.forEach ((seed) => {
        Campground.create(seed, function(err, campground){
            if(err) {
                console.log(err);
            } else {
                // console.log(`added a campground: ${campground.name}`);
                console.log(`added a campground`);
                // create comments only when the campground is successfully created
                addComments(campground); 
            }
        })
    })
}

// add a comment
function addComments(campground) {
    Comment.create(
        {
            content : "Most wild connection with nature, this place is definitely worth a second visit. Fresh breeze, cool winds, dancing river, singing hills, soothing sunsets what more can you ask for?",
            author : "Rainbow Sparks",
        }, (err, comment) => {
            if(err) {
                console.log(err);
            } else {
                console.log(`Comment Created`);
                // associate this _comment_ to this _campground_
                campground.comments.push(comment);
                campground.save((err, camp) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log("******************");
                        console.log(`campground + comment saved:`);
                        // console.log(camp);
                    }
                })
            }
        })
}



module.exports = seedDB;    // send the function name, don't run the function here, so no ()