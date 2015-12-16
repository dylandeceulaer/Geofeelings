/**
 * Initialisatie angular
 * 
 */
(function () {
    'use strict';
    
    //1. app globaal, definiëren inclusief config 
    var app = angular.module('myApp', []);
    
   app = angular.module('myApp', ['ngRoute']).config(moduleConfig); //alleen voor ngRoute dependancies
    console.log("myApp is configured (ng).")  
    //2. inject dependencies op moduleConfig
    moduleConfig.$inject = ['$routeProvider', '$locationProvider'];
    
    //3. XDomain configureren
    app.config(function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true; //Enable cross domain calls
        delete $httpProvider.defaults.headers.common['X-Requested-With']; //AJAX header    
    });
    
    //4. routes configureren   
    //app.config(function ($routeProvider, $locationProvider) {
    function moduleConfig($routeProvider, $locationProvider) {
        $routeProvider
      .when('/', {
            templateUrl: "views/users/home.html", 
            //templateUrl: 'users/index',
            controller: 'userController',
            controllerAs: 'userCtrl'  //in de partialviews
        })
     .otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true);
    };

})();