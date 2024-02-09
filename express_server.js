const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlPrefix = "http://";
const extendedUrlPrefix = "https://";

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

// app.get("/u/:id", (req, res) => {
// 	console.log("Req : ", req.body.id);
// 	res.redirect("https://" + urlDatabase[req.body.id]);
// });

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
	let newURL;
	if (req.body.longURL.includes(urlPrefix) || req.body.longURL.includes(extendedUrlPrefix)) {
		newURL = req.body.longURL;
	} else {
		newURL = urlPrefix.concat(req.body.longURL);
	}
	urlDatabase[newId] = newURL;
	res.redirect(`urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
	const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
	res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
