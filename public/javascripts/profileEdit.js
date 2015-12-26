$(function () {

    function XHRPost(url, param, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", url, true);
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        oReq.addEventListener('load', cb);
        oReq.send(param);
    }
    
    $(".comment-item a").click(function (e) {
        e.preventDefault();
        console.log($(e.target).parent().attr('href').replace("#", ""));
        XHRPost("/api/profile/deleteComment", "id=" + $(e.target).parent().attr('href').replace("#",""), function () {
            if (this.status == 200) {
                $(e.target).parent().parent().parent().parent().parent().remove();
            }
        });
    });

    $("#reply").click(function(){
        var comment = $("#replyInput").val();
        if (comment != "") {
            XHRPost("/api/profile/putComment", "owner=" + qryUser._id + "&comment=" + comment, function () {
                if (this.status == 200) {
                    $('<div class="comment-item"><div class="col-xs-2"><div style="background-image: url(/userimages/' + user.image + ')" class="img-circle comment-item-image"></div></div><div class="col-xs-10"><div class="panel"><div class="panel-body">' + comment + '</div></div></div></div>').insertBefore($(".comment-body").children().first());
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

    
})