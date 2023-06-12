const Router = require('express').Router;
const progressController = require('../controllers/progress.controller');

const router = Router();

router.post('/', progressController.addQuizRecord)

module.exports = router