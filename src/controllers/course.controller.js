const { db } = require('../database/db');
const format = require('pg-format');
const { getCurrentUTCTime } = require('../helpers/time.helper');
const courseRunsController = require('../controllers/course-runs.controller')
const progressController = require('../controllers/progress.controller')
const courseMembershipController = require('../controllers/course-membership.controller')
const courseReviewController = require('../controllers/course-review.contoller')
const { reviewStatuses, enrollStatuses } = require('../constants/common.constants')

const Course = require('../models/course.model')
const CourseReview = require('../models/course-review.model')
const CourseMembership = require('../models/course-membership.model')

const table = 'courses';
const reviewTable = 'courses-review';
const usersCourses = 'users-courses';

class CoursesController {

    get = async (req, res) => {
        const { type, authorId, coursesIds, studentId, fields } = req.body

        try {
            const response = {}
            if (type.includes('review')) {
                const review = await courseReviewController.select(req.body)
                response.review = review
            }
            if (type.includes('published')) {
                const published = await this.select(req.body)
                response.published = published
            }

            return res.json(response)
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses.',
                error,
            })
        }
    }

    list = async (req, res) => {
        const { pagination, filters, fields } = req.body
        const { offset, limit } = pagination

        try {
            const data = await Course.Model.find({

            }).skip(offset).limit(limit).select(fields)
            
            return res.status(200).json({
                message: 'Success',
                data
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses catalog.',
                error,
            })
        }
    }

    select = async (options) => {
        const { authorId, coursesIds, fields } = options
        const courses = await Course.get({
            authorId,
            ids: coursesIds,
            fields
        })
        return courses;
    }

	getById = async (req, res) => {
		const { id: courseRunId } = req.params;
        console.log(courseRunId);
        const courseRun = await courseRunsController.get(courseRunId)
        console.log(courseRun.courseId);
		const result = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [courseRun.courseId]);
		const data = parseModules(result.rows);
		return res.status(200).json({
			data: data[0],
		});
	};

	getOnReview = async (req, res) => {
		const queryString = `SELECT * FROM "${reviewTable}" where "masterId" IS NULL order by "createdAt" ASC`;
		const courses = await db.query(queryString);
		const data = parseModules(courses.rows);
		return res.json({
			data,
		});
	};

	getOnReviewById = async (req, res) => {
		const { id } = req.params;
		const queryString = `SELECT * FROM "${reviewTable}" where id = $1`;
		const result = await db.query(queryString, [id]);
		const data = parseModules(result.rows);
		return res.status(200).json({
			data: data[0],
		});
	};

	getByAuthorId = async (req, res) => {
		const { id } = req.body;
		const publishedCourses = await db.query(
			`SELECT * FROM ${table} where "authorId" = $1`,
			[id]
		);
		const reviewCourses = await db.query(
			`SELECT * FROM "${reviewTable}" where "authorId" = $1`,
			[id]
		);
        
        const data = {
            published: parseModules(publishedCourses.rows),
            review: parseModules(reviewCourses.rows),
        };
        
		return res.json({
            data,
		});
	};

    publish = async (req, res) => {
        const { course, masterId } = req.body
        delete course._id
        course.createdAt = getCurrentUTCTime()

        try {
            const record = await Course.create(course)

            // Remove from review all records with masterId
            const removed = await CourseReview.Model.deleteMany({
                $or: [
                    { masterId },
                    { uuid: masterId },
                ]
            })

            return res.status(200).json({
                message: 'Success',
                course: record
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Error publishing a course',
                error
            })
        }
    }

    handleMembership = async (req, res) => {
        const { usersIds, courseId } = req.body
        const { action } = req.query

        switch (action) {
            case 'update': {
                break;
            }
            case 'lookup': {
                break;
            }
        
            default: {
                return await courseMembershipController.setEnrollStatus(req, res)
            }
        }
        
        const records = await CourseMembership.Model.find({})

        return res.status(200).json({
            data: records,
            action
        })
    } 

	enroll = async (req, res) => {
		const { courseId, userIds, action } = req.body;

		let queryString = '';
		let payload = [];
		let data;
		const createdAt = getCurrentUTCTime();
		if (action === 'enroll') {
			let { rows } = await db.query(
				`SELECT * FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2`,
				[userIds, courseId]
			);

			if (rows.length > 0) {
				return res.status(400).json({
					message: 'Try to insert already existed data',
					data: rows,
				});
			}
			data = userIds.map((userId) => [
				userId,
				courseId,
				enrollStatuses.pending,
				createdAt,
			]);
			queryString = format(
				`INSERT INTO "${usersCourses}" ("userId", "courseId", "status", created_at) VALUES %L RETURNING "userId"`,
				data
			);
		} else if (action === 'lookup') {
			queryString = `SELECT * FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2`;
			payload = [userIds, courseId];
		} else if (action === 'approve') {
			queryString = `UPDATE "${usersCourses}" SET status = $1, created_at = $4 WHERE "userId" = ANY($2::int[]) AND "courseId" = $3 RETURNING "userId"`;
			payload = [enrollStatuses.approved, userIds, courseId, createdAt];
		} else if (action === 'reject') {
			queryString = `UPDATE "${usersCourses}" SET status = $1, created_at = $4 WHERE "userId" = ANY($2::int[]) AND "courseId" = $3 RETURNING "userId"`;
			payload = [enrollStatuses.rejected, userIds, courseId, createdAt];
		} else if (action === 'cancel') {
			queryString = `DELETE FROM "${usersCourses}" WHERE "userId" = ANY($1::int[]) AND "courseId" = $2 RETURNING "userId"`;
			payload = [userIds, courseId];
		}

		if (action) {
			const { rows } = await db.query(queryString, payload);

			return res.status(200).json({
				data: rows,
				message: 'Success',
				action,
			});
		}
	};

	getStudentCourses = async (req, res) => {
		const { userId } = req.body;
		if (!userId) {
			return res.status(400).json({
				message: 'No user ID was provided.',
			});
		}

		const queryString = `
            SELECT "${table}".*, "${usersCourses}"."status"
            FROM "${table}" 
            JOIN "${usersCourses}" ON "${usersCourses}"."courseId" = "${table}"."id"
            WHERE "${usersCourses}"."userId" = $1
        `;
		const payload = [userId];

		const { rows } = await db.query(queryString, payload);
		return res.status(200).json({
			data: parseModules(rows),
			message: 'Success',
		});
	};

	getCourseMembers = async (req, res) => {
		const { type, status } = req.query;
		let queryString;
		let payload;
		const courseId = Number(req.query.courseId);
		if (type === 'list') {
			let { size, page } = req.query;
			size = Number(size);
			page = Number(page);
			const statuses = status.split(',');
			const from = size * page;
			const to = from + size;

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
            `;
			payload = [from, to, courseId, statuses];
		}

		if (queryString) {
			const { rows } = await db.query(queryString, payload);
			const result = {
				pending: rows.filter((user) => user.status === enrollStatuses.pending),
				approved: rows.filter(
					(user) => user.status === enrollStatuses.approved
				),
				rejected: rows.filter(
					(user) => user.status === enrollStatuses.rejected
				),
			};
			return res.status(200).json({
				data: result,
				message: 'Success',
				courseId,
				type,
			});
		} else {
			return res.json({});
		}
	};
}

function parseModules(courses) {
	return courses.map((course) => {
		course.modules = JSON.parse(course.modulesJson);
		delete course.modulesJson;
		return course;
	});
}

const controller = new CoursesController();

module.exports = controller;
