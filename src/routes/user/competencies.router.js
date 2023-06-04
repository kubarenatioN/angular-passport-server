
const Router = require('express').Router;
const User = require('../../models/user.model');
const CompetenciesRequest = require('../../models/competencies-request.model');
const TrainingProfile = require('../../models/user-training-profile.model');

const router = new Router();

router.post(
    '/',
    async (req, res) => {
        const { form, requestId, userId } = req.body

        try {    
            const record = await (new CompetenciesRequest.Model({
                uuid: requestId,
                competencies: form.comps.map(c => c.id),
                files: form.files,
                user: userId,
            })).save()

            return res.status(200).json({
                message: 'Ok',
                data: record,
            })
            
        } catch (error) {
            return res.status(500).json({
                error,
            })            
        }
    }
)

router.get(
    '/',
    async (req, res) => {
        try {    
            const records = await CompetenciesRequest.Model.find({}).populate('user')

            return res.status(200).json({
                message: 'Ok',
                data: records,
            })
            
        } catch (error) {
            return res.status(500).json({
                error,
            })            
        }
    }
)

router.patch(
    '/:id',
    async (req, res) => {
        try {    
            const recordId = req.params.id
            const { status } = req.body

            const record = await CompetenciesRequest.Model.findOne({
                uuid: recordId
            })

            if (status === 'approved') {
                const user = await User.Model.findOne({
                    _id: record.user
                })

                const trainingProfileId = user.trainingProfile
                const profile = await TrainingProfile.Model.findOne({
                    _id: trainingProfileId
                })

                profile.competencies = [...new Set([...profile.competencies, ...record.competencies])]
                await profile.save()
            }

            record.status = status
            await record.save()
            
            return res.status(200).json({
                message: 'Ok',
                data: record,
            })
            
        } catch (error) {
            return res.status(500).json({
                error,
            })            
        }
    }
)

router.get(
    '/user/:id',
    async (req, res) => {
        try {    
            const { id } = req.params
            const records = await CompetenciesRequest.Model.find({
                user: id
            }).populate('user')

            return res.status(200).json({
                message: 'Ok',
                data: records,
            })
            
        } catch (error) {
            return res.status(500).json({
                error,
            })            
        }
    }
)

module.exports = router