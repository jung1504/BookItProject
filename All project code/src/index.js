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
  email: undefined,
  password: undefined,
};

const APIBaseURL = 'https://gutendex.com/books/';

const selectedBook = {
  name: undefined,
  author: undefined,
  imageURL: undefined,
  id: undefined
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
  if (user.email === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/home");
  }
});

// Login GET route: '/home'
app.get('/home', (req,res) => {
  axios({
    url: `${APIBaseURL}`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
    },
  })
    .then(results => {
      // console.log(results.data.results); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
      res.render('pages/home', {
        books: results.data.results,
      });
    })
    .catch(error => {
      // Handle errors
    });
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
        message: "Incorrect email or password",
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
            message: "Incorrect email or password",
        });
    };
  };
});

app.get("/addReview", (req, res) => {
  res.render('pages/review')
});

// Login submission
app.post("/addReview", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const imageURL = req.body.imageURL;
  const author = req.body.author;

  selectedBook.id = id;
  selectedBook.name = name;
  selectedBook.imageURL = imageURL;
  selectedBook.author = author;

  console.log(selectedBook.id, selectedBook.name, selectedBook.imageURL, selectedBook.author);
  res.render('pages/review', {
    selectedBook: selectedBook
  });
});

app.post("/addReviewData", function(req,res) {
  const query = `INSERT INTO reviews (review, rating, isbn, email, title, author, upload_date) VALUES ($1, $2, $3, $4, $5, $6, '2023-04-19');`;
  db.any(query, [req.body.userReview, req.body.rating, req.body.isbn, req.body.email, req.body.title, req.body.author])
  
  .then(function(data) {
    res.render("pages/addedReview", {
      message: 'Review Added Successfully'
    });
  }) 
  .catch(function(error) {
    res.render("pages/addedReview", {
      message: 'Review Failed to Add'
    })
  });
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
  user.email = undefined;
  user.password = undefined;
  req.session.destroy();
  res.render("pages/login", {
    message: "Logged out successfully."
  });
});

// Render initial reviews page
app.get("/reviews", function(req, res) {
  // Defining query
  const query = `SELECT * FROM reviews;`;
  
  // Passing query and rendering page
  db.any(query)
    .then(function(data) {
      res.render("pages/reviews", {
        data
      });
    })
    .catch(function(error) {
      res.render("pages/reviews", {
        data: [],
        error: true,
        message: "Reviews render failed."
      })
    });
});

// Render review search
app.post("/reviews", function(req, res) {
  // Defining Search Variables
  var query = `SELECT * FROM reviews;`;
  var title = req.body.title;
  var author = req.body.author;
  var email = req.body.email;
  var rating = req.body.rating;

  // For Testing
  console.log("Search Filters:", req.body);
  
  // Using conditionals to specify search query
  // NO FILTERS
  if (title == '' && author == '' && email == '' && rating == '') {
    query = `SELECT * FROM reviews;`;
  }
  // ONE FILTER
  // Title
  else if (title != '' && author == '' && email == '' && rating == '') {
    query = `SELECT * FROM reviews WHERE title = $1;`;
  }
  // Author
  else if (title == '' && author != '' && email == '' && rating == '') {
    query = `SELECT * FROM reviews WHERE author = $2;`;
  }
  // Email
  else if (title == '' && author == '' && email != '' && rating == '') {
    query = `SELECT * FROM reviews WHERE email = $3;`;
  }
  // Rating
  else if (title == '' && author == '' && email == '' && rating != '') {
    query = `SELECT * FROM reviews WHERE rating = $4;`;
  }
  // TWO FILTERS
  // Title & Author
  else if (title != '' && author != '' && email == '' && rating == '') {
    query = `SELECT * FROM reviews WHERE title = $1 AND author = $2;`;
  }
  // Title & Email
  else if (title != '' && author == '' && email != '' && rating == '') {
    query = `SELECT * FROM reviews WHERE title = $1 AND email = $3;`;
  }
  // Title & Rating
  else if (title != '' && author == '' && email == '' && rating != '') {
    query = `SELECT * FROM reviews WHERE title = $1 AND rating = $4;`;
  }
  // Author & Email
  else if (title == '' && author != '' && email != '' && rating == '') {
    query = `SELECT * FROM reviews WHERE author = $2 AND email = $3;`;
  }
  // Author & Rating
  else if (title == '' && author != '' && email == '' && rating != '') {
    query = `SELECT * FROM reviews WHERE author = $2 AND rating = $4;`;
  }
  // Email & Rating
  else if (title == '' && author == '' && email != '' && rating != '') {
    query = `SELECT * FROM reviews WHERE email = $3 AND rating = $4;`;
  }
  // THREE FILTERS
  // No Rating
  else if (title != '' && author != '' && email != '' && rating == '') {
    query = `SELECT * FROM reviews WHERE title = $1 AND author = $2 AND email = $3;`;
  }
  // No Email
  else if (title != '' && author != '' && email == '' && rating != '') {
    query = `SELECT * FROM reviews WHERE title = $1 AND author = $2 AND rating = $4;`;
  }
  // No Author
  else if (title != '' && author == '' && email != '' && rating != '') {
    query = `SELECT * FROM reviews WHERE title = $1 AND email = $3 AND rating = $4;`;
  }
  // No Title
  else if (title == '' && author != '' && email != '' && rating != '') {
    query = `SELECT * FROM reviews WHERE author = $2 AND email = $3 AND rating = $4;`;
  }
  // ALL FILTERS
  else {
    query = `SELECT * FROM reviews WHERE title = $1 AND author = $2 AND email = $3 AND rating = $4;`;
  }

  // Passing query and rendering page
  db.any(query, [req.body.title, req.body.author, req.body.email, req.body.rating])
    .then(function(data) {
      res.render("pages/reviews", {
        data
      });
    })
    .catch(function(error) {
      res.render("pages/reviews", {
        data: [],
        error: true,
        message: "Reviews render failed."
      })
    });
});


app.get("/search", (req,res) => {
  res.render("pages/search");
})

// app.get("/addedReview", (req,res) => {
//   res.render("pages/addedReview");
// })

app.get(("/searchRes"), (req, res) => {
  const query = req.query.search;
  axios({
    url: `${APIBaseURL}?search=${query}`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
    },
  })
    .then(results => {
      //console.log(results.data.count);
      // console.log(results.data.results); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
      res.render('pages/search', {
        books: results.data,
      });
    })
    .catch(error => {
      // Handle errors
    });
});

app.get(("/changePage"), (req, res) => { //this api is for when there are multiple pages for some search result, it is called by the buttons at the bottom of the search page.
  const query = req.query.search;
  // console.log(query);
  // console.log(`${query[0]}&search=${query[1]}`);

  let urlForAxios;

  if (query[0].includes("https://gutendex.com/books/?page=")) {
    urlForAxios = `${query[0]}&search=${query[1]}`;
  } else {
    urlForAxios = query;
  }


  axios({
    url: `${urlForAxios}`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
    },
  })
    .then(results => {
      //console.log(results.data.count);
      // console.log(results.data.results); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
      res.render('pages/search', {
        books: results.data,
      });
    })
    .catch(error => {
      // Handle errors
    });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');