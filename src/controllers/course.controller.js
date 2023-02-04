const { db } = require('../database/db')

const table = 'courses'

class CoursesController {
    async get(req, res) {
        const { status } = req.body;
        if (status) {
            const courses = await db.query(`SELECT * FROM ${table} where status = $1`, [status])
            return res.json(courses.rows)
        }
        const courses = await db.query(`SELECT * FROM ${table} where status = 'published'`)
        res.json(courses.rows)
    }

    async create(req, res) {
        const { course } = req.body;
        const { title, description } = course

        const newCourse = await db.query(`INSERT into ${table} (title, description) values ($1, $2) RETURNING *`, [title, description])
        res.json(newCourse.rows[0])
    }

    async publish(req, res) {
        const { id } = req.body;

        const newCourse = await db.query(`UPDATE ${table} set status = 'published' where id = $1 RETURNING *`, [id])
        res.json(newCourse.rows[0])
    }

    // creator and admin can edit the same course while reviewing it
    async edit(req, res) {
        const { course } = req.body;

        res.json({})
    }
}

const controller = new CoursesController()

module.exports = controller