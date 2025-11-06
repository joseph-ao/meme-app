import mysql2 from "mysql2";

const pool = mysql2
  .createPool({
    host: "localhost",
    user: "root",
    password: "password",
    database: "meme_app",
  })
  .promise();

export default pool;
