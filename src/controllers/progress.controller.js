const fs = require('../database/firestore');
const { query } = require('firebase/firestore')

const progressCol = fs.collection('courseProgress')

class ProgressController {

    get = async (data) => {
        const { courseRunId, studentId } = data;
        const q = query('courseRunId', '==', courseRunId)    
        const progress = await progressCol.get(q);
        console.log(progress);
        if (!progress.id) {
            return progressCol.add({
                courseRunId,
                studentId
            })
        }
        return progress;
    }

    addRecord = async (req, res) => {
        const { answer } = req.body
        
        const { id, path } = await this.trainingThreadsCol.add({
            test: 'yes',
            age: 123
        })
        return res.json({
            doc: {
                id,
                path
            }
        })
    }

}

const controller = new ProgressController()
module.exports = controller