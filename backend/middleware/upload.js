const path = require('path');
const multer = require('multer');
const fs = require('fs');

const ensureDir = (relativePath) => {
    const absolute = path.join(__dirname, '..', relativePath);
    if (!fs.existsSync(absolute)) {
        fs.mkdirSync(absolute, { recursive: true });
    }
    return absolute;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'boleta') {
            return cb(null, ensureDir('uploads/boletas'));
        }
        return cb(null, ensureDir('uploads/documentos'));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname || '');
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

module.exports = upload;
