var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var RoleSchema = new mongoose.Schema({
    name: { type: String, required: true,unique:true }
});
RoleSchema.plugin(findOrCreate);


module.exports = RoleSchema;