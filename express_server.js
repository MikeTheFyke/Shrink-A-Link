const dictionary = require("./dictionary.js");
const tools = require("./scripts.js");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

var cookieParser = require("cookie-parser");

const actionTypes = [
	{ actionType: "Edit", class: "btn btn-info", label: dictionary.common.edit },
	{ actionType: "Delete", class: "btn btn-danger", label: dictionary.common.delete },
	{ actionType: "Logout", class: "btn btn-dark btn-sm", label: dictionary.common.logout },
];

let urlDatabase = {
	b2xVn2: "http://www.reddit.ca",
	"9sm5xK": "http://www.dogpile.com",
};

let users = {
	testUser: {
		id: "testUserID",
		username: "Testee",
		email: "test@test.com",
		password: "test",
	},
};

app.set("view engine", "ejs");

app.use(express.static("./"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.redirect("login");
});

app.get("/login", (req, res) => {
	const templateVars = {
		user: tools.findSelectedUserID(req.cookies.user_id, users),
		error: { code: undefined, message: undefined },
		dictionary: dictionary,
		actionTypes: actionTypes,
	};
	res.render("login", templateVars);
});

app.post("/login", (req, res) => {
	const validatedUser = tools.validateLogin(req.body, users, dictionary);
	if (validatedUser.validated) {
		res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
		res.cookie("user_id", validatedUser.user.id, {
			expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
		});
		res.redirect("urls");
	} else {
		const templateVars = {
			urls: urlDatabase,
			user: undefined,
			error: validatedUser.error,
			dictionary: dictionary,
			actionTypes: actionTypes,
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
		user: tools.findSelectedUserID(req.cookies.user_id, users),
		urls: urlDatabase,
		error: { code: undefined, message: undefined },
		dictionary: dictionary,
	};
	res.render("register", templateVars);
});

app.post("/register", (req, res) => {
	if (tools.findSelectedUserEmail(req.body.email, users)) {
		const userID = tools.generateRandomString();
		users = {
			...users,
			userID: {
				id: userID,
				username: req.body.username,
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
			error: { code: 400, message: dictionary.errorMessage.emailUsernameDoesAlready },
			dictionary: dictionary,
		};
		res.render("register", templateVars);
	}
});

app.get("/urls", (req, res) => {
	if (!req.cookies.user_id) {
		res.redirect("login");
	}
	const templateVars = {
		user: tools.findSelectedUserID(req.cookies.user_id, users),
		urls: urlDatabase,
		error: { code: undefined, message: undefined },
		dictionary: dictionary,
		actionTypes: actionTypes,
	};
	res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
	const newId = tools.generateRandomString();
	urlDatabase[newId] = tools.formatURL(req.body.longURL);
	res.redirect(`urls`);
});

app.get("/urls.json", (req, res) => {
	res.json(urlDatabase);
});

app.post("/urls/:id", (req, res) => {
	urlDatabase[req.params.id] = tools.formatURL(req.body.longURL);
	res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect("/urls");
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
