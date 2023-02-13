const { db } = require('../database/db')

const table = 'courses'
const reviewTable = 'courses-review'

class CoursesController {
    get = async (req, res) => {
        const courses = await db.query(`SELECT * FROM ${table}`)
        return res.json(courses.rows)
    }

    getOnReview = async (req, res) => {
        const queryString = `SELECT * FROM "${reviewTable}" where "parentId" IS NULL order by "createdAt" ASC`
        const courses = await db.query(queryString)
        return res.json(courses.rows)
    }

    getCourseReviewHistory = async (req, res) => {
        const { id } = req.query
        const queryString = `SELECT * FROM "${reviewTable}" where "parentId" = $1 or id = $1 order by "createdAt" DESC`        
        const payload = [id]
        const courses = await db.query(queryString, payload)
        return res.json(courses.rows)
    }
    
    getByAuthorId = async (req, res) => {
        const { id } = req.body
        const publishedCourses = await db.query(`SELECT * FROM ${table} where "authorId" = $1`, [id])
        const reviewCourses = await db.query(`SELECT * FROM "${reviewTable}" where "authorId" = $1 and "parentId" IS NULL`, [id])
        return res.json({
            published: publishedCourses.rows,
            review: reviewCourses.rows,
        })
    }

    async create(req, res) {
        const { course } = req.body;
        const { title, description, modules, authorId } = course
        const createdAt = new Date().toUTCString()

        const newCourse = await db.query(`INSERT into "${reviewTable}" (title, description, "modulesJson", "authorId", "createdAt") values ($1, $2, $3, $4, $5) RETURNING *`, [title, description, modules, authorId, createdAt])
        res.json(newCourse.rows[0])
    }

    publish = async (req, res) => {
        const { id } = req.body;
        return res.json('Write me!')
    }

    // creator will edit the same course while admin is reviewing it
    async edit(req, res) {
        const { course } = req.body;

        res.json({})
    }
}

const controller = new CoursesController()

module.exports = controller