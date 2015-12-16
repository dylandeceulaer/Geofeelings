/* middleware: load_user.js*/
var User = require("../../data/models/user");

function load_user(req, res, next) {
    User.findOne({ username: req.params.name }, function (err, user) {
        if (err) { return next(err);}
        if (!user) {
            return res.send('Not Found', 404);
        } else {
            //user als eigenschap van req aanbrengen, waardoor vlot uitvraagbaar via req
            req.user = user;
            next();        
        }       
    });
}
module.exports = load_user;
