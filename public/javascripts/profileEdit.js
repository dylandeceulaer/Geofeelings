$(function () {
   
    function XHRPost(url, param, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", url, true);
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        oReq.addEventListener('load', cb);
        oReq.send(param);
    }
    
    $(".comment-item .panel-body a").click(function (e) {
        e.preventDefault();
        console.log($(e.target).parent().attr('href').replace("#", ""));
        XHRPost("/api/profile/deleteComment", "id=" + $(e.target).parent().attr('href').replace("#",""), function () {
            if (this.status == 200) {
                $(e.target).parent().parent().parent().parent().parent().remove();
            }
        });
    });
    $(".profile-info-item i.fa-pencil").click(function (e){
        if ($(e.target).hasClass("fa-pencil")) {
            var item = $(e.target).parent().parent().children(".col-xs-8");
            var value = item.html();
            $(e.target).removeClass("fa-pencil").addClass("fa-check");
            item.html("<input type='text' id='editvalue"+item.attr("id")+"' value='" + value + "'/>");
        } else if ($(e.target).hasClass("fa-check")) {
            var item = $(e.target).parent().parent().children(".col-xs-8");
            console.log($(item.attr("id")).val());
            XHRPost("/api/users/update", item.attr("id")+"=" + $("#editvalue" + item.attr("id")).val(), function () {
                if (this.status == 200) {
                    $(e.target).removeClass("fa-check").addClass("fa-pencil");
                    item.html($("#editvalue" + item.attr("id")).val());
                }
            });

        }
    })
    $("#reply").click(function(){
        var comment = $("#replyInput").val();
        if (comment != "") {
            XHRPost("/api/profile/putComment", "owner=" + qryUser._id + "&comment=" + comment, function () {
                if (this.status == 200) {
                    if (user.image) {
                        $('<div class="comment-item"><div class="col-xs-2"><div title="'+ user.username +'" style="background-image: url(/userimages/' + user.image + ')" class="img-circle comment-item-image"></div></div><div class="col-xs-10"><div class="panel"><div class="panel-body">' + comment + '</div></div></div></div>').insertBefore($(".comment-body").children().first());
                    } else {
                        $('<div class="comment-item"><div class="col-xs-2"><div title="' + user.username + '" style="background-image: url(/images/NoPic.jpg)" class="img-circle comment-item-image"></div></div><div class="col-xs-10"><div class="panel"><div class="panel-body">' + comment + '</div></div></div></div>').insertBefore($(".comment-body").children().first());
                    }
                    $(".comment-body > .col-xs-12 > .empty" ).remove();
                    $("#replyInput").val("");
                }
            });
        }
    });
    $(".img-circle.profile-pic").click(function (e) {
        $('#ProfileImage').trigger('click');
        $('#ProfileImage').change(function () {

            var file = $(this)[0].files[0];

            var formData = new FormData();
            formData.append("image", file);

            var oReq = new XMLHttpRequest();
            oReq.open("POST", "/api/users/uploadImage", true);
            oReq.addEventListener('load', function () {

                if (this.status == 200) {
                    $(".img-circle.profile-pic.editable").css("background-image", "url(/userimages/" + this.responseText + ")");
                } else if (this.status == 204) {
                    console.log("hey");
                    $(".profile-header").append('<div class="alert alert-dismissible alert-danger">something went wrong.<button type="button" class="close" data-dismiss="alert"> x </button> </div>');
                }
            });
            oReq.send(formData);
        
        });
    });
    $(".friend-item i.fa").click(function (e){
        var item = $(e.target);
        var id = item.parent().attr("id");
        
        if (item.hasClass("fa-check")) {
            XHRPost("/api/users/acceptFriendship", "id=" + id, function () {
                if (this.status == 200) {
                    if ($("#friends-accepted").children().first().length > 0)
                        $(item.parent().parent().parent().html()).insertBefore($("#friends-accepted").children().first()).children().last().remove();
                    else
                        $("#friends-accepted").append(item.parent().parent().parent().html()).children().first().children().last().remove();
                    item.parent().parent().remove();
                }
            });
        }
        else if (item.hasClass("fa-times")) {
            XHRPost("/api/users/denyFriendship", "id=" + id, function () {
                if (this.status == 200) {
                    console.log("success");
                    item.parent().parent().remove();
                }
            });
        }
        console.log(id);
    });

    $(".profile-heading i").click(function (e) {
        XHRPost("/api/users/addFriend", "id=" + $(e.target).attr("id"), function () {
            if (this.status == 200) {
                $(e.target).remove();
            }
        });
    });
    $("#AvailableCheckbox").change(function (e) {
        
        XHRPost("/api/users/setAvailabilityState", "state=" + $(e.target).is(":checked"), function () {
            if (this.status == 200) {
                console.log("ok");
            }
        });
    });
    
})