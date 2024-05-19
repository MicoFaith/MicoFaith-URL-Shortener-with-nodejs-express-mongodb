const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shorturl");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
    try {
        const shortUrls = await ShortUrl.find();
        res.render("index", { shortUrls: shortUrls });
    } catch (error) {
        console.error("Error retrieving short URLs:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/shorturls", async (req, res) => {
    try {
        await ShortUrl.create({ full: req.body.fullUrl });
        res.redirect("/");
    } catch (error) {
        console.error("Error creating short URL:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/:shortUrl", async (req, res) => {
    try {
        const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
        if (shortUrl == null) return res.sendStatus(404);
        shortUrl.clicks++;
        await shortUrl.save();
        res.redirect(shortUrl.full);
    } catch (error) {
        console.error("Error redirecting:", error);
        res.status(500).send("Internal Server Error");
    }
});

mongoose.connect("mongodb://localhost/urlShortener", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
        console.log("Server started on port 5000");
    });
});

mongoose.connection.on("error", (err) => {
    console.error("Failed to connect to MongoDB:", err);
});
