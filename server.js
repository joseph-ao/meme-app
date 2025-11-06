import express from "express"; // for app
import bodyParser from "body-parser"; // reads form data
import path from "path";
import cors from "cors";// cross origin header setup
import session from "express-session"; // session management
import MySQLConnect from "express-mysql-session";// sql session 
import { fileURLToPath } from "url"; //transforms file path to url

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import memesRoutes from "./routes/memes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express(); //create the app





//------------------------------------------------------------------------------//
//-----------------------------------SQL AND SESSION----------------------------//
//------------------------------------------------------------------------------//
// 🧩 MySQL connection details (for sessions only)
const options = {
  host: "localhost",    // where your MySQL server runs
  port: 3306,           // default MySQL port
  user: "root",         // your MySQL username
  password: "password", // your MySQL password
  database: "meme_app", // database where the sessions table will be created
};
// 🧩 Link express-session to the MySQL store system
const MySQLStore = MySQLConnect(session); // creates a store class compatible with express-session
// 🧩 Create one live store instance using your connection info
const sessionStore = new MySQLStore(options); // this will automatically create a 'sessions' table

// 🧩 Register session middleware globally
app.use(
  session({
    secret: "meme-secret-key",   // used to sign and verify cookies (for security)
    resave: false,               // don’t re-save session if nothing changed
    saveUninitialized: false,    // don’t create a session until we store data inside it
    name: "session_id",          // cookie name in browser (instead of default connect.sid)
    store: sessionStore,         // tells Express to store sessions in MySQL instead of memory
  })
);
// 🧩 Just confirm that our MySQL store is working fine
sessionStore
  .onReady()
  .then(() => console.log("✅ MySQLStore ready"))
  .catch((err) => console.error("❌ MySQLStore error:", err));
//------------------------------------------------------------------------------//
//--------------------------------------------------------------------//
//------------------------------------------------------------------------------//




//used to use ejs
app.set("view engine", "ejs");
app.set("views", "views");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 🧩 Middleware to make session info available to all EJS files
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session?.isLoggedIn === true;
  res.locals.currentUser = req.session?.currentUser || null;
  next();
});

//add the routes used 
app.use("/auth", authRoutes); //login
app.use("/user", userRoutes); //share meme
app.use("/", memesRoutes); //home page

// the error page
app.use((req, res) => {
  res.status(404).render("404", {
    pageTitle: "404 - Page Not Found",
  });
});

app.listen(8000, "localhost", () => {
  console.log("✅ Server running on http://localhost:8000");
});
