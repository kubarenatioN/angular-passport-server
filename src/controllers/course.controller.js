const { db } = require('../database/db')

const table = 'courses'
const reviewTable = 'courses-review'

const reviewStatuses = {
    reviewed: 'Reviewed',
    readyForReview: 'ReadyForReview',
    readyForUpdate: 'ReadyForUpdate',
}

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

    getOnReviewById = async (req, res) => {
        const { id } = req.params
        const queryString = `SELECT * FROM "${reviewTable}" where id = $1`
        const course = await db.query(queryString, [id])
        return res.json(course.rows[0])
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
        const reviewCourses = await db.query(`SELECT * FROM "${reviewTable}" where "authorId" = $1`, [id])
        return res.json({
            published: publishedCourses.rows,
            review: reviewCourses.rows,
        })
    }

    async create(req, res) {
        const { course } = req.body;
        const { title, description, modules, authorId } = course
        const createdAt = new Date().toUTCString()

        // const courses = await db.query(`SELECT * from "${reviewTable}"`)
        // console.log(courses.rows);
        const newCourse = await db.query(`INSERT into "${reviewTable}" (title, description, "modulesJson", "authorId", "createdAt") values ($1, $2, $3, $4, $5) RETURNING *`, [title, description, modules, authorId, createdAt])
        res.json(newCourse.rows[0])
    }

    publish = async (req, res) => {
        const { id } = req.body;
        return res.json('Write me!')
    }

    updateCourseReview = async (req, res) => {
        const { id, comments } = req.body;
        const query = `UPDATE "${reviewTable}" SET "editorCommentsJson" = $1, "status" = $2 WHERE id = $3`
        const payload = [comments, reviewStatuses.readyForUpdate, id]
        const course = await db.query(query, payload)
        return res.status(200).json({
            message: 'Success',
        })
    }

    // creator will edit the same course while admin is reviewing it
    async edit(req, res) {
        const { course } = req.body;

        res.json({})
    }
}

const controller = new CoursesController()

module.exports = controller