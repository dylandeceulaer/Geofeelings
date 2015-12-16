/*
 * index.js
 * namespace: client
 * subject: sockets vervangen de XMLHTTP communicatie
 * 
 */


window.console ? window.console.log("index.js loaded") : null;

var client = {};

client.api = (function () {
    var showMessage = function (message, id) {
        document.getElementById(id).innerHTML = message;
    };
    
    var getUsersbyAPI = function (url) {
        var xhr = new XHR();        return (xhr.responsData);
    };
    
    var addHandlers = function () {
        document.getElementById("btnCreate").addEventListener("click", function (event) {
            var form = document.getElementsByTagName("form")[0];
            //event.preventDefault();
            //vergeet ook de hidden (required) fields niet!                    
            console.log("creating ", form.name.value)
            //A. Indien create via sockets:              
            socket.emit("newUser", JSON.stringify({
                "username": form.username.value , 
                "name": form.name.value,
                "email": form.email.value,
                "gender": form.gender.value
            }))
                              
            //B.  Indien create via een submit
                //  form.submit();             
        });
    };
    
    var start = function () {
        document.addEventListener("DOMContentLoaded", function (event) {
            console.log("DOM fully loaded and parsed");
            addHandlers();
        });
    };
    
    return {
        start: start, //DOM laden
        getUsersbyAPI : getUsersbyAPI,
        showMessage: showMessage
    }

})();

client.api.start();   