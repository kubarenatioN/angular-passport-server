const Router = require('express').Router;
const authenticate = require('../middlewares/authenticate.middleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const mime = require('mime-types');

const router = new Router();

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
const imageMimeTypeRegex = /^image\/.+/

const uploader = multer({
	storage: multer.diskStorage({}),
	limits: { fileSize: 1E7 },
});

router.post(
	'/',
	authenticate(),
	uploader.single('file'),
	async (req, res, next) => {
		try {
            const { file } = req
			if (!file) {
				return res.send({
					status: false,
					message: 'No file uploaded',
				});
			} else {
				const { folder } = req.body;
                const uploadOptions = getUploadOptions(file);
				// console.log('uploadOptions:', uploadOptions);

				if (!folder) {
					throw new Error('No folder path provided.');
				}

				const upload = await cloudinary.uploader.upload(file.path, {
                    ...uploadOptions,
                    folder,
				});

				return res.send({
					status: true,
					message: 'File is uploaded',
					data: upload,
				});
			}
		} catch (err) {
			return res.status(500).send(err);
		}
	}
);

router.get('/files', async (req, res) => {
    try {
        let { folder } = req.query;
        folder = decodeURIComponent(folder);
        const data = await cloudinary.search
            .expression(`folder:${folder}`)
            .execute()

        return res.json(data)
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error,
        })
    }
})

function getFileInfo(file) {
    const metadata = getFileMetadata(file)
    const isImage = isFileOfTypeImage(metadata.ext, metadata.mime)
    if (isImage) {
        return {
            metadata,
            type: 'image'
        }
    }
    return {
        metadata,
        type: 'other'
    }
}

function isFileOfTypeImage(ext, mime) {
    return imageExtensions.includes(ext) && imageMimeTypeRegex.test(mime)
}

function getFileMetadata(file) {
    const parsedPath = path.parse(file.originalname)
    const ext = parsedPath.ext.toLowerCase()
    const filename = parsedPath.name
    const m = mime.lookup(file.originalname)
    return { ext, filename, mime: m }
}

function getUploadOptions(file) {
    const { metadata, type } = getFileInfo(file)
    const { filename, ext } = metadata;
    switch (type) {
        case 'image': {
            const publicId = filename
            return {
                public_id: publicId,
                resource_type: 'image'
            }
        }
        case 'other': {
            const publicId = `${filename}${ext}`
            return {
                public_id: publicId,
                resource_type: 'raw'
            }
        }
    
        default: {
            return {}
        }
    }
}

module.exports = router;
