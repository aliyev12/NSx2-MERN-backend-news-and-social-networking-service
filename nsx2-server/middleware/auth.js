// This is an optional step, just to be on safe side, load all env variables
// you don't really need to do that but it is a good practice
require ('dotenv').load ();
const jwt = require ('jsonwebtoken');

/* JWT does not uses promises, so here I'm using an old callback pattern for async code */

/*=== AUTHENTICATION ===*/
// Make sure the user is logged in
// This funciton will be used as middledwhare that goes between request and handler to create message - so if you're not logged in, you cant create a message
exports.loginRequired = function (req, res, next) {
    // Generic error messages will be used for failed authentication
    const error = {
        status: 401, //status stands for "unauthorized"
        message:'Please log in first'
    };
  // Even though this is NOT an async await function, I'm still using...
  //...try catch block because there is a possibility that req.headers.authorization can be undefined...
  //...because someone can just modify headers (maliciously)
  try {
    // Get token from HTTP header (metadata about request)
    // Because the req.headers.authorization consists of Bearer some-token-blablabla...
    //...I'm splitting the string to withdraw the token only from it
    const token = req.headers.authorization;
    // Decode the token by passing the token and secret key to jwt.verify()
    jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedPayload) {
        // If we have successfully decoded the payload (doesn't matter whats in it) then we're done, go next()
        if(decodedPayload) {
            // Next means that user is logged in
            return next();
        } else {
            // Otherwise, something went wrong. The token was not able to be decoded
            // It could have been tampered with, or something else
            return next({...error})
        }
    })
  } catch (err) {
      return next({...error});
  }
};

/*=== AUTHORIZATION ===*/
// Make sure to get a correct user
exports.ensureCorrectUser = function(req, res, next) {
    const error = {
        status: 401,
        message: 'Unauthorized'
    };
   // Even though this is NOT an async await function, I'm still using...
  //...try catch block because there is a possibility that req.headers.authorization can be undefined...
  //...because someone can just modify headers (maliciously)
    try {
     // Get token from HTTP header (metadata about request)
    // Because the req.headers.authorization consists of Bearer some-token-blablabla...
    //...I'm splitting the string to withdraw the token only from it
    const token = req.headers.authorization.split(' ')[1];
     // Decode the token by passing the token and secret key to jwt.verify()
        jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedPayload) {
            // Check if there is a token AND inside of the token the ID in they payload is the same as the one that is coming from the url
            if(decodedPayload && decodedPayload.id === req.params.id) {
                // then I'm allowing the user to move on
                return next();
            } else {
                return next({...error});
            }
        });
    }
    catch(err) {
        return next({...error});
    }
}