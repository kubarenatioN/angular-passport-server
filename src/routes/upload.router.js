const Router = require('express').Router;
const authenticate = require('../middlewares/authenticate.middleware');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const mime = require('mime-types');
const { uploader, rootTempUpload } = require('../config/multer.config')
const { getCurrentUTCTime } = require('../helpers/time.helper');
const { unlink } = require('fs/promises');

const router = new Router();

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
const imageMimeTypeRegex = /^image\/.+/

router.post(
	'/',
	authenticate(),
	uploader.single('file'),
    async (req, res) => {
        const { tempFolder } = req.body
        const { filename } = req.file
        return res.json({
            message: 'Temp upload success',
            tempFolder,
            file: {
                filename,
                uploadedAt: getCurrentUTCTime(),
            }
        })
    }
);

router.post(
	'/remote',
	authenticate(),
	uploadCloudinary
);

router.post(
	'/clear',
	authenticate(),
    clearTempFolder
);

router.post(
	'/temp/delete',
	authenticate(),
    deleteTempFile
);

router.get('/files', getFiles)

async function uploadCloudinary(req, res, next) {
    const { tempFolder } = req.body;
    console.log(tempFolder);
    try {
        const { file } = req
        if (!file) {
            return res.status(404).send({
                message: 'No file provided.',
            });
        } else {
            console.log(file);
            const { folder } = req.body;
            const uploadOptions = getUploadOptions(file);

            if (!folder) {
                throw new Error('No folder path provided.');
            }

            const upload = await cloudinary.uploader.upload(file.path, {
                ...uploadOptions,
                folder,
            });

            return res.send({
                message: 'File uploaded',
                data: upload,
            });
        }
    } catch (err) {
        return res.status(500).send(err);
    }
}

async function clearTempFolder(req, res, next) {
    const { tempFolder } = req.body

    // Remove files here

    return res.status(200).json({
        message: 'Cancel upload',
        folder: tempFolder
    })
}

async function deleteTempFile(req, res, next) {
    const { filename, folder } = req.body

    try {
        await unlink(`${rootTempUpload}/${folder}/${filename}`)
        
        return res.status(200).json({
            message: 'Success delete temp file',
            folder,
            filename
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting temp file.'
        })
    }
}

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

async function getFiles(req, res, next) {
    try {
        let { folder, type } = req.query;
        if (type === 'remote') {
            folder = decodeURIComponent(folder);
            const data = await cloudinary.search
                .expression(`folder:${folder}`)
                .execute()
                
            return res.json(data)
        }
        else if (type === 'temp') {
            console.log(folder);
            return res.json({
                message: 'Get files from temp.'
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error,
        })
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
