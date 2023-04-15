const Router = require('express').Router;
const authenticate = require('../middlewares/authenticate.middleware');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const mime = require('mime-types');
const { uploader, rootTempUpload } = require('../config/multer.config')
const { getCurrentUTCTime } = require('../helpers/time.helper');
const { unlink, readdir } = require('fs/promises');
const { SELF_ORIGIN } = require('../config/urls');
const { existsSync } = require('fs');

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
	uploadToRemote
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

async function uploadToRemote(req, res, next) {
    const { fromFolder } = req.body;
    let { toFolder } = req.body
    if (!toFolder) {
        toFolder = fromFolder
    }

    try {
        const readPath = path.join(globalThis.appRoot, rootTempUpload, fromFolder);
        if (!existsSync(readPath)) {
            return res.status(200).json({
                message: 'Nothing to move to cloud. No such folder found.'
            })
        }
        const typesFolders = await readdir(readPath)
        const results = []
        let total = 0;
        let success = 0;
        for (const typeFolder of typesFolders) {
            // folder of type, e.g. 'tasks', 'topics'
            const filesFolders = await readdir(path.join(readPath, typeFolder))
            for (const filesFolder of filesFolders) {
                // closest folder to files, name is a uuid of form control
                const fromFolder = path.join(readPath, typeFolder, filesFolder)
                const uploadFolder = path.join(toFolder, typeFolder, filesFolder)
                const files = await readdir(fromFolder)

                for (const filename of files) {
                    total++
                    const upload = await uploadSingleFile({ pathFrom: path.join(fromFolder, filename), uploadFolder, filename })
                    if (upload) {
                        success++
                        results.push(upload)
                    }
                }
            }
        }

        return res.status(200).send({
            message: 'Files uploaded to cloud',
            res: results,
            total,
            success
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Error uploading files to cloud.',
            err,
            origin: fromFolder
        });
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

async function uploadSingleFile({ pathFrom, uploadFolder, filename }) {
    if (!uploadFolder) {
        throw new Error('No folder path provided.');
    }
    
    const options = getUploadOptions(filename);

    let uploaded = null
    try {
        uploaded = await uploadCloudinary(pathFrom, uploadFolder, options)
    } catch (error) {
        console.warn('Error upload to cloudinary');        
    }

    return uploaded
}

async function uploadCloudinary(pathFrom, uploadFolder, options) {
    const folder = String(uploadFolder).replace(/\\/g, '/')
    const upload = await cloudinary.uploader.upload(pathFrom, {
        ...options,
        folder,
    });

    return upload
}

async function getFiles(req, res, next) {
    let { folder, type } = req.query;
    try {
        folder = decodeURIComponent(folder);
        if (type === 'remote') {
            const data = await cloudinary.search
                .expression(`folder:${folder}`)
                .execute()
                
            return res.status(200).json(data)
        }
        else if (type === 'temp') {
            const filesFromFolder = await readdir(`${rootTempUpload}/${folder}`)
            const files = []
            for (const filename of filesFromFolder) {
                files.push({
                    filename,
                    url: getLocalFileUrl(folder, filename)
                })
            }

            return res.status(200).json({
                message: 'Get files from local server.',
                files,
                total: files.length,
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Get files error',
            error,
            source: type
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

function getLocalFileUrl(folder, filename) {
    return `${SELF_ORIGIN}/local/${folder}/${filename}`
}

function isFileOfTypeImage(ext, mime) {
    return imageExtensions.includes(ext) && imageMimeTypeRegex.test(mime)
}

function getFileMetadata(filename) {
    const parsedPath = path.parse(filename)
    const ext = parsedPath.ext.toLowerCase()
    const m = mime.lookup(filename)
    return { ext, filename: parsedPath.name, mime: m }
}

function getUploadOptions(filename) {
    const { metadata, type } = getFileInfo(filename)
    const { filename: publicFilename, ext } = metadata;

    switch (type) {
        case 'image': {
            return {
                public_id: publicFilename,
                resource_type: 'image'
            }
        }
        case 'other': {
            let publicId = `${publicFilename}${ext}`
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
