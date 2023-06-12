const { generateUUID } = require('../helpers/common.helper')
const { getCurrentUTCTime } = require('../helpers/time.helper')
const ProfileProgress = require('../models/progress/profile-progress.model')
const TrainingProfile = require('../models/training/training-profile.model')

class ProgressController {

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
        const { progressId, records, quiz } = req.body

        try {
            const progress = await ProfileProgress.Model.findOne({
                _id: progressId
            })

            if (records && records.length > 0) {
                const newRecords = progress.records.concat(...records)
                progress.records = newRecords
            }

            if (quiz) {
                progress.quiz = progress.quiz.concat([quiz])
            }

            const { records: progressRecords } = await this._calculateProgressScore(progress)
            console.log('progressRecords', progressRecords);
            progress.bestScore = progressRecords.bestScore
            progress.lastScore = progressRecords.lastScore

            const added = await progress.save()

            const profileId = progress.profile

            console.log(`=== === CALCULATE PROFILE ${profileId} START ===`);

            const { records: profileScore } = await this._calculateProfileScore(profileId)
            console.log(profileScore);
            const profileObj = await TrainingProfile.Model.findOne({
                _id: profileId,
            })
            profileObj.bestScore = profileScore.bestScore
            profileObj.lastScore = profileScore.lastScore
            await profileObj.save()

            console.log(`=== === CALCULATE PROFILE ${profileId} END ===`);

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

    addQuizRecord = async (req, res) => {
        try {
      
            const { mark, ID: idCombination } = req.body
            if (!(mark && mark.length > 0)  || !idCombination) {
                return res.status(404).json({
                    message: 'No id combination or mark provided',
                    mark,
                    id: idCombination
                })
            }
        
            const [ profileId, topicId ] = idCombination[0].split('#')
            if (!profileId || !topicId) {
                return res.status(404).json({
                    message: 'No profile id or topic id provided',
                    profileId,
                    topicId
                })
            }
        
            const markNum = +mark[0].split('/')[0] / +mark[0].split('/')[1]
            const quizRecord = {
                uuid: generateUUID(),
                mark: markNum,
                date: getCurrentUTCTime()
            }
        
            const profile = await TrainingProfile.Model.findOne({
                uuid: profileId
            })
        
            if (!profile) {
                return res.status(404).json({
                    message: 'No profile found by provided uuid.'
                })
            }
        
            const profileProgress = await ProfileProgress.Model.findOne({
                profile: profile._id,
                topicId,
            })
        
            if (!profileProgress) {
                return res.status(404).json({
                    message: 'No profile progress found for topic uuid.'
                })
            }
        
            profileProgress.quiz.push(quizRecord)
        
            const { records: progressRecords } = await this._calculateProgressScore(profileProgress)
            console.log('[quiz] progressRecords', progressRecords);
            profileProgress.bestScore = progressRecords.bestScore
            profileProgress.lastScore = progressRecords.lastScore

            // Save profile progress
            const updated = await profileProgress.save()

            console.log(`=== === CALCULATE PROFILE ${profileId} START ===`);
            const { records } = await this._calculateProfileScore(profileId)
            profile.bestScore = records.bestScore
            profile.lastScore = records.lastScore
            await profile.save()
            console.log(`=== === CALCULATE PROFILE ${profileId} END ===`);

            return res.status(200).json({
                message: 'Saved quiz result.',
                updated,
            })
      
        } catch (error) {
            return res.status(500).json({
                message: 'Error saving quiz results',
                error,
            })
        }
    }

    getProfileProgress = async (req, res) => {
        const { id } = req.params

        try {
            const result = await this._getAllProgressByProfile(id)

            return res.status(200).json({
                progress: result
            })
            
        } catch (error) {
            return res.status(500).json({
                error
            })
        }
    }

    _getAll = async (req, res) => {
        const { profileId } = req.body

        try {
            const profiles = await this._getAllProgressByProfile(profileId)
    
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
            const progress = await this._getProgressByTopic(profileId, topicId)

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

    _calculateProfileScore = async (profileId) => {
        try {
            const profiles = await ProfileProgress.Model.find({
                profile: profileId
            })

            let bestRecordsScore = 0
            let lastRecordsScore = 0

            for (const p of profiles) {
                console.log(`=== CALCULATE PROGRESS ${p.uuid} START ===`);
                const { records } = await this._calculateProgressScore(p)
                const { bestScore, lastScore } = records
                bestRecordsScore += bestScore
                lastRecordsScore += lastScore
                console.log(`=== CALCULATE PROGRESS ${p.uuid} END ===`);
            }
            
            const quiz = null

            return {
                records: {
                    bestScore: bestRecordsScore,
                    lastScore: lastRecordsScore,
                },
                quiz
            }

        } catch (error) {
            
        }
    }

    _calculateProgressScore = async (progress) => {
        try {
            const { records, quiz } = progress

            const recordsLastSum = [...records].sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            }).reduce((acc, record) => {
                if (acc.findIndex(r => r.taskId === record.taskId) === -1) {
                    acc.push(record)
                }

                return acc;
            }, []).reduce((score, r) => {
                score = score + r.mark
                return score
            }, 0)

            let recordsBestSum = records.reduce((acc, record) => {
                if (acc[record.taskId]) {
                    acc[record.taskId].push(record)
                } else {
                    acc[record.taskId] = [record]
                }

                return acc;
            }, {})

            const keys = Object.keys(recordsBestSum)
            keys.forEach(taskId => {
                const max = recordsBestSum[taskId].reduce((max, it) => {
                    if (max && max.mark < it.mark) {
                        max = it
                    }
                    return max;
                }, recordsBestSum[taskId][0])
                recordsBestSum[taskId] = max
            })

            recordsBestSum = keys.reduce((score, key) => recordsBestSum[key].mark + score, 0)

            console.log('recordsLastSum', recordsLastSum);
            console.log('recordsBestSum', recordsBestSum);

            return {
                records: {
                    lastScore: recordsLastSum,
                    bestScore: recordsBestSum,
                }
            }
        } catch (error) {
            
        }
    }
}

const controller = new ProgressController()
module.exports = controller