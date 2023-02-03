// const db = require('../database/db.js');

// const table = 'users-test';

// class UserController {
// 	async createUser(req, res) {
// 		const { name, surname } = req.body;
// 		const newUser = await db.query(
// 			`INSERT into ${table} (name, surname) values ($1, $2) RETURNING *`,
// 			[name, surname]
// 		);

// 		res.json(newUser.rows[0]);
// 	}

// 	async getUser(req, res) {
// 		const { id } = req.params;
// 		const users = await db.query(`SELECT * FROM ${table} where id = $1`, [id]);
// 		res.json(users.rows);
// 	}

// 	async getUsers(req, res) {
// 		const users = await db.query(`SELECT * FROM ${table}`);
// 		res.json(users.rows);
// 	}

// 	async updateUser(req, res) {
// 		const { id, name, surname } = req.body;
// 		const user = await db.query(
// 			`UPDATE ${table} set name = $1, surname = $2 where id = $3 returning *`,
// 			[name, surname, id]
// 		);
// 		res.json(user.rows[0]);
// 	}

// 	async deleteUser(req, res) {
// 		const { id } = req.params;
// 		const users = await db.query(`DELETE FROM ${table} where id = $1`, [id]);
// 		res.json(users.rows);
// 	}
// }

// module.exports = { UserController: new UserController() };
