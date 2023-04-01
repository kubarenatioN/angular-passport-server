const { query, where, getDoc } = require('firebase/firestore')
const fs = require('../database/firestore')

const courseRunsCol = fs.collection('courseRuns')

class CourseRunController {
        
    createCourseRun = async (course) => {
        return courseRunsCol.add({
            courseId: course.id,
            isActive: true,
            startDate: course.createdAt,
        })
    }

    getCourseRun = async (courseId) => {
        const q = query(courseRunsCol, where('id', '==', courseId))
        return courseRunsCol.get(q);
    }

    get = async (id) => {
        const docRef = courseRunsCol.doc(id);
        const doc = await getDoc(docRef)
        return doc.data()
    }
}

const controller = new CourseRunController()

module.exports = controller