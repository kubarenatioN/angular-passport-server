const fs = require('../database/firestore');

class TrainingController {
    trainingThreadsCol = fs.collection('trainingThreads')

    test = async (req, res) => {
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

const controller = new TrainingController()
module.exports = controller