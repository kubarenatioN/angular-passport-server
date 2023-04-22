const { generateUUID } = require('../helpers/common.helper')
const ProfileProgress = require('../models/progress/profile-progress.model')
const TrainingProfile = require('../models/training/training-profile.model')

class ProgressController {

    // getAll = async (req, res) => {
    //     const { profileId } = req.body

    //     try {
    //         const progressProfiles = await ProfileProgress.Model.find({
    //             profile: profileId,
    //         })
    
    //         return res.status(200).json({
    //             message: 'Progresses found.',
    //             progressProfiles,
    //         })

    //     } catch (error) {
    //         return res.status(500).json({
    //             message: 'Server error: get profile progress.',
    //             progressProfiles: [],
    //             error
    //         }) 
    //     }
        
    // }

    get = async (req, res) => {
        const { profileId, topicId } = req.body

        if (profileId && topicId) {
            return this._getByTopic(req, res)
        }
        else if (profileId && !topicId) {
            return this._getAll(req, res)
        }
        
    }

    addRecord = async (req, res) => {
        const { progressId, records } = req.body

        try {
            const progress = await ProfileProgress.Model.findOne({
                _id: progressId
            })

            const newRecords = progress.records.concat(...records)
            
            progress.records = newRecords

            const added = await progress.save()

            return res.status(200).json({
                message: 'Records added.',
                added
            })
    
        } catch (error) {
            return res.status(500).json({
                message: 'Service error: add progress record.',
                error,
            })
        }
    }

    _getAll = async (req, res) => {
        const { profileId } = req.body

        try {
            const profiles = this._getAllProgressByProfile(profileId)
    
            return res.status(200).json({
                message: 'Progresses found.',
                profiles,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Server error: get profile progress.',
                profiles: [],
                error
            }) 
        }
    }

    _getByTopic = async (req, res) => {
        const { profileId, topicId } = req.body
        
        try {
            const progress = this._getProgressByTopic(profileId, topicId)
    
            if (!progress) {
                const trainingProfile = await TrainingProfile.Model.findOne({
                    _id: profileId,
                })
    
                if (trainingProfile) {
                    const inserted = await ProfileProgress.Model.insertMany([{
                        uuid: generateUUID(),
                        profile: trainingProfile._id,
                        topicId,
                        records: []
                    }])
    
                    const progress = inserted[0]._doc
    
                    return res.status(200).json({
                        message: 'Progress created.',
                        progress,
                    })
                } 
    
                return res.status(404).json({
                    message: 'No progress profile found with provided profile id.',
                    progress: null,
                })
            }
    
            return res.status(200).json({
                message: 'Progress found.',
                progress,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Server error: get profile progress.',
                progress: null,
                error
            }) 
        }
    }

    _getAllProgressByProfile = async (profileId) => {
        const profiles = await ProfileProgress.Model.find({
            profile: profileId,
        })

        return profiles
    }

    _getProgressByTopic = async (profileId, topicId) => {
        return await ProfileProgress.Model.findOne({
            profile: profileId,
            topicId,
        })
    }

}

const controller = new ProgressController()
module.exports = controller