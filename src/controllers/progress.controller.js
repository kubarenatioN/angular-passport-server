const { generateUUID } = require('../helpers/common.helper')
const ProfileProgress = require('../models/progress/profile-progress.model')
const TrainingProfile = require('../models/training/training-profile.model')

class ProgressController {

    get = async (req, res) => {
        const { profileId, topicId } = req.body

        try {
            const progress = await ProfileProgress.Model.findOne({
                profile: profileId,
                topicId,
            })
    
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

}

const controller = new ProgressController()
module.exports = controller