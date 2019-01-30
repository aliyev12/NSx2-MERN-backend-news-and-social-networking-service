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
/*
Example httpie request to create a message:
http POST localhost:3001/api/users/5c51065f3270a348d327008d/messages "Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjNTEwYzFjYjE0M2FhMmQyNjI0NjU0ZiIsInVzZXJuYW1lIjoicG9vcCIsImlhdCI6MTU0ODgxNTM4OCwiZXhwIjoxNTQ4ODE4OTg4fQ.kasZhJzvk4o3PvfKP451wjc6jEws3x5UrUVaDpQ9W_U" text=miao

In order to create a message, you need to provide the following information:
method: POST,
route: some_domain_and_port/api/users/some_user_id/messages,
then most importanly, we need to pass on a headers in the following format:
Authorization:Bearer some_token
It is VERY important to specify that it is the header called "Authorization",
and it is equally important to have that space between word "Bearer" and the three-part token.
Inside the middleware/auth.js file, the loginRequired method splits the entire header by a space,
and uses the array element with index 1 (the second element) as token.
Later, in order to authorize a user to post a message, we have a users's id in the params.
The code takes that param that can easily be tampered (a hacker can somehow still that id),
and then jwt.verify decodes the entire token payload and using the secret key checks to see
if the id can passed on that was in params CAN actually be decoded. If not, then it is obvious that someone
is just trying to create a message on someone else's behalh by passing that someone else's id into the request.
So, in this case, token is very sensitive while user id from params is not so much. But the most sensitive information is the
secret key for that token. If a hacker stills that key, he can decode the token easily.
*/
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