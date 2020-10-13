const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    content : String,
    // we store only the important User info in the comment
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,  // just like associating comments in the campgrounds model
            ref : "User"
        },
        // including username here; more efficient than having to look it up every time
        username : String,
    },
});

// export
module.exports = mongoose.model("Comment", commentSchema); 