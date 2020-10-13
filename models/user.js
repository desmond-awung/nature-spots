// Mongo DB model for user
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username : String,
    password : String
});

// register the Passport JS plugin to this schema, important for user auth
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);