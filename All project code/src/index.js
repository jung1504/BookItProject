// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const user = {
  username: undefined,
  password: undefined,
};

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

// First route: '/' 
app.get('/', (req, res) => {
    res.redirect("/login");
});

// Login GET route: '/home'
app.get('/home', (req,res) => {
  res.render("pages/home");
});

// Register GET route: '/register'
app.get('/register', (req,res) => {
    res.render("pages/register");
});

// Register POST
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  const query = `INSERT INTO users (email, password) VALUES ($1, $2);`;
  await db.any(query, [
      req.body.email,
      hash,
  ])
  .then(function (data) {
      res.redirect('login')
  })
  .catch(function (err) {
    res.render('pages/login', {
      error: true,
      message: "Error registering user",
    });
  });
});

// Login GET route: '/login'
app.get('/login', (req,res) => {
    res.render("pages/login");
});


// Login submission
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const query = 'SELECT * FROM users WHERE email = $1;'; 
  const values = [email];

  // get the student_id based on the emailid
  await db.one(query, values)
    .then((data) => {
      user.email = data.email;
      user.password = data.password
    })
    .catch((err) => {
      console.log(err);
      res.render('pages/login', {
        error: true,
        message: "Incorrect username or password",
      });
    });
  // check if password from request matches with password in DB
  if (user.password) {
    const match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
        req.session.user = user;
        req.session.save();
        res.redirect('home');
    } else {
        res.render('pages/login', {
            error: true,
            message: "Incorrect username or password",
        });
    };
  };
});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);


app.get("/logout", (req, res) => {
  user.username = undefined;
  user.password = undefined;
  req.session.destroy();
  res.render("pages/login", {
    message: "Logged out successfully."
  });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');