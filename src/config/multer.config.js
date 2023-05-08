const multer = require('multer');
const fs = require('fs');
const { getFilenameWithTimestamp } = require('../helpers/common.helper');

const rootUploadsPath = 'tmp/uploads' 
const uploader = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
            const { tempFolder } = req.body
            const folder = `${rootUploadsPath}/${tempFolder}`
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
            cb(null, folder)
        },
		filename: (req, file, cb) => {
			// fix russian text in filename
			const fixedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8')			

			file.originalname = getFilenameWithTimestamp(fixedOriginalName, req.body.timestamp)

			cb(null, file.originalname);
		},
	}),
	limits: { fileSize: 1e7 },
});

module.exports = { uploader, rootTempUpload: rootUploadsPath };
