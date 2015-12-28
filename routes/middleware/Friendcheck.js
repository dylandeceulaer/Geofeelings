function friendCheck(req, res, next) {
    console.log("heyhey");
    req.targetUser.isFriend = false;
    for (var val in req.targetUser.friends) {
        if (val.user._id == req.user._id)
            req.targetUser.isFriend = true;
    }
    next();
}
module.exports = friendCheck;
