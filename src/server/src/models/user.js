const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    userScenes: {
        type: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Scene' }],
    }
});

UserSchema.statics.checkOnExist = function (userId, callback) {
    User.findOne({ userId: userId })
        .exec(function (err, user) {
            if (err){
                return callback(err)
            }
            if(user){
                return callback(null, user);
            }else{
                return callback(null, null);
            }
        });
};


const User = mongoose.model('User', UserSchema);
module.exports = User;