import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import Post from "./models/postSchema.js";
import path from "path";
const __dirname = path.resolve();
import { homepageHandler, getPosts } from './contollers/homepage.js';

const app = express();

mongoose.connect(process.env.DB_ACCESS_LINK);

mongoose.connection.on("error", (e) => {
  console.log(e.message);
});
mongoose.connection.once("open", () => {
  console.log("connected to db");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));

const port = 4000;

app.get("/", homepageHandler);

app.get('/get_posts', getPosts)

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
