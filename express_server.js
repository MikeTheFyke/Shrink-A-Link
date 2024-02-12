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
		email: "test@test.com",
		password: "test",
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

const findSelectedUserID = (id) => {
	for (let i in users) {
		if (users[i].id === id) {
			return users[i];
		}
	}
};

const findSelectedUserEmail = (email) => {
	for (id in users) {
		if (email === users[id].email) {
			return false;
		}
	}
	return true;
};

const validateLogin = (currentUser) => {
	for (let i in users) {
		if (users[i].email === currentUser.email) {
			if (users[i].password === currentUser.password) {
				return { validated: true, user: users[i], error: { code: undefined, message: undefined } };
			} else {
				return {
					validated: false,
					error: { code: 403, message: "Password entered is incorrect. Please try again or " },
				};
			}
		}
	}
	return {
		validated: false,
		error: { code: 403, message: "Email does not exist. Please try again or " },
	};
};

app.set("view engine", "ejs");
app.use(cookieParser());
// urlencoded converts the request body from a Buffer to a string,
// which will be avaialble to us in the req.body.
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Hello!");
});

app.get("/login", (req, res) => {
	const templateVars = {
		user: findSelectedUserID(req.cookies.user_id),
		error: { code: undefined, message: undefined },
	};
	res.render("login", templateVars);
});

app.post("/login", (req, res) => {
	const validatedUser = validateLogin(req.body);
	if (validatedUser.validated) {
		const templateVars = {
			urls: urlDatabase,
			user: validatedUser.user,
			error: validatedUser.error,
		};
		res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
		res.cookie("user_id", validatedUser.user.id, {
			expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
		});
		res.render("urls_index", templateVars);
	} else {
		const templateVars = {
			urls: urlDatabase,
			user: undefined,
			error: validatedUser.error,
		};
		res.status(403);
		res.render("login", templateVars);
	}
});

app.post("/logout", (req, res) => {
	res.clearCookie("user_id", req.cookies.user_id, {
		expires: new Date(Date.now() + 8 * 3600000),
	});
	res.redirect("login");
});

app.get("/register", (req, res) => {
	const templateVars = {
		user: findSelectedUserID(req.cookies.user_id),
		urls: urlDatabase,
		error: { code: undefined, message: undefined },
	};
	res.render("register", templateVars);
});

app.post("/register", (req, res) => {
	if (findSelectedUserEmail(req.body.email)) {
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
		const templateVars = {
			user: undefined,
			urls: urlDatabase,
			error: { code: 400, message: "Sorry this email already exists" },
		};
		res.render("register", templateVars);
	}
});

app.get("/urls", (req, res) => {
	if (!req.cookies.user_id) {
		res.redirect("login");
	}
	const templateVars = {
		user: findSelectedUserID(req.cookies.user_id),
		urls: urlDatabase,
		error: { code: undefined, message: undefined },
	};
	res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
	if (!req.cookies.user_id) {
		res.redirect("/login");
	}
	const templateVars = {
		user: findSelectedUserID(req.cookies.user_id),
	};
	res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
	const newId = generateRandomString();
	urlDatabase[newId] = formatURL(req.body.longURL);
	res.redirect(`urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
	if (!req.cookies.user_id) {
		res.redirect("/login");
	}
	const templateVars = {
		user: findSelectedUserID(req.cookies.user_id),
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
