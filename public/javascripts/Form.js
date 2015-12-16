$(function () {
    
    function XHRGet(url, cb) {
        var oReq = new XMLHttpRequest();
        oReq.addEventListener('load', cb);
        oReq.open("get", url, true);
        oReq.send();
    }
    
    function XHRPost(url, username ,password, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", url, true);
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        oReq.addEventListener('load', cb);
        oReq.send("username="+username+"&password="+password);
    }

    $('#username').focusout(function (e) {
        var username = e.currentTarget.value;
        if (username && username != "") {
            XHRGet("/api/users/" + username, function resLoginCheck() {
                if (this.responseText == "ok") {
                    $('#username').parent().removeClass('has-error');
                    $('#username').parent().addClass('has-success');
                    $('#errorLogin').hide();
                }
                if (this.responseText == "nok") {
                    $('#username').parent().removeClass('has-success');
                    $('#username').parent().addClass('has-error');
                }
            });
        }
        else {
            $('#username').parent().removeClass('has-success');
            $('#username').parent().addClass('has-error');
        }
        
    });
    
    

    $("#login").submit(function (e) {
        e.preventDefault();
        $('#LoginBtn').addClass('spinner-active');
        XHRGet("/api/users/" + $('#username').val(), function() {
            if (this.responseText == "ok") {
                $('#errorLogin').hide();
                
                if ($('#username').val() != "" && $('#password').val() != "") {
                    var formData = new FormData();
                  
                    XHRPost("/api/users/login", $('#username').val(), $('#password').val(), function () {
                        if (this.responseText == "ok") {
                            $('#LoginBtn').removeClass('spinner-active');
                            $('#LoginBtn').removeClass('btn-primary');
                            $('#LoginBtn').addClass('btn-success');
                            window.location.href = "/";
                        }
                        else {
                            $('#LoginBtn').removeClass('spinner-active');
                            $('#errorLogin').html('<button type="button" data-dismiss="alert" class="close">x</button> The password for this account seems to be incorrect.')
                            $('#errorLogin').show();
                        }
                    });                
                } else {
                    $('#LoginBtn').removeClass('spinner-active');
                    $('#errorLogin').html('<button type="button" data-dismiss="alert" class="close">x</button> Please fill in your password.')
                    $('#errorLogin').show();
                }
            }
            if (this.responseText == "nok") {
                $('#LoginBtn').removeClass('spinner-active');
                $('#errorLogin').html('<button type="button" data-dismiss="alert" class="close">x</button> You don\'t seem to be a user yet, please sign up below.')
                $('#errorLogin').show();
            }
        });
    });
 
    


});

