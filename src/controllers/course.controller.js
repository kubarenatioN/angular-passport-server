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
        const queryString = `SELECT * FROM "${reviewTable}" where "masterId" IS NULL order by "createdAt" ASC`
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
        const queryString = `SELECT * FROM "${reviewTable}" where "masterId" = $1 or id = $1 order by "createdAt" DESC`        
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
        const { course, isMaster } = req.body;
        const { id, title, description, modulesJson, authorId } = course
        const createdAt = new Date().toUTCString()
        const masterId = isMaster ? null : course.masterId
        console.log('111 create id', id);
        const result = await db.query(`INSERT into "${reviewTable}" (title, description, "modulesJson", "authorId", "createdAt", "masterId") values ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, description, modulesJson, authorId, createdAt, masterId])
        const newCourse = result.rows[0]

        await db.query(`UPDATE "${reviewTable}" SET status = $1 WHERE id = $2`, [reviewStatuses.reviewed, id])

        res.status(200).json(newCourse)
    }

    publish = async (req, res) => {
        const { course, masterId } = req.body;
        const { title, description, modulesJson, authorId } = course
        const createdAt = new Date().toUTCString()

        const insertQuery = `INSERT INTO "${table}" (title, description, "modulesJson", "authorId", "createdAt") values ($1, $2, $3, $4, $5) RETURNING *`

        const result = await db.query(insertQuery, [title, description, modulesJson, authorId, createdAt])

        const clearReviewQuery = `DELETE FROM "${reviewTable}" WHERE id = $1 OR "masterId" = $1`
        await db.query(clearReviewQuery, [masterId])

        return res.status(200).json({
            message: 'Success',
            course: result.rows[0]
        })
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