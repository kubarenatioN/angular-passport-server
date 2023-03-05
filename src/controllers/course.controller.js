const { db } = require('../database/db')
const format = require('pg-format');

const table = 'courses'
const reviewTable = 'courses-review'
const usersCourses = 'users-courses'

const reviewStatuses = {
    reviewed: 'Reviewed',
    readyForReview: 'ReadyForReview',
    readyForUpdate: 'ReadyForUpdate',
}

const enrollStatuses = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
}

class CoursesController {
    getAll = async (req, res) => {
        const courses = await db.query(`SELECT * FROM ${table}`)
        return res.json({
            data: courses.rows
        })
    }

    getById = async (req, res) => {
        const { id } = req.params
        const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id])

        return res.status(200).json({
            data: result.rows[0]
        })
    }

    getOnReview = async (req, res) => {
        const queryString = `SELECT * FROM "${reviewTable}" where "masterId" IS NULL order by "createdAt" ASC`
        const courses = await db.query(queryString)
        return res.json({
            data: courses.rows
        })
    }

    getOnReviewById = async (req, res) => {
        const { id } = req.params
        const queryString = `SELECT * FROM "${reviewTable}" where id = $1`
        const course = await db.query(queryString, [id])
        return res.status(200).json({
            data: course.rows[0]
        })
    }

    getCourseReviewHistory = async (req, res) => {
        const { id } = req.query
        const queryString = `SELECT * FROM "${reviewTable}" where "masterId" = $1 or id = $1 order by "createdAt" DESC`        
        const payload = [id]
        const courses = await db.query(queryString, payload)
        return res.status(200).json({
            data: courses.rows
        })
    }
    
    getByAuthorId = async (req, res) => {
        const { id } = req.body
        const publishedCourses = await db.query(`SELECT * FROM ${table} where "authorId" = $1`, [id])
        const reviewCourses = await db.query(`SELECT * FROM "${reviewTable}" where "authorId" = $1`, [id])
        return res.json({
            data: {
                published: publishedCourses.rows,
                review: reviewCourses.rows,
            }
        })
    }

    async create(req, res) {
        const { course, isMaster } = req.body;
        const { id, title, description, category, startDate, endDate, modulesJson, authorId } = course
        const createdAt = new Date().toUTCString()
        const masterId = isMaster ? null : course.masterId

        const result = await db.query(`INSERT into "${reviewTable}" (title, description, category, "startDate", "endDate", "modulesJson", "authorId", "createdAt", "masterId") values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [title, description, category, startDate, endDate, modulesJson, authorId, createdAt, masterId])
        const newCourse = result.rows[0]

        await db.query(`UPDATE "${reviewTable}" SET status = $1 WHERE id = $2`, [reviewStatuses.reviewed, id])

        res.status(200).json(newCourse)
    }

    publish = async (req, res) => {
        const { course, masterId } = req.body;
        const { title, description, category, startDate, endDate, modulesJson, authorId } = course
        const createdAt = new Date().toUTCString()

        const insertQuery = `INSERT INTO "${table}" (title, description, category, "startDate", "endDate", "modulesJson", "authorId", "createdAt") values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`

        const result = await db.query(insertQuery, [title, description, category, startDate, endDate, modulesJson, authorId, createdAt])

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

    enroll = async (req, res) => {
        const { courseId, userIds, action } = req.body

        let queryString = ''
        let payload = []
        let data
        if (action === 'enroll') {
            let { rows } = await db.query(`SELECT * FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2`, [userIds, courseId])

            if (rows.length > 0) {
                return res.status(400).json({
                    message: 'Try to insert already existed data',
                    data: rows
                })
            }
            data = userIds.map(userId => [userId, courseId, enrollStatuses.pending])
            queryString = format(`INSERT INTO "${usersCourses}" ("userId", "courseId", "status") VALUES %L RETURNING "userId"`, data);
        }
        else if (action === 'approve') {
            queryString = `UPDATE "${usersCourses}" SET status = $1 WHERE "userId" = ANY($2::int[]) AND "courseId" = $3 RETURNING "userId"`  
            payload = [enrollStatuses.approved, userIds, courseId]
        }
        else if (action === 'reject') {
            queryString = `UPDATE "${usersCourses}" SET status = $1 WHERE "userId" = ANY($2::int[]) AND "courseId" = $3 RETURNING "userId"`  
            payload = [enrollStatuses.rejected, userIds, courseId]
        }
        else if (action === 'lookup') {
            queryString = `SELECT * FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2`
            payload = [userIds, courseId]
        }

        if (action) {
            const { rows } = await db.query(queryString, payload)

            return res.status(200).json({
                data: rows,
                message: 'Success',
                action,
            })
        }
    }

    getStudentCourses = async (req, res) => {
        const { userId } = req.body
        if (!userId) {
            return res.status(400).json({
                message: 'No user ID was provided.'
            })
        }

        const queryString = `
            SELECT "${table}".*, "${usersCourses}"."status"
            FROM "${table}" 
            JOIN "${usersCourses}" ON "${usersCourses}"."courseId" = "${table}"."id"
            WHERE "${usersCourses}"."userId" = $1
        `
        const payload = [userId]

        const { rows } = await db.query(queryString, payload);
        return res.status(200).json({
            data: rows,
            message: 'Success'
        })
    }
}

const controller = new CoursesController()

module.exports = controller