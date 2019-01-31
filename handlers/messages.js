const db = require('../models/index');

/*=== CREATE MESSAGE ===*/
// api/users/:id/messages
// creating a message requires goes back and forth to database 4 times
exports.createMessage = async function(req, res, next) {
    try {
        // Create a message using Message model (send create request to mongodb and receive the message object)
        let message = await db.Message.create({
            // Get message text from request body
            text: req.body.text,
            // Get user id from params
            user: req.params.id
        });
        // Find a specific user using id from params (send findById request to mongodb and receive foundUser in return)
        let foundUser = await db.User.findById(req.params.id);
        foundUser.messages.push(message.id);
        // (Send save() request to mongodb to save the foundUser with new messages property, and don't return anything)
        await foundUser.save();
        // Go back to the database to find the SAME message that you just created above but at this time...
        // Have all users be populated with usernames and img's instead of only references
        // Receive the message back and save it into foundMessage variable
        let foundMessage = await db.Message.findById(message._id).populate('user', {
            // Indicate which fields to populate by assigning those fields "true"
            username: true,
            profileImageUrl: true
        });
        // Respond to user with status 200 and the json object with all of the foundMessage
        // The foundMessage is expected to have text and user:{username, profileImageUrl}
        return res.status(200).json(foundMessage)
    }
    catch(err) {
        return(next);
    }
}

/*=== GET MESSAGE ===*/
exports.getMessage = async function(req, res, next) {
    try {
        // Find a message n database based on the message_id in the params
        let message = await db.Message.find(req.params.message_id);
        // Return the message received from database in json format
        return res.status(200).json(message);
    }
    catch(err) {
        // Bubble up the error to error handler
        return next(err);
    }
}

/*=== DELETE MESSAGE ===*/
exports.deleteMessage = async function(req, res, next) {
    try {
        // Find a message n database based on the message_id in the params
        /* 
        Because in the models/message.js file I'musing a pre remove hook, I'm not able to
        use the findByIdAndRemove() mongoose method because the 'remove' hook actually requires the 
        remove() method to be ran in order to be triggered.
        */
        let foundMessage = await db.Message.findById(req.params.message_id);
        // Remove message using .remove() from database
        await foundMessage.remove();
        // Return the message that was just deleted back to user in json format
        return res.status(200).json(foundMessage);
    }
    catch(err) {
        // Bubble up any errors to error handlers
        return next(err);
    }
}