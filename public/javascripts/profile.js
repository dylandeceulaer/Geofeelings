$(function () {
    
    
    //var oReq = new XMLHttpRequest();
    
    //oReq.addEventListener("progress", updateProgress, false);
    //oReq.addEventListener("load", transferComplete, false);
    //oReq.addEventListener("error", transferFailed, false);
    //oReq.addEventListener("abort", transferCanceled, false);
    
    //oReq.open();
    
    // ...
    
    // progress on transfers from the server to the client (downloads)
    function updateProgress(oEvent) {
        if (oEvent.lengthComputable) {
            var percentComplete = oEvent.loaded / oEvent.total;
    // ...
        } else {
    // Unable to compute progress information since the total size is unknown
        }
    }
    
    function transferComplete(evt) {
        alert("The transfer is complete.");
    }
    
    function transferFailed(evt) {
        alert("An error occurred while transferring the file.");
    }
    
    function transferCanceled(evt) {
        alert("The transfer has been canceled by the user.");
    }
    

    $(".img-circle").click(function (e) {
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
                    $(".profile-header").append('<div class="alert alert-dismissible alert-danger">something went wrong.<button type="button" class="close" data-dismiss="alert"> x </button> </div>')
                    
                }
            });
            oReq.send(formData);
        
        });

        
    /*
        var formData = new FormData();
        formData.append("image", file);

        var oReq = new XMLHttpRequest();
        oReq.open("POST", "/api/users/uploadImage", true);
        oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        oReq.addEventListener('load', function (e) {
        
        });
        oReq.addEventListener("progress", function (e) {
        
        }, false);
        oReq.addEventListener("load", function (e) {
        
        }, false);
        oReq.send(formData);
     * */
    });

    
})