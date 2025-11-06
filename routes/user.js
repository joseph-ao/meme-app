import express from "express";
import db from "../utils/database.js";
import userData from "../utils/userData.js"; // still fine to keep for now but no longer used directly

const router = express.Router();
//only temporary to store memes because we wont use sql now
const memes = [];

// basic get before the POST because users first need to GET the page which is only GETtable by 
// having the right credentials,, and then they can POST to the page
router.get("/share-meme", (req, res) => {
  // ✅ We now use sessions instead of userData
  if (!req.session.isLoggedIn) {
    console.log("❌ User not logged in, redirecting...");
    return res.redirect("/auth/login");
  }

  res.render("share-meme", {
    pageTitle: "Share a Meme",
    errorMessage: null,
    isAuthenticated: req.session?.isLoggedIn === true, // <--- add this
    currentUser: req.session?.currentUser || null,
  });
});

router.post("/share-meme", (req, res) => {
  //first we get the data from the form
  const { author, title, caption, imageUrl } = req.body;

  if (!author || !title || !imageUrl) {
    return res.status(400).render("share-meme", {
      pageTitle: "Share a Meme",
      errorMessage: "All fields except caption are required!",
      isAuthenticated: req.session?.isLoggedIn === true,
      currentUser: req.session?.currentUser || null,
    });
  }
db.execute(
    "INSERT INTO memes (author, title, caption, imageUrl) VALUES (?, ?, ?, ?)",
    [author, title, caption, imageUrl]
  )
    .then(() => {
      console.log("✅ Meme added:", title);
      res.redirect("/"); // reload homepage (now fetched from DB)
    })
    .catch((err) => {
      console.error("Error adding meme:", err);
      res.status(500).render("share-meme", {
        pageTitle: "Share a Meme",
        errorMessage: "Database error while saving meme.",
        isAuthenticated: req.session?.isLoggedIn === true,
        currentUser: req.session?.currentUser || null,
      });
    });
      res.redirect("/");
});
  // add the meme to the array
 // memes.push({ author, title, caption, imageUrl });
//  console.log("✅ Meme added:", title);



export default router;
export { memes };
