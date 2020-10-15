const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    content : String,
    // we store only the important User info in the review
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,  // just like associating reviews in the adventures model
            ref : "User"
        },
        // including username here; more efficient than having to look it up every time
        username : String,
    },
});

// export
module.exports = mongoose.model("Review", reviewSchema); 