const { db } = require('../database/db');

const table = 'users-test';

class UserController {
	async create(req, res) {
		const { email, password, salt } = req.body.user;
		const newUser = await db.query(
			`INSERT into "${table}" (email, username, password, salt) values ($1, $1, $2, $3) RETURNING *`,
			[email, password, salt]
		);

		res.json(newUser.rows[0]);
	}
    
	async createFromObject(user) {
        const isSocial = user.social != null
        if (!isSocial) {
            const { email, password, salt } = user;
            return db.query(
                `INSERT into "${table}" (email, username, password, salt) values ($1, $1, $2, $3) RETURNING *`,
                [email, password, salt]).then(res => res.rows[0]);
        }
        else {
            const { email, photo, username, socialId, social } = user
            console.log('save social profile', user);
            return db.query(
                `INSERT into "${table}" (email, username, photo, social_type, social_id) values ($1, $1, $2, $3, $4) RETURNING id, email, photo, username, role`,
                [email, photo, social, socialId]).then(res => res.rows[0]);
        }
	}

	async createWithPromise(payload) {
		const { email, password, salt } = payload;
		return db
			.query(
				`INSERT into "${table}" (email, username, password, salt) values ($1, $1, $2, $3) RETURNING *`,
				[email, password, salt]
			)
			.then((newUser) => newUser.rows[0]);
	}

	async getById(req, res) {
		const { id } = req.params;
		const { rows } = await db.query(`SELECT id, username, photo, email, role FROM "${table}" where id = $1`, [id]);
		res.status(200).json({
            data: rows[0]
        });
	}

	async findByEmail(email) {
        return db
            .query(`SELECT * FROM "${table}" where email = $1`, [email])
            .then((res) => res.rows[0]);
	}

	async getAll(req, res) {
		const users = await db.query(`SELECT * FROM ${table}`);
		res.json(users.rows);
	}

	async update(req, res) {
		const { id, name, surname } = req.body;
		const user = await db.query(
			`UPDATE ${table} set name = $1, surname = $2 where id = $3 returning *`,
			[name, surname, id]
		);
		res.json(user.rows[0]);
	}

	async delete(req, res) {
		const { id } = req.params;
		const users = await db.query(`DELETE FROM ${table} where id = $1`, [id]);
		res.json(users.rows);
	}
}

const controller = new UserController();

module.exports = controller;
