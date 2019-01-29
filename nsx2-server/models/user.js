const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    firstName: String,
    lastName: String,
    profileImageUrl: String,
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
},
{
    // Setting timestamps to true will create created_at and updated_at timestamps for each user
    timestamps: true
});

// Create a hook before saving a password by putting them on .put method of the user schema
userSchema.pre('save', async function (next) {
    try {
        // Check if the password is not modified
        if (!this.isModified('password')) {
            // It it is not modified then keep going
            return next();
        }
        // Create a hash of the password using bcrypt and specify 10 characters of salt
        let hashedPassword = await bcrypt.hash(this.password, 10);
        // Reassign the current user password to be the hash of that same password combined with salt
        this.password = hashedPassword;
        return next();
    } catch(err) {
        return next(err);
    }
});

// Add a comparePassword async method to the User scheema
userSchema.methods.comparePassword = async function(candidatePassword, next) {
    try {
        // Use bcrypt's compare method to compare the password that gets passed on to this method to the password that is within User object already
        // isMatch variable will be true if passwords match and false if they dont
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        // Return the boolean representing passwords matching ot not
        return isMatch;
    } catch(err) {
        // If any any errors - pass them on to next middleware to be handled by error handlers
        return next(err);
    }
}


module.exports = mongoose.model('User', userSchema);