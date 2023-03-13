const Router = require('express').Router;
const authenticate = require('../middlewares/authenticate.middleware');

const UPLOAD_ROOT = 'uploads'
const router = new Router();

router.post('/', authenticate(), async (req, res, next) => {
	try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let { file } = req.files;
            const { folder } = req.body

            if (!folder) {
                throw new Error('No folder path provided.')
            }

            //Use the mv() method to place the file in the upload directory (i.e. "uploads")
            file.mv(`./${UPLOAD_ROOT}/${folder}/${file.name}`);

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
