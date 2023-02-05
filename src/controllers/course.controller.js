const { db } = require('../database/db')

const table = 'courses'

class CoursesController {
    get = async (req, res) => {
        const { status } = req.body;
        if (status) {
            const promises = []
            status.forEach(status => {
                const promise = db.query(`SELECT * FROM ${table} where status = $1`, [status])
                promises.push(promise)
            });
            Promise.all(promises).then(coursesArray => {
                const courses = {}
                status.forEach((status, i) => {
                    courses[status] = coursesArray[i].rows
                })
                return res.json(courses)
            })
        }
        else {
            const courses = await db.query(`SELECT * FROM ${table} where status = 'published'`)
            return res.json({
                published: courses.rows
            })
        }
    }

    async create(req, res) {
        const { course } = req.body;
        const { title, description } = course

        const newCourse = await db.query(`INSERT into ${table} (title, description) values ($1, $2) RETURNING *`, [title, description])
        res.json(newCourse.rows[0])
    }

    publish = async (req, res) => {
        const { id } = req.body;

        const newCourse = await db.query(`UPDATE ${table} set status = 'published' where id = $1 RETURNING *`, [id])
        req.body.status = ['review']
        return this.get(req, res)
    }

    // creator and admin can edit the same course while reviewing it
    async edit(req, res) {
        const { course } = req.body;

        res.json({})
    }
}

const controller = new CoursesController()

module.exports = controller