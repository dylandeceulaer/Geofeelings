var multer = require('multer');
var crypto = require('crypto');
var path = require('path');

var fileupload = (function () {
    var filenameOpts = multer.diskStorage({
        destination: function (req, file, next) {
            next(null, 'public/userimages/')
        },
        filename: function (req, file, next) {
            crypto.pseudoRandomBytes(16, function (err, raw) {
                if (err) return next(err)
                
                next(null, raw.toString('hex') + path.extname(file.originalname))
            })
        }
    }),
        fileFilter = function (req, file, cb) {
            var AcceptedFileTypes = ["image/jpeg", "image/gif", "image/png", "image/bmp"]
            console.log(req.user);
            if (req.user && AcceptedFileTypes.indexOf(file.mimetype) > -1) {
                cb(null, true);
            }
            else if (AcceptedFileTypes.indexOf(file.mimetype) == -1 || !req.user) {
                cb(null, false);
            }
            else {
                cb(new Error('Something happened.'));
            }
        };
    return {
        filenameOpts : filenameOpts ,
        fileFilter: fileFilter
    };
})();
module.exports = fileupload;
