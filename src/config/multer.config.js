const multer = require('multer');
const fs = require('fs')

const rootUploadsPath = 'tmp/uploads' 
const uploader = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
            const { tempFolder } = req.body
            const folder = `${rootUploadsPath}/${tempFolder}`
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder);
            }
            cb(null, folder)
        },
		filename: (req, file, cb) => {
			//originalname is the uploaded file's name with extn
			cb(null, file.originalname);
		},
	}),
	limits: { fileSize: 1e7 },
});

module.exports = { uploader, rootTempUpload: rootUploadsPath };
