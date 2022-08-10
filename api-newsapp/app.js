require("dotenv").config();
require("./config/database").connect();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const express = require("express");
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*'
}));

app.use(express.json());

// importing user context
const User = require("./model/user");
const Post = require("./model/post");


////////////////// Register
// ...

app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { username, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && username)) {
        return res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        username,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      return res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  
  // ...
  

// //////////////////////Login
// ...

app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        return res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
    
        return res.status(200).json(user);
      }
      return res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  
  // ...

  app.post("/welcome", auth, (req, res) => {
    return res.status(200).send("Welcome 🙌 ");
  });


  app.get('/', async (req, res, next) => {

    try {
        let users = await User.find();
  
        if (users) {
            return res.status(200).json(users);
        }
  
        return res.status(404).json('users_not_found');
    } catch (error) {
        return res.status(501).json(error);
    }
  }),

  app.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        let user = await User.findById(id);

        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json('user_not_found');
    } catch (error) {
        return res.status(501).json(error);
    }
}),

app.patch('/update', async (req, res, next) => {
    const temp = {};

    ({ 
        username : temp.username,
        email    : temp.email,
        password : temp.password
    } = req.body);

    try {
        let user = await User.findOne({ email: temp.email });

        if (user) {       
            Object.keys(temp).forEach((key) => {
                if (!!temp[key]) {
                    user[key] = temp[key];
                }
            });
            
            await user.save();
            return res.status(201).json(user);
        }

        return res.status(404).json('user_not_found');
    } catch (error) {
        return res.status(501).json(error);
    }
}),

app.delete('/delete', async (req, res, next) => {
    const { id } = req.body;

    try {
        await User.deleteOne({ _id: id });

        return res.status(204).json('delete_ok');
    } catch (error) {
        return res.status(501).json(error);
    }
}),





// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//                    POSTS
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



app.put ('/posts', async (req, res, next) => {

try {

  const { title, img, description, comment } = req.body;

  const post = await Post.create({
   title,
   img,
   description,
   comment,
  });
  return res.status(201).json(post);
} catch (err) {
  console.log(err);
}

}),


app.get('/pub', async (req, res, next) => {

  try {
      let posts = await Post.find();

      if (posts) {
          return res.status(200).json(posts);
      }

      return res.status(404).json('posts_not_found');
  } catch (error) {
      return res.status(501).json(error);
  }
}),




module.exports = app