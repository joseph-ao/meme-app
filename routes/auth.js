import express from 'express';
import userData from '../utils/userData.js';
import db from '../utils/database.js';

const router = express.Router();

router.get('/login', (req, res, next) => {
  res.render("login", {
    pageTitle: "login Page", //we add these variables so that we can make the ejs dynamic 
    errorMessage: null,
    isAuthenticated: req.session?.isLoggedIn === true, // <--- add this so EJS can know login state
  });
});

/*example on pageTitle and errorMessage:
Imagine you have an EJS file (login.ejs) that looks like this:
<h1><%= pageTitle %></h1>
<p><%= errorMessage %></p>
That’s like a template with blanks you can fill.*/

router.post('/login', (req, res, next) => {
  const { email, password } = req.body; //retreive the data from the form

  // ✅ Step 1: Simple validation
  if (!email || !password) {
    return res.status(400).render("login", {
      pageTitle: "Login Page",
      errorMessage: "Both fields are required",
      //isAuthenticated is true/false so EJS can show/hide nav items.
      isAuthenticated: req.session?.isLoggedIn === true,
    });
  }

  // ✅ Step 2: Check if the user exists in the database
  db.execute("SELECT * FROM users WHERE email = ? AND password = ?", [email, password])
    .then(([rows]) => {
      const user = rows[0]; // 🧠 get first user (if found)

      if (!user) {
        // ❌ Wrong credentials: re-render same login page with message
        return res.status(401).render("login", {
          pageTitle: "Login Page",
          errorMessage: "Invalid credentials",
          isAuthenticated: false,
        });
      }

      // ✅ Step 3: User exists —> Create session
      req.session.isLoggedIn = true;
      req.session.currentUser = user.email; // store email in session for display

      // 🧠 Save the session before redirecting
      req.session.save((err) => {
        if (err) console.error("Session save error:", err);
        res.redirect("/"); // redirect to homepage after successful login
      });
    })
    .catch((err) => {
      console.error("Login DB error:", err);
      res.status(500).render("login", {
        pageTitle: "Login Page",
        errorMessage: "Something went wrong",
        isAuthenticated: false,
      });
    });
});

// ✅ Step 4: Logout route — destroys session and redirects
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.redirect("/"); // go back to homepage
  });
});

export default router;
