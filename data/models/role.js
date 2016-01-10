var mongoose = require("mongoose");
var roleSchema = require("./schemas/role");
var Role = mongoose.model('Role', roleSchema, "roles");

module.exports = Role;