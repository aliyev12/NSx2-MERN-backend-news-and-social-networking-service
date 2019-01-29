// Import mongoose.connect file
const db = require ('../models/index');
const jwt = require ('jsonwebtoken');

/*===============*/
/*=== SIGN IN ===*/
/*===============*/
exports.signin = async function (req, res, next) {
  // Create an error object that will be used twice within this function
  const error = {
    status: 400,
    message: 'Invalid Email and/or Password',
  };
  try {
    // Find a user based on provided email
    const user = await db.User.findOne ({
      email: req.body.email,
    });
    // Destructure the returned user object from database
    const {id, username, profileImageUrl} = user;
    // Run comparePassword method that is predefine inside models/user.js file
    const isMatch = await user.comparePassword (req.body.password);
    // If isMatch is true then password is matching, then...
    if (isMatch) {
      // ... create a jwt token and include in payload id, username, and profile img
      const token = jwt.sign (
        {
          id,
          username,
          profileImageUrl,
        },
        // As a second arameter provide the jwt secret key
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
      // Finally send the status 200 and put together a json with information returned...
      //... from mongo in user object (id, username, img) as well as the newly signed/created jwt token
      return res.status (200).json ({
        id,
        username,
        profileImageUrl,
        token,
      });
    } else {
      // If passwords do NOT match then put together an error message as follows
      return next ({...error});
    }
  } catch (err) {
    // If there are any other errors, they just return then passed to next so error handlers can handle those errors
    return next ({...error});
  }
};

/*===============*/
/*=== SIGN UP ===*/
/*===============*/
exports.signup = async function (req, res, next) {
  try {
    // Create a user using User model
    let user = await db.User.create (req.body);
    // Destructure (extract) user properties from a newly created user
    let {id, username, firstname, lastName, profileImageUrl} = user;
    // Create a token (signing a token)
    // Insert id, username and image of the newly created user - stuff just returned from database...
    //... into the payload section of the jwt. Also, as a second parameter pass on the secret key for jwt.
    let token = jwt.sign (
      {
        id: id,
        username: username,
        profileImageUrl,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    // If everything above goes well, we'll send a status 200...
    //... and some json with user info and newly created token back to user
    return res.status (200).json ({
      id,
      username,
      // firstName,
      // lastName,
      profileImageUrl,
      token,
    });
  } catch (err) {
    // See what kind of error
    // If a validation fails, for example with code 11000 (username taken), we're sending a custom messsage to user
    if (err.code === 11000) {
      err.message = 'Sorry, that username and/or email is taken';
    }
    // Otherwise just send back a  generic 400 with whatever message that comes from mongo/mongoose
    return next ({
      status: 400, // bad request status code
      message: err.message,
    });
  }
};
