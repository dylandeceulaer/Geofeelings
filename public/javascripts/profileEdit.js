$(function () {

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
                    $(".img-circle").css("background-image", "url(/userimages/" + this.responseText + ")");
                } else if (this.status == 204) {
                    console.log("hey");
                    $(".profile-header").append('<div class="alert alert-dismissible alert-danger">something went wrong.<button type="button" class="close" data-dismiss="alert"> x </button> </div>');
                }
            });
            oReq.send(formData);
        
        });
    });

    
})