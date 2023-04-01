const fs = require('../database/firestore');

const trainingAnswers = fs.collection('trainingAnswers')
const trainingThreads = fs.collection('trainingAnswers')
class TrainingController {

    addAnswer = async (req, res) => {
        const { answer } = req.body

        const docRef = await trainingAnswers.add(answer)
        return res.json({
            docId: docRef.data()
        })
    }

}

const controller = new TrainingController()
module.exports = controller