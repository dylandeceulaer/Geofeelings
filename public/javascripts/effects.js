$(function () {
    $('a.page-scroll').bind('click', function (event) {
        
        if ($(event.target).hasClass('btn-circle')) {
            $('li').removeClass('active');
            $("#Login").parent().addClass('active');
        }
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
    $('li.page-scroll>a').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo').queue(function (next) {
            $("li.page-scroll").removeClass("active");
            $("li.page-scroll > a[href="+ $anchor.attr('href')+"]").parent().addClass("active"); next();
        });
        event.preventDefault();
        if ($(event.target).attr('href') == "#next") {
            $("#login").queue(function (next) {
                $(this).addClass("formAlert"); next();
            }).delay(200).queue(function (next) {
                $(this).removeClass("formAlert"); next();
            });
        }

        if ($(event.target).attr('href') == "#next2") {
            $("#register").queue(function (next) {
                $(this).addClass("formAlert"); next();
            }).delay(200).queue(function (next) {
                $(this).removeClass("formAlert"); next();
            });
        }

    });

    $(document).on("scroll", function (e) {
        var scrollPos = $(document).scrollTop()+190;
        
        var home =  $(".PageFiller.map").position().top + $(".PageFiller.map").height() + $(".PageFiller.map").offset().top;
        var login = $("#login").position().top + $("#login").height() + $("#login").offset().top-100;
        var register = $("#register").position().top + $("#register").height() + $("#register").offset().top -400;
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
        if (scrollPos >= register ) {
            $('ul.nav > li').removeClass("active");
            $('ul.nav > li > a[href="#info"]').parent().addClass("active");
        }

        console.log(register);
        console.log(scrollPos);
        
    
    });


});

