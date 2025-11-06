import express from "express";
import db from "../utils/database.js"; // ✅ import the SQL connection pool

const router = express.Router();

router.get("/", (req, res) => {
  // 🧠 Run an SQL query to get all memes from the database
  db.execute("SELECT * FROM memes ORDER BY id DESC")
    .then(([rows]) => {
      // ✅ 'rows' is now the array of memes fetched from MySQL

      res.render("memes", {
        //we pass two variables to the ejs file
        pageTitle: "Latest Memes", // the title of the page
        isAuthenticated: req.session?.isLoggedIn === true, // whether the user is logged in
        currentUser: req.session?.currentUser || null, // who the current user is
        memes: rows, // the array of memes which is now rows with SQL
      });
    })
    .catch((err) => {
      console.error("Error fetching memes:", err);

      // if something goes wrong, render the page with an empty list
      res.render("memes", {
        pageTitle: "Latest Memes",
        isAuthenticated: req.session?.isLoggedIn === true,
        currentUser: req.session?.currentUser || null,
        memes: [], // no memes if DB query fails
      });
    });
});

export default router;
