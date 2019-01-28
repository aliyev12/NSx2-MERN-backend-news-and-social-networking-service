const mongoose = require('mongoose');
const User = require('./user');

const messageSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxLength: 160
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Define a .pre hook that gets triggered right before deleting a message
// This hook needs to find a user that created that hook and delete the message id from users messages array
messageSchema.pre('remove', async function(next){
    try {
    // Find a user
    const user = await User.findById(this.userId)
    // Remove the id of the message from their messages list using mongoose's remove method which is synchronous jsut like splice
    user.message.remove(this.id);
    // Save that user with mongoose - this is async
    await user.save();
    return next()
    }
    catch(err) {
        return next(err);
    }
});

module.exports = mongoose.model('Message', messageSchema);