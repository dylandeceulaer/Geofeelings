/*
 * 
*userService.js
*/
(function (app) {
    'use strict';
    
    //1. Declaratie van de personService
    //angular.module('myApp').service('userService', userService);
    app.service('userService', ['$http', 'GLOBALS',userService]);
    
    //2. Implementatie van userService
    function userService($http, GLOBALS){         
        //Call de API m.b.v. methods in deze service.
        this.getUsers = function () {           
            var apiUsers = $http({
                method: 'GET',  
                url: GLOBALS.apiUrl + "/",             
                cache: false // <== true voorkomt extra http-call door gegevens te cachen
            });;
            
            //lokaal inladen via een Promise in de controller-> minder trafiek cb(err,data)
            return apiUsers;
        }
    }
})(angular.module('myApp')); //myApp initialiseren