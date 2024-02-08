const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlPrefix = "http://";

let urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

const generateRandomString = () => {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
};

app.set("view engine", "ejs");

// urlencoded converts the request body from a Buffer to a string,
// which will be avaialble to us in the req.body.
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Hello!");
});

app.get("/urls", (req, res) => {
	const templateVars = { urls: urlDatabase };
	res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
	res.render("urls_new");
});

app.post("/urls", (req, res) => {
	const newId = generateRandomString();
	const newURL = urlPrefix.concat(req.body.longURL);
	urlDatabase[newId] = newURL;
	res.redirect(`urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
	const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
	res.render("urls_show", templateVars);
});

// app.get("/hello", (req, res) => {
// 	res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
