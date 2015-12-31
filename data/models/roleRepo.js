
var mongoose = require("mongoose");
var findOrCreate = require('mongoose-findorcreate');



RoleRepo = (function () {
    var Role = require("./role.js");
    
    
    var ROLES = {};
    
    ROLES.Admin = {};
    ROLES.Admin.name = "Administrator"
    
    ROLES.SuperAdministrator = {};
    ROLES.SuperAdministrator.name = "Super Administrator"
    
    ROLES.User = {};
    ROLES.User.name = "User"
    

    Role.findOrCreate(
        {name: "Administrator" },
        function (err, res) {
            ROLES.Admin.id = res._id;
        }
    );
    
   Role.findOrCreate(
        { name: " SuperAdministrator" },
        function (err, res) { 
            ROLES.SuperAdministrator.id = res._id;
        }
    );
    Role.findOrCreate(
        { name: "User" },
        function (err, res) {
            ROLES.User.id = res._id;
        }
    );


   
    
    return {
        ROLES : ROLES
    };
})();

module.exports = RoleRepo;