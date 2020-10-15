const mongoose = require("mongoose");

// setup mongoose adventure schema
const adventureSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price : String,
    // add association to User model - reference a particular user's object ID
    author : {
        id : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String,
    },

    // add object ID references to the reviews for this adventure
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review"     // name of the model
        }
    ]
});
// compiles the schema into mongoose model
module.exports = mongoose.model("Adventure", adventureSchema);