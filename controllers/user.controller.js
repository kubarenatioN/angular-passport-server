const { db } = require('../database/db.js');

const table = 'users-test'

class UserController {

    async create(req, res) {
        const { email, password, salt } = req.body.user;
        const newUser = await db.query(`INSERT into "${table}" (email, username, password, salt) values ($1, $1, $2, $3) RETURNING *`, [email, password, salt])

        res.json(newUser.rows[0])
    }

    async createWithPromise(payload) {
        const { email, password, salt } = payload;
        return db.query(`INSERT into "${table}" (email, username, password, salt) values ($1, $1, $2, $3) RETURNING *`, [email, password, salt])
            .then(newUser => newUser.rows[0])
    }

    async get(req, res) {
        const { id } = req.params
        const users = await db.query(`SELECT * FROM ${table} where id = $1`, [id])
        res.json(users.rows)
    }

    async findByEmail(email) {
        return db.query(`SELECT * FROM "${table}" where email = $1`, [email]).then(res => res.rows[0])
    }

    async getAll(req, res) {
        const users = await db.query(`SELECT * FROM ${table}`)
        res.json(users.rows)
    }

    async update(req, res) {
        const { id, name, surname } = req.body
        const user = await db.query(`UPDATE ${table} set name = $1, surname = $2 where id = $3 returning *`, [name, surname, id])
        res.json(user.rows[0])
    }

    async delete(req, res) {
        const { id } = req.params
        const users = await db.query(`DELETE FROM ${table} where id = $1`, [id])
        res.json(users.rows)
    }
}

const controller = new UserController();

module.exports = controller