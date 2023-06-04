const { getCurrentUTCTime } = require('../../helpers/time.helper');
const { generateUUID } = require('../../helpers/common.helper');
const CoursesBundle = require('../../models/courses-bundle.model');
const User = require('../../models/user.model');


class CoursesBundleController {

  getById = async (req, res) => {
    const { id } = req.params

    try {
      const bundle = await CoursesBundle.Model.findOne({
        uuid: id
      }).populate('courses')

      const authors = await User.Model.find({
        permission: 'teacher',
        uuid: bundle.courses.map(c => c.authorId)
      })

      bundle.courses.forEach((c, i, arr) => {
        const courseAuthor = authors.find(a => a.uuid === c.authorId)
        arr[i]._doc.author = {
          photo: courseAuthor.photo,
          username: courseAuthor.username,
        }
      })
      
      return res.status(200).json({
        message: 'Get bundle.',
        data: bundle
      })
    } catch (error) {
      return res.status(500)
    }
  }

  get = async (req, res) => {
    const { uuids, authorId, populate, courseFields } = req.query

    try {
      const query = {}
      if (authorId) {
        query['authorId'] = authorId
      }
      if (uuids) {
        query['uuid'] = uuids.split(',')
      }

      let populateObj = populate ?? [
        {
          path: 'courses',
          model: 'Course',
          select: courseFields?.split(',') ?? ['title', 'uuid', 'banner']
        },
      ]

      const data = await CoursesBundle.Model.find(query).populate(populateObj)

      return res.status(200).json({
        message: 'Get bundles.',
        data,
      })
    } catch (error) {
      return res.status(500)
    }
  }

  create = async (req, res) => {
    const { bundle } = req.body

    try {
      const created = await (new CoursesBundle.Model({
        uuid: generateUUID(),
        title: bundle.title,
        description: bundle.description,
        authorId: bundle.authorId,
        courses: bundle.courses,
      })).save()

      return res.status(200).json({
        message: 'Courses bundle created!',
        bundle: created
      })
    } catch (error) {
      return res.status(500).json({
        message: 'Error creating course bundle.',
        error
      })
    }
  }
}

const controller = new CoursesBundleController();

module.exports = controller;
