const { generateUUID } = require('../helpers/common.helper');
const { getCurrentUTCTime } = require('../helpers/time.helper');
const { verifyToken } = require('../helpers/token-helper');
require('dotenv').config()

const TrainingProfile = require('../models/training/training-profile.model');
const CourseTraining = require('../models/training/course-training.model');
const TrainingReply = require('../models/training/training-reply.model');
const Personalization = require('../models/personalization.model');

const progressController = require('../controllers/progress.controller');
const Course = require('../models/course.model');
const ProfileProgress = require('../models/progress/profile-progress.model');

const { JWT_PRIVATE_KEY } = process.env

class TrainingController {

    select = async (req, res) => {
        const { authorId, trainingsIds, fields, uuid, populate } = req.body

        try {
            const query = {}
            if (trainingsIds && trainingsIds.length > 0) {
                query['uuid'] = trainingsIds
            }

            const p = populate ? populate : {
                path: 'course',
                model: 'Course',
                select: fields && fields.length > 0 ? [...fields, 'status'] : []
            }

            let trainings = await CourseTraining.Model.find(query)
            .populate(p)

            if (authorId) {
                trainings = trainings.filter(training => training.course && training.course.authorId === authorId)    
            }

            return res.status(200).json({
                message: 'Select trainings',
                data: trainings
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error selecting trainings',
                data: []
            })
        }
    }

    list = async (req, res) => {
        const { pagination, fields } = req.body
        const { offset, limit } = pagination

        try {
            const data = await CourseTraining.Model.find({
                status: 'active'
            }).skip(offset).limit(limit)
            .populate({
                path: 'course',
                select: fields,
            })
            
            return res.status(200).json({
                message: 'Success list of trainings',
                data
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting courses catalog.',
                error,
            })
        }
    }

    start = async (req, res) => {
        const { id } = req.params
        const { startAt } = req.body

        try {
            const course = await Course.Model.findOne({
                uuid: id,
            })

            const courseTrainings = await CourseTraining.Model.find({
                course: course._id
            })

            const isActiveExists = courseTrainings.some(training => training.status === 'active')

            if (isActiveExists) {
                return res.status(404).json({
                    origin: 'Start training',
                    error: 'Active training by provided course already exists.',
                    training: null
                })
            }

            const training = await CourseTraining.startFromCourse(course, startAt)

            return res.status(200).json({
                message: 'Training started!',
                training
            })
        } catch (error) {
            return res.status(500).json({
                origin: 'Start training',
                training: null,
                error
            })
        }
    } 

    complete = async (req, res) => {
        const { id } = req.params

        try {
            const training = await CourseTraining.Model.findOne({
                uuid: id,
            })
 
            training.status = 'archived'
            const updated = await training.save()

            const profiles = await TrainingProfile.Model.find({
                training: training._id
            }).populate('student')
            // Here calculate students results
            console.log(profiles);
            profiles.forEach(async profile => {
                const progress = ProfileProgress.Model.find({
                    profile: profile._id
                })

                console.log(`Profile: ${profile.uuid}. Progress: ${progress.uuid}`);
            })
            
            return res.status(200).json({
                origin: 'Complete training',
                message: 'Ok',
                updated,
            })
        } catch (error) {
            return res.status(500).json({
                origin: 'Complete training',
                error
            })
        }
        
    } 

    getProfile = async (req, res) => {
        const include = decodeURIComponent(req.query.include).split(',')

        try {
            let progress;
            let personalization;
            const token = req.headers.authorization
            const payload = await verifyToken(token, JWT_PRIVATE_KEY)
            const senderId = payload._id
            const senderUUId = payload.uuid
            const senderRole = payload.role

            const profile = await this._getProfile(req.body)

            const isIssuerOwnProfile = senderId === profile?.student._id.toString()
            const isIssuerTeacher = senderUUId === profile?.training.course.authorId && senderRole === 'teacher'

            const hasAccess = profile && (isIssuerOwnProfile || isIssuerTeacher)

            if (include.includes('progress')) {
                const profileId = profile._id.toString()
                progress = await progressController._getAllProgressByProfile(profileId)
            }

            if (include.includes('personalization')) {
                personalization = await Personalization.Model.find({
                    profile: profile._id
                }).populate('task')
            }

            return res.status(200).json({
                message: 'Get training profile.',
                profile: hasAccess ? profile : null,
                hasAccess,
                progress,
                personalization,
            })
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Error getting training profile.',
                profile: null
            })                
        }
    }

    getTrainingProfiles = async (req, res) => {
        const { trainingId } = req.body
        const include = decodeURIComponent(req.query.include)
        
        try {
            const populate = [
                {
                    path: 'student',
                    model: 'User',
                },
            ]
    
            let profiles = await TrainingProfile.Model.find({
                training: trainingId
            }).populate(populate)
    
            if (include && include.includes('personalization')) {
                const personalizations = await Personalization.Model.find({
                    profile: profiles.map(p => p._id)
                }).populate({
                    path: 'task',
                    model: 'TrainingTask'
                })
                profiles = profiles.map(profile => {
                    const profilePersonalizations = personalizations.filter(pers => pers.profile.toString() === profile._id.toString())
                    return {
                        ...profile._doc,
                        personalizations: profilePersonalizations
                    }
                })
            }
    
            return res.status(200).json({
                message: 'Get training profiles',
                profiles
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error: Get training profiles',
                error
            })
        }
    }

    addReply = async (req, res) => {
        const { reply } = req.body;
        const { profile, sender, topicId, message, taskId, type } = reply;

        try {
            const newReply = new TrainingReply.Model({
                uuid: generateUUID(),
                topicId,
                type,
                taskId,
                message,
                profile,
                sender,
                date: getCurrentUTCTime()
            })
    
            const saved = await newReply.save()
    
            return res.status(200).json({
                message: 'Added new reply',
                reply: saved
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error adding new reply',
                reply: null
            })
        }
    }

    getDiscussionThread = async (req, res) => {
        const { profileId, topicId } = req.body

        try {

            const discussion = await TrainingReply.Model.find({
                topicId,
                profile: profileId
            })
            
            return res.status(200).json({
                message: 'Get topic discussion',
                discussion,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error getting topic discussion',
                discussion: null,
            })
        }
        
    }

    getStudentProfiles = async (req, res) => {
        const { studentId, fields } = req.body

        try {
            const profiles = await TrainingProfile.Model.find({
                student: studentId
            }).populate({
                path: 'training',
                model: 'CourseTraining',
                populate: {
                    path: 'course',
                    model: 'Course',
                    select: fields ?? []
                }
            })

            return res.status(200).json({
                message: 'Get student profiles.',
                profiles,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error getting student profiles.',
                error,
                profiles: null,
            })
        }
    }

    _getProfile = async (params) => {
        const { trainingId, studentId, fields, uuid } = params

        const query = uuid ? {
            uuid
        } : {
            training: trainingId,
            student: studentId,
        }

        const studentProfile = await TrainingProfile.Model.findOne(query).populate([
            {
                path: 'training',
                model: 'CourseTraining',
                populate: {
                    path: 'course',
                    model: 'Course',
                    select: fields ?? []
                }
            },
            {
                path: 'student',
                model: 'User'
            }
        ])

        return studentProfile
    }

    createProfile = async (req, res) => {
        const { trainingId, studentId } = req.body

        try {
            const exists = await TrainingProfile.Model.exists({
                trainingId,
                studentId,
            })
    
            if (exists._id != null) {
                return res.status(200).json({
                    message: 'Profile already exists.',
                    profile: exists,
                })
            }
            
            const studentProfile = await this._createProfile(req.body)
            const profile = await TrainingProfile.Model.findOne({
                _id: studentProfile._id
            })

            return res.status(200).json({
                message: 'Profile created.',
                profile,
            })

        } catch (error) {
             return res.status(500).json({
                message: 'Error creating training profile.',
                profile: null,
                studentId,
                trainingId,
            })
        }
    }

    _createProfile = async (payload) => {
        const { trainingId, studentId } = payload

        const newProfile = new TrainingProfile.Model({
            uuid: generateUUID(),
            training: trainingId,
            student: studentId    
        })

        const created = await newProfile.save()

        return created
    }
}

const controller = new TrainingController()
module.exports = controller