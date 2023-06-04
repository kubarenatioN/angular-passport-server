
const Router = require('express').Router;
const { generateUUID } = require('../../helpers/common.helper');
const User = require('../../models/user.model');
const TeacherRequest = require('../../models/teacher-request.model');

const router = new Router();

router.get(
    '/',
    async (req, res) => {
        try {
            const requests = await TeacherRequest.Model.find({

            }).populate('user')

            return res.status(200).json({
                message: 'Get teacher perm requests',
                data: requests,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get teacher permission requests.',
                error,
            })
        }
    }
)

router.get(
    '/:id',
    async (req, res) => {
        const { id } = req.params

        try {
            const request = await TeacherRequest.Model.findOne({
                user: id
            }).populate('user')

            return res.status(200).json({
                message: 'Get teacher perm status',
                request,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get teacher permission request status.',
                error,
            })
        }
    }
)

router.post(
    '/',
    async (req, res) => {
        const { userId, motivation, files } = req.body.request

        try {
            const user = await User.Model.findOne({
                _id: userId,
            })

            if (!user) {
                return res.status(400).json({
                    message: 'No user.',
                })
            }

            const request = await (new TeacherRequest.Model({
                uuid: generateUUID(),
                user: user._id,
                motivation,
                files,
                status: 'pending',
            })).save()

            return res.status(200).json({
                message: 'Request created. Status: pending',
                request
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error get teacher permissions.',
                error,
            })
        }
    }
)

router.patch(
    '/:id',
    async (req, res) => {
        const { id } = req.params
        const { status } = req.body

        try {
            if (status === 'approved') {
                const user = await User.Model.findOne({
                    _id: id
                })
                user.permission = 'teacher'
                await user.save()
            }

            const request = await TeacherRequest.Model.findOne({
                user: id
            })

            request.status = status
            const updated = await request.save()

            return res.status(200).json({
                message: `Request status changed. Status: ${status}`,
                updated,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error update teacher permission status.',
                error,
            })
        }
    }
)

router.delete(
    '/:id',
    async (req, res) => {
        const { id } = req.params

        try {
            await TeacherRequest.Model.deleteOne({
                _id: id
            })

            return res.status(200).json({
                message: 'Deleted teacher perms request',
                request: null,
            })

        } catch (error) {
            return res.status(500).json({
                message: 'Error delete teacher permission request.',
                error,
            })
        }
    }
)

module.exports = router