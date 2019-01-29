const express = require('express');
// Init router and pass mergeParams option as true to merge all the params in the app
const router = express.Router({ mergeParams: true });

const { createMessage } = require('../handlers/messages');

/* 
Instead of just passing router, we will be using .route 
we wanna make sure that all our routes start with just a slash.
We'll prefix all these routes with /api/users/:id/messages
It's possible because we are setting mergeParams: true up in the router...
*/
router.route('/').post(createMessage);

module.exports = router;