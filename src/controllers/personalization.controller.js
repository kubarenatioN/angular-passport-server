const { generateUUID } = require('../helpers/common.helper')
const ProfileProgress = require('../models/progress/profile-progress.model')
const TrainingTask = require('../models/training-task.model')
const TrainingProfile = require('../models/training/training-profile.model')
const Personalization = require('../models/personalization.model')

class PersonalizationController {

    assignTasks = async (req, res) => {
     
        const { assign, unassign } = req.body

        try {
            const assigned = await this._assignTasks({ assign })
            const unassigned = await this._unassignTasks({ unassign })
            
            return res.status(200).json({
                message: 'Assigned',
                assigned,
                unassigned,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Assignement error',
                error
            })
        }
    }

    getTasks = async (req, res) => {
        const { authorId, topicId, trainingId } = req.query

        try {
            const query = {}
            if (authorId) {
                query['authorId'] = authorId
            }
            if (trainingId) {
                query['training'] = trainingId
            }
            if (topicId) {
                query['topicId'] = topicId
            }

            const tasks = await TrainingTask.Model.find(query).populate({
                path: 'training',
                model: 'CourseTraining',
                populate: {
                    path: 'course',
                    model: 'Course',
                    select: ['title']
                }
            })

            return res.status(200).json({
                message: 'Get tasks',
                tasks,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error getting tasks',
                error,
                tasks: null,
            })
        }
    }

    createTask = async (req, res) => {
        const { trainingId, topicId, authorId, task } = req.body

        try {
            const created = await TrainingTask.Model.insertMany({
                uuid: generateUUID(),
                training: trainingId,
                topicId,
                task,
                authorId,
                type: 'personal'
            })

            return res.status(200).json({
                message: 'Task created',
                task: created,
            })
        } catch (error) {
            return res.status(500).json({
                message: 'Error creating task.',
                error,
            })
        }
        
    }

    _assignTasks = async (params) => {
        const { assign } = params

        const insert = assign
            .filter(assignment => !assignment.taskPersonalization)
            .map(assignment => {
                return {
                    uuid: assignment.uuid,
                    profile: assignment.profile,
                    task: assignment.task,
                    type: 'assignment'
                }
            })
        // console.log('insert', insert);
        const createdPers = await Personalization.Model.insertMany(
            insert, { ordered: false }
        )

        return createdPers;
    }

    _unassignTasks = async (params) => {
        const { unassign } = params

        const remove = unassign
            .filter(unassignment => unassignment.taskPersonalization !== undefined)
            .map(item => {
                return {
                    profile: item.profile,
                    task: item.task,
                    type: 'assignment'
                }
            })

        const deleted = remove.forEach(async (item) => {
            const removed = await Personalization.Model.deleteOne({
                profile: item.profile,
                task: item.task,
                type: 'assignment'
            })
            return removed
        })

        return deleted;
    }
}

const controller = new PersonalizationController()
module.exports = controller