/*
 * userController voor angular
 * 
 * 
 */

(function (app) {
    'use strict';
    // 1. Controller toevoegen aan de app module met dependancies & contstante waarden
    // app.controller('userController', userController);
    app.controller('userController', ['$location', '$http', '$routeParams', 'GLOBALS','userService', userController]);// Handler achteraan
    
    app.constant('GLOBALS', {
        apiUrl: 'http://localhost:1337/api/users'
    });
        
    //2. definieer controller (initialisatie vd handler)
    function userController($location, $http, $routeParams, GLOBALS, userService) {
        console.log("userController initialised");
        // 1. cache de huidige controller ('this') in een variabele vm (=ViewModel)
        var vm = this;
       // vm.userName = $routeParams.username;
        
        //2. zelf data toevoegen
        vm.msg = 'Ook de userController (ng) verwelkomt jou.';
        
        //4. Gegevens uit de svc ophalen en toekennen aan variabelen via Promises
        vm.users = userService.getUsers()
        .success(function (data) {
            vm.users = data;
            userService.users = data;  //lokaal details invullen/opvragen
        })
        .error(function (error, status) {
            alert('Er is een fout opgetreden: ' + err? err: " Is MongoDB beschikbaar?");
            vm.status = 'Unable to load  data: ' + error.message;
            
        });
    }

    //ALTERNATIEF:
   // angular.module('myApp').controller('myCtrl', function ($scope) { $scope.users = []});


})(angular.module('myApp')); //ophalen van de app module myApp niet vergeten