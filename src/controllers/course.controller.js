const { db } = require('../database/db')
const format = require('pg-format');
const { getCurrentUTCTime } = require('../helpers/time.helper');

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
        const {
            id,
            secondaryId,
            title,
            description,
            category,
            modulesJson,
            authorId
        } = course
        const createdAt = getCurrentUTCTime()
        const masterId = isMaster ? null : course.masterId

        const result = await db.query(`
            INSERT into "${reviewTable}" 
            ("secondaryId", title, description, category, "modulesJson", "authorId", "createdAt", "masterId") 
            values ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, 
            [secondaryId, title, description, category, modulesJson, authorId, createdAt, masterId]
        )
        const newCourse = result.rows[0]

        if (!isMaster) {
            await db.query(`UPDATE "${reviewTable}" SET status = $1 WHERE id = $2`, [reviewStatuses.reviewed, id])
        }

        res.status(200).json(newCourse)
    }

    publish = async (req, res) => {
        const { course, masterId } = req.body;
        const { title, description, category, startDate, endDate, modulesJson, authorId, secondaryId } = course
        const createdAt = getCurrentUTCTime()

        const insertQuery = `INSERT INTO "${table}" (title, description, category, "startDate", "endDate", "modulesJson", "authorId", "createdAt", "secondaryId") values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`

        const result = await db.query(insertQuery, [title, description, category, startDate, endDate, modulesJson, authorId, createdAt, secondaryId])

        const clearReviewQuery = `DELETE FROM "${reviewTable}" WHERE id = $1 OR "masterId" = $1`
        await db.query(clearReviewQuery, [masterId])

        return res.status(200).json({
            message: 'Success',
            course: result.rows[0]
        })
    }

    updateCourseReview = async (req, res) => {
        const { id, comments } = req.body;
        const { overallComments, modules } = comments;
        const query = `UPDATE "${reviewTable}" SET "comments" = $1, "modulesJson" = $2, "status" = $3 WHERE id = $4`
        const payload = [overallComments, modules, reviewStatuses.readyForUpdate, id]
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
        const createdAt = getCurrentUTCTime()
        if (action === 'enroll') {
            let { rows } = await db.query(`SELECT * FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2`, [userIds, courseId])

            if (rows.length > 0) {
                return res.status(400).json({
                    message: 'Try to insert already existed data',
                    data: rows
                })
            }
            data = userIds.map(userId => [userId, courseId, enrollStatuses.pending, createdAt])
            queryString = format(`INSERT INTO "${usersCourses}" ("userId", "courseId", "status", created_at) VALUES %L RETURNING "userId"`, data);
        }
        else if (action === 'lookup') {
            queryString = `SELECT * FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2`
            payload = [userIds, courseId]
        }
        else if (action === 'approve') {
            queryString = `UPDATE "${usersCourses}" SET status = $1, created_at = $4 WHERE "userId" = ANY($2::int[]) AND "courseId" = $3 RETURNING "userId"`  
            payload = [enrollStatuses.approved, userIds, courseId, createdAt]
        }
        else if (action === 'reject') {
            queryString = `UPDATE "${usersCourses}" SET status = $1, created_at = $4 WHERE "userId" = ANY($2::int[]) AND "courseId" = $3 RETURNING "userId"`  
            payload = [enrollStatuses.rejected, userIds, courseId, createdAt]
        }
        else if (action === 'cancel') {
            queryString = `DELETE FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2 RETURNING "userId"`  
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

    getCourseMembers = async (req, res) => {
        const { type, status } = req.query
        let queryString;
        let payload;
        const courseId = Number(req.query.courseId)
        if (type === 'list') {
            let { size, page } = req.query
            size = Number(size)
            page = Number(page)
            const statuses = status.split(',')
            const from = size * page
            const to = from + size

            // TODO: add order by creation time, to get most recent items
            queryString = `
                WITH subquery AS (
                    SELECT *, ROW_NUMBER() OVER (PARTITION BY status ORDER BY id) row_number
                    FROM "users-courses"
                    WHERE "courseId" = $3 AND status IN (
                        SELECT * 
                        FROM unnest(enum_range(NULL::"CourseEnrollmentStatus")) as sts(name)
                        WHERE name::text = ANY($4)
                    )
                )
                SELECT subquery.status, users.username, users.id, users.photo, users.email
                FROM subquery INNER JOIN "users-test" users
                ON subquery."userId" = users.id
                WHERE row_number <= $2 AND row_number > $1;
            `
            payload = [from, to, courseId, statuses]
        }

        if (queryString) {
            const { rows } = await db.query(queryString, payload)
            const result = {
                pending: rows.filter(user => user.status === enrollStatuses.pending),
                approved: rows.filter(user => user.status === enrollStatuses.approved),
                rejected: rows.filter(user => user.status === enrollStatuses.rejected),
            }
            return res.status(200).json({
                data: result,
                message: 'Success',
                courseId,
                type
            })
        } else {
            return res.json({})
        }
    }
}

const controller = new CoursesController()

module.exports = controller