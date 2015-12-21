$(function () {
    
    function XHRGet(url, cb) {
        var oReq = new XMLHttpRequest();
        oReq.addEventListener('load', cb);
        oReq.open("get", url, true);
        oReq.send();
    }
    
    function XHRPost(url, param, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", url, true);
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        oReq.addEventListener('load', cb);
        oReq.send(param);
    }
    
    


    $('#username').focusout(function (e) {
        var username = e.currentTarget.value;
        if (username && username != "") {
            XHRGet("/api/users/" + username, function resLoginCheck() {
                if (this.status == 200) {
                    $('#username').parent().removeClass('has-error');
                    $('#username').parent().addClass('has-success');
                    $('#errorLogin').hide();
                }
                if (this.status == 204) {
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
    
    $('#password').focusout(function (e) {
        if($('#password').val() == "") {
            $('#password').parent().addClass('has-error');
        }
        else
            $('#password').parent().removeClass('has-error');
    });

    
    function LengthCheck(id, min, max) {
        if ($(id).val().length <= min) {
            $(id).parent().removeClass('has-success');
            $(id).parent().addClass('has-error');
            $(id).parent().find("p.help-block").text("This field has to contain more than " + min + " characters.");
            $('#RegisterBtn').removeClass('spinner-active');
            return true;

        } else if ($(id).val().length >= max) {
            $(id).parent().removeClass('has-success');
            $(id).parent().addClass('has-error');
            $(id).parent().find("p.help-block").text("This field has to contain less than " + max + " characters.");
            $('#RegisterBtn').removeClass('spinner-active');
            return true;

        } else {
            $(id).parent().removeClass('has-error');
            $(id).parent().addClass('has-success');
            $(id).parent().find("p.help-block").text("");
            return false;
            
        }
    }

    $('#usernamereg').focusout(function (e) {
        if ($('#usernamereg').val() != "") {
            XHRGet("/api/users/" + $('#usernamereg').val(), function resLoginCheck() {
                if (this.status == 200) {
                    $('#usernamereg').parent().removeClass('has-success');
                    $('#usernamereg').parent().addClass('has-error');
                    $('#usernamereg').parent().find("p.help-block").text("This username is already taken.");
                }
                else if (this.status == 204) {
                    LengthCheck("#usernamereg", 3, 50);
                }
            });
        }
        else {
            $('#usernamereg').parent().removeClass('has-success');
            $('#usernamereg').parent().addClass('has-error');
            $('#usernamereg').parent().find("p.help-block").text("This field is required.");
        }
    });
    
    

    $('#name').focusout(function (e) {
        if ($('#name').val() != "") {
            LengthCheck("#name", 4, 50);
        }
        else {
            $('#name').parent().removeClass('has-success');
            $('#name').parent().addClass('has-error');
            $('#name').parent().find("p.help-block").text("This field is required.");
        }
    });
    
    $('#email').focusout(function (e) {
        if ($('#email').val() != "") {
            XHRGet("/api/users/byemail/" + $('#email').val(), function resLoginCheck() {
                if (this.status == 200) {
                    $('#email').parent().removeClass('has-success');
                    $('#email').parent().addClass('has-error');
                    $('#email').parent().find("p.help-block").text("This address is already being used.");
                }
                else if (this.status == 204) {
                    LengthCheck("#email", 5, 50);
                    var patt = new RegExp("^([\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4})?$");
                    if (!patt.test($('#email').val())) {
                        Error = true;
                        $('#email').parent().removeClass('has-success');
                        $('#email').parent().addClass('has-error');
                        $('#email').parent().find("p.help-block").text("The address has to be a correct format.");
                    }
                }
            });
        }
        else {
            $('#email').parent().removeClass('has-success');
            $('#email').parent().addClass('has-error');
            $('#email').parent().find("p.help-block").text("This field is required.");
        }
    });
    
    $('#passwordreg').focusout(function (e) {
        if ($('#passwordreg').val() != "") {
            LengthCheck("#passwordreg", 5, 100);
        }
        else {
            $('#passwordreg').parent().removeClass('has-success');
            $('#passwordreg').parent().addClass('has-error');
            $('#passwordreg').parent().find("p.help-block").text("This field is required.");
        }
    });

    $("#login").submit(function (e) {
        e.preventDefault();
        if ($('#username').val() == "") {
            $('#errorLogin').html('Fill in your username.')
            $('#errorLogin').show();
            $('#username').parent().removeClass('has-success');
            $('#username').parent().addClass('has-error');
        }
        else {
            $('#LoginBtn').addClass('spinner-active');
            XHRGet("/api/users/" + $('#username').val(), function () {
                if (this.status == 200) {
                    $('#errorLogin').hide();
                    
                    if ($('#username').val() != "" && $('#password').val() != "") {
                        var formData = new FormData();
                        
                        XHRPost("/api/users/login", "username=" + $('#username').val() + "&password=" + $('#password').val(), function () {
                            if (this.status == 200) {
                                $('#LoginBtn').removeClass('spinner-active').delay(500).queue(function (next) {
                                    $('#LoginBtn').addClass('spinner-active');
                                    next();
                                });
                                $('#LoginBtn').removeClass('btn-primary');
                                $('#LoginBtn').addClass('btn-success');
                                $('#username').parent().removeClass('has-error');
                                $('#username').parent().addClass('has-success');
                                $('#password').parent().removeClass('has-error');
                                $('#password').parent().addClass('has-success');
                                window.location.href = "/";
                            }
                            else {
                                $('#LoginBtn').removeClass('spinner-active');
                                $('#password').parent().addClass('has-error');
                                $('#errorLogin').html(' The password for this account seems to be incorrect.')
                                $('#errorLogin').show();
                            }
                        });
                    } else {
                        $('#LoginBtn').removeClass('spinner-active');
                        $('#password').parent().addClass('has-error');
                        $('#errorLogin').html(' Please fill in your password.')
                        $('#errorLogin').show();
                    }
                }
                if (this.status == 204) {
                    $('#LoginBtn').removeClass('spinner-active');
                    $('#errorLogin').html(' You don\'t seem to be a user yet, please sign up below.')
                    $('#errorLogin').show();
                }
            });
        }
    });
 
    $("#register").submit(function (e) {
        var Error = false;
        e.preventDefault();
        $('#RegisterBtn').addClass('spinner-active');
        

        if($('#usernamereg').val() != ""){
            XHRGet("/api/users/" + $('#usernamereg').val(), function () {
                if (this.status == 204) {
                    $("#usernamereg").parent().find("p.help-block").text("");
                    if (LengthCheck("#usernamereg", 3, 50) == true) Error = true;
                    console.log("erze: " + Error)
                }
                else if (this.status == 200) {
                    Error = true;
                    $('#usernamereg').parent().removeClass('has-success');
                    $('#usernamereg').parent().addClass('has-error');
                    $('#usernamereg').parent().find("p.help-block").text("This username is already taken.");
                }
            });
        } else {
            Error = true;
            $('#usernamereg').parent().removeClass('has-success');
            $('#usernamereg').parent().addClass('has-error');
            $('#usernamereg').parent().find("p.help-block").text("This field is required");
        }

        if ($('#email').val() != "") {
            XHRGet("/api/users/byemail/" + $('#email').val(), function resLoginCheck() {
                if (this.status == 204) {
                    $("#email").parent().find("p.help-block").text("");
                    var patt = new RegExp("^([\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4})?$");
                    if (!patt.test($('#email').val())) {
                        Error = true;
                        $('#email').parent().removeClass('has-success');
                        $('#email').parent().addClass('has-error');
                        $('#email').parent().find("p.help-block").text("The address has to be a correct format.");
                    }
                    if (LengthCheck("#email", 4, 50) == true) Error = true;

                } else if (this.status == 200) {
                    Error = true;
                    $('#email').parent().removeClass('has-success');
                    $('#email').parent().addClass('has-error');
                    $('#email').parent().find("p.help-block").text("This address is already being used.");
                }
            });
            
        } else {
            Error = true;
            $('#email').parent().removeClass('has-success');
            $('#email').parent().addClass('has-error');
            $('#email').parent().find("p.help-block").text("This field is required");
        }
        
        if ($('#name').val() != "") {
             if (LengthCheck("#name", 4, 50) == true) Error = true;
        } else {
            Error = true;
            $('#name').parent().removeClass('has-success');
            $('#name').parent().addClass('has-error');
            $('#name').parent().find("p.help-block").text("This field is required");
        }
        
        if ($('#passwordreg').val() != "") {
            if (LengthCheck("#passwordreg", 5, 50) == true) Error = true;
        } else {
            Error = true;
            $('#passwordreg').parent().removeClass('has-success');
            $('#passwordreg').parent().addClass('has-error');
            $('#passwordreg').parent().find("p.help-block").text("This field is required");
        }

        if (Error) {
            $('#RegisterBtn').removeClass('spinner-active');
            $('#errorRegister').show();
        } else {
            $('#errorRegister').hide();

            XHRPost("/api/users/signup", "username=" + $('#usernamereg').val() + "&password=" + $('#passwordreg').val()+ "&name=" + $('#name').val() + "&email=" + $('#email').val(), function () {
                if (this.status == 200) {
                    $('#RegisterBtn').removeClass('spinner-active').delay(500).queue(function (next) {
                        $('#RegisterBtn').addClass('spinner-active');
                        next();
                    });
                    $('#RegisterBtn').removeClass('btn-primary');
                    $('#RegisterBtn').addClass('btn-success');
                    window.location.href = "/";
                }
                else if (this.status == 204) {

                }
            });
        }

        /*
         * 
         * var formData = new FormData();
            XHRPost("/api/users/login", $('#username').val(), $('#password').val(), function () {
                if (this.status == 200) {
                    $('#LoginBtn').removeClass('spinner-active').delay(500).queue(function (next) {
                        $('#LoginBtn').addClass('spinner-active');
                        next();
                    });
                    $('#LoginBtn').removeClass('btn-primary');
                    $('#LoginBtn').addClass('btn-success');
                    window.location.href = "/";
                }
                else {
                    $('#LoginBtn').removeClass('spinner-active');
                    $('#errorLogin').show();
                }
            });
         */


    });
    

});

