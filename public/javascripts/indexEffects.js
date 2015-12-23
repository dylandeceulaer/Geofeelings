$(function () {
    
    $(document).on("scroll", function (e) {
        var scrollPos = $(document).scrollTop() + 190;
        
        var home = $(".PageFiller.map").position().top + $(".PageFiller.map").height() + $(".PageFiller.map").offset().top;
        var login = $("#login").position().top + $("#login").height() + $("#login").offset().top - 100;
        var register = $("#register").position().top + $("#register").height() + $("#register").offset().top - 400;
        var info = $(".PageFiller.info").position().top + $(".PageFiller.info").height() + $(".PageFiller.info").offset().top;
        
        
        console.log($("#home").offset())
        if (scrollPos <= home) {
            $('ul.nav > li').removeClass("active");
            $('ul.nav > li > a[href="#home"]').parent().addClass("active");
        }
        if (scrollPos >= home && scrollPos <= login) {
            $('ul.nav > li').removeClass("active");
            $('ul.nav > li > a[href="#next"]').parent().addClass("active");
        }
        if (scrollPos >= login && scrollPos <= register) {
            $('ul.nav > li').removeClass("active");
            $('ul.nav > li > a[href="#next2"]').parent().addClass("active");
        }
        if (scrollPos >= register) {
            $('ul.nav > li').removeClass("active");
            $('ul.nav > li > a[href="#info"]').parent().addClass("active");
        }
        
       
        
    
    });


});

