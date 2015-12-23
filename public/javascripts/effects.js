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


});

