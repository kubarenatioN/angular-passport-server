const Router = require('express').Router;
const { getCurrentUTCTime } = require('../helpers/time.helper');
const { generateUUID } = require('../helpers/common.helper');
const ProfileProgress = require('../models/progress/profile-progress.model');
const TrainingProfile = require('../models/training/training-profile.model');

const router = Router();

router.post('/', async (req, res) => {
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

    const updated = await profileProgress.save()

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
})

module.exports = router