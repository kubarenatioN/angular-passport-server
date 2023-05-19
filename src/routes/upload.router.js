const Router = require('express').Router;
const authenticate = require('../middlewares/authenticate.middleware');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const mime = require('mime-types');
const { uploader, rootTempUpload } = require('../config/multer.config')
const { getCurrentUTCTime } = require('../helpers/time.helper');
const { unlink, readdir } = require('fs/promises');
const { SELF_ORIGIN } = require('../config/urls');
const { existsSync, rmSync } = require('fs');
const { getFilenameWithTimestamp } = require('../helpers/common.helper');

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
	moveToRemote
);


router.post(
	'/temp/delete',
	authenticate(),
    deleteTempFile
);

router.get('/files', getFiles)

async function moveToRemote(req, res, next) {
    const { fromFolder, subject } = req.body;
    let { toFolder } = req.body

    if (!toFolder) {
        toFolder = fromFolder
    }
    let move

    if (subject === 'course:build') {
        move = await moveCourseFolderToRemote(fromFolder, toFolder)

    } else if (subject === 'training:task') {
        move = await moveTrainingTaskToRemote(fromFolder)
    } else if (subject === 'personalization:task') {
        move = await moveTrainingTaskToRemote(fromFolder)
    } else if (subject === 'teacher-perms:request-files') {
        move = await moveFolderToRemote(fromFolder)
    } else {
        return res.status(404).json({
            message: 'Incorrect subject'
        })
    }

    const {status, message, result} = move

    return res.status(status).json({
        message,
        result,
    })
}

async function moveCourseFolderToRemote(fromFolder, toFolder) {
    try {
        const readPath = path.join(globalThis.appRoot, rootTempUpload, fromFolder);
        if (!existsSync(readPath)) {
            return {
                message: 'Nothing to move to cloud. No such folder found.',
                status: 204,
                result: {
                    origin: fromFolder
                }
            }
        }
        const typesFolders = await readdir(readPath)
        const results = []
        let total = 0;
        let success = 0;
        let removed = 0;
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
                    try {
                        const upload = await uploadSingleFile({ pathFrom: path.join(fromFolder, filename), uploadFolder, filename })
                        if (upload) {
                            results.push(upload)
                            success++
    
                            // remove file from local after upload to cloud
                            await unlink(path.join(fromFolder, filename))
                            removed++
                        }
                    } catch (error) {
                        console.log('Error upload single file:', error);
                    }
                }
            }
        }

        // remove whole course-build folder
        if (removed === total) {
            rmSync(readPath, {
                recursive: true
            })
            console.log('removed course building root folder:', readPath);
        }
        
        return {
            message: 'Course build files uploaded to cloud',
            status: 200,
            result: {
                results,
                total,
                success,
            },
        }

    } catch (error) {
        return {
            message: 'Error uploading files to cloud.',
            status: 500,
            result: {
                origin: fromFolder,
                error
            },
        }
    }
}

async function moveTrainingTaskToRemote(fromFolder) {
    try {
        const readPath = path.join(globalThis.appRoot, rootTempUpload, fromFolder);
        if (!existsSync(readPath)) {
            return {
                message: 'Nothing to move to cloud. No such folder found.',
                status: 204,
                result: {
                    origin: fromFolder
                }
            }
        }
        const trainingTaskFolder = await readdir(readPath)
        const results = []
        let total = 0;
        let success = 0;
        let removed = 0;
        for (const filename of trainingTaskFolder) {
            total++

            const upload = await uploadSingleFile({ 
                pathFrom: path.join(readPath, filename), 
                uploadFolder: fromFolder, 
                filename
            })

            if (upload) {
                results.push(upload)
                success++

                await unlink(path.join(readPath, filename))
                removed++
            }
        }

         // remove whole profile training tasks folder
         if (removed === total) {
            rmSync(readPath, {
                recursive: true
            })
            console.log('removed folder:', readPath);
        }
        
        return {
            message: 'Training task files uploaded to cloud.',
            status: 200,
            result: {
                results,
                total,
                success,
            },
        }

    } catch (error) {
        if (existsSync(fromFolder)) {
            rmSync(fromFolder, {
                recursive: true
            })
        }
        console.log('Delete training task folder due to cloud upload error:', fromFolder);
        return {
            message: 'Error uploading training files to cloud.',
            status: 500,
            result: {
                origin: fromFolder,
                error
            },
        }
    }
}

async function moveFolderToRemote(fromFolder) {
    try {
        const readPath = path.join(globalThis.appRoot, rootTempUpload, fromFolder);
        if (!existsSync(readPath)) {
            return {
                message: 'Nothing to move to cloud. No such folder found.',
                status: 204,
                result: {
                    origin: fromFolder
                }
            }
        }

        const folder = await readdir(readPath)
        const results = []
        let total = 0;
        let success = 0;
        let removed = 0;

        for (const filename of folder) {
            total++

            const upload = await uploadSingleFile({ 
                pathFrom: path.join(readPath, filename), 
                uploadFolder: fromFolder, 
                filename
            })

            if (upload) {
                results.push(upload)
                success++

                await unlink(path.join(readPath, filename))
                removed++
            }
        }

         // remove whole profile training tasks folder
         if (removed === total) {
            rmSync(readPath, {
                recursive: true
            })
            // console.log('removed folder:', readPath);
        }
        
        return {
            message: 'Folder files uploaded to cloud.',
            fromFolder,
            status: 200,
            result: {
                results,
                total,
                success,
            },
        }

    } catch (error) {
        if (existsSync(fromFolder)) {
            rmSync(fromFolder, {
                recursive: true
            })
        }
        console.log('Delete folder due to cloud upload error:', fromFolder);
        return {
            message: 'Error uploading folder files to cloud.',
            status: 500,
            result: {
                origin: fromFolder,
                error
            },
        }
    }
}

async function deleteTempFile(req, res, next) {
    const { filename, folder, timestamp } = req.body

    try {
        await unlink(`${rootTempUpload}/${folder}/${getFilenameWithTimestamp(filename, timestamp)}`)
        
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
        const message = 'Error upload to cloudinary'
        console.warn(message);
        throw new Error(message)
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
            const readdirPath = `${rootTempUpload}/${folder}`
            const filesFromFolder = await readdir(readdirPath)
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
