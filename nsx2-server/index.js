// Load all environment variables for use within any file of this application
require('dotenv').config();

// Import dependencies
const express = require('express'),
cors = require('cors'),
bodyParser = require('body-parser'),
errorHandler = require('./handlers/error'),
authRoutes = require('./routes/auth'),
messagesRoutes = require('./routes/messages')

const {loginRequired, ensureCorrectUser} = require('./middleware/auth');

// Configure app and enable any middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());

/*=== STANDARD ROUTES ===*/
// These below can be any generic server rendered routes handled immediately in this index.js file
// app.get('/', (req, res) => res.send('test homepage'));

// Get all the messages for anyone who is logged in
app.get('/api/messages', loginRequired, async function (req, res, next) {
    try {
        let messages = await db.Message
                        // Find all messages
                        .find()
                        // Sort all messages descending usign the timestamp variable createdAt that comes when you set timestamp to true within Schema
                        .sort({createdAt: 'desc'})
                        // Based on the user id that is stored inside found message, populate that user...
                        //... aka find that user with that id and get only his username and image url
                        .populate('user', {
                            username: true,
                            profileImageUrl: true
                        });
        // Send all the messages back to requestor of json api
        return res.status(200).json(messages);
    }
    catch(err) {
        return next(err);
    }
});



/*== PREFIXED ROUTES ==*/
// These are routes that are NOT handled here in this index.js file, nd instead they will be handeled in reparate files
// Below it is specified that if any routes start with watever is the first parameter...
//... to the app.use, we are automatically using all the router methods specifies in routes/auth.js file
app.use('/api/auth', authRoutes);
// To create a message, first I'm checking if used is logged in, and then i'm checking if this is the user that created the message
app.use('/api/users/:id/messages', loginRequired, ensureCorrectUser, messagesRoutes);



/*----------------------------------------------------------------*/

// If none of the routes match, then user hit a non-existing route.
// In this case, handle errors by setting status to 404
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(errorHandler);

/*=== LISTENING ===*/
app.listen(process.env.PORT, () => console.log(`Server is listening on port ${process.env.PORT}`))