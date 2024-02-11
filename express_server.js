const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

var cookieParser = require("cookie-parser");

const urlPrefix = "http://";
const extendedUrlPrefix = "https://";

let urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

let users = {
	userRandomID: {
		id: "userRandomID",
		email: "user@example.com",
		password: "purple-monkey-dinosaur",
	},
	user2RandomID: {
		id: "user2RandomID",
		email: "user2@example.com",
		password: "dishwasher-funk",
	},
};

const generateRandomString = () => {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
};

const formatURL = (url) => {
	if (url.includes(urlPrefix) || url.includes(extendedUrlPrefix)) {
		return url;
	} else {
		return urlPrefix.concat(url);
	}
};

const findSelectedUser = (id) => {
	for (let i in users) {
		if (users[i].id === id) {
			return users[i];
		}
	}
};

const verifyEmail = (email) => {
	for (id in users) {
		if (email === users[id].email) {
			return false;
		}
	}
	return true;
};

app.set("view engine", "ejs");
app.use(cookieParser());
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

app.get("/login", (req, res) => {
	const templateVars = {
		user: findSelectedUser(req.cookies.user_id),
		urls: urlDatabase,
	};
	res.render("login", templateVars);
});

app.post("/login", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
	res.cookie("username", req.body.username, {
		expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
	});
	res.redirect("urls");
});

app.post("/logout", (req, res) => {
	res.clearCookie("user_id", req.cookies.user_id, {
		expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
	});
	res.redirect("register");
});

app.get("/register", (req, res) => {
	const templateVars = {
		user: findSelectedUser(req.cookies.user_id),
		urls: urlDatabase,
	};
	res.render("register", templateVars);
});

app.post("/register", (req, res) => {
	if (req.body.email == "" || req.body.password == "") {
		res.status(400).send("No empty strings");
	} else if (verifyEmail(req.body.email)) {
		const userID = generateRandomString();
		users = {
			...users,
			user3RandomID: {
				id: userID,
				email: req.body.email,
				password: req.body.password,
			},
		};
		res.cookie("user_id", userID, {
			expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
		});
		res.redirect("urls");
	} else {
		res.status(400).send("Email already exists");
	}
});

app.get("/urls", (req, res) => {
	const templateVars = {
		user: findSelectedUser(req.cookies.user_id),
		urls: urlDatabase,
	};
	res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
	const templateVars = {
		user: findSelectedUser(req.cookies.user_id),
	};
	res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
	const newId = generateRandomString();
	urlDatabase[newId] = formatURL(req.body.longURL);
	res.redirect(`urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
	const templateVars = {
		user: findSelectedUser(req.cookies.user_id),
		id: req.params.id,
		longURL: urlDatabase[req.params.id],
	};
	res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
	urlDatabase[req.params.id] = formatURL(req.body.longURL);
	res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
