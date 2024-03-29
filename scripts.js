module.exports = {
	generateRandomString: function () {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < 6; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	},
	formatURL: function (url) {
		const urlPrefix = "http://";
		const extendedUrlPrefix = "https://";
		if (url.includes(urlPrefix) || url.includes(extendedUrlPrefix)) {
			return url;
		} else {
			return urlPrefix.concat(url);
		}
	},
	findSelectedUserID: function (id, users) {
		for (let i in users) {
			if (users[i].id === id) {
				return users[i];
			}
		}
	},
	findSelectedUserEmail: function (email, users) {
		for (id in users) {
			if (email === users[id].email) {
				return false;
			}
		}
		return true;
	},
	deleteAvatarSelectedUserID: function (id, users) {
		for (let i in users) {
			if (users[i].id === id) {
				return (users[i].avatar = undefined);
			}
		}
	},
	setAvatarSelectedUserID: function (id, users, avatar) {
		for (let i in users) {
			if (users[i].id === id) {
				return (users[i].avatar = avatar);
			}
		}
	},
	validateLogin: function (currentUser, users, dictionary) {
		for (let i in users) {
			if (users[i].userLogin === currentUser.email || users[i].userLogin === currentUser.username) {
				if (users[i].password === currentUser.password) {
					return { validated: true, user: users[i], error: { code: undefined, message: undefined } };
				} else {
					return {
						validated: false,
						error: { code: 403, message: dictionary.errorMessage.incorrectPassword },
					};
				}
			}
		}
		return {
			validated: false,
			error: { code: 403, message: dictionary.errorMessage.emailUsernameDoesNot },
		};
	},
};
