// Back swipe gesture — swipe right from left edge to go back
(function () {
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTarget = null;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTarget = e.target;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        var deltaX = e.changedTouches[0].screenX - touchStartX;
        var deltaY = Math.abs(e.changedTouches[0].screenY - touchStartY);

        // Start within 40px of left edge, swipe right ≥80px, mostly horizontal
        if (touchStartX < 40 && deltaX > 80 && deltaY < Math.abs(deltaX) * 0.6) {
            // Skip if the swipe started inside a carousel or project section
            if (!touchStartTarget.closest('.carousel') && !touchStartTarget.closest('.project-open-card')) {
                history.back();
            }
        }
    }, { passive: true });
})();

// Parallax effect for floating shapes
window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    document.querySelectorAll('.floating-shape').forEach((el, i) => {
        const speed = 0.12 + i * 0.07;
        el.style.transform = `translateY(${scrollY * speed}px)`;
    });
});

// Animate hero tags on load
document.addEventListener('DOMContentLoaded', function() {
    const tags = document.querySelectorAll('.hero-tag');
    if (tags[0]) tags[0].classList.add('animated');
    if (tags[1]) setTimeout(() => tags[1].classList.add('animated', 'delay'), 300);
});
// Animate on scroll for modern interactive effect
document.addEventListener('DOMContentLoaded', function() {
    const animatedEls = document.querySelectorAll('.animate-on-scroll');
    function animateOnScroll() {
        animatedEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 80) {
                el.classList.add('visible');
            }
        });
    }
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
});
'use strict'; 
$(window).load( function() {	
    

    // LIGHTBOX VIDEO
    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});
        
//PRELOADER
    setTimeout(function() {
        $("body").addClass("is-loaded");
        $(".loader-wrapper").fadeOut(450);
    }, 900);

    

    // PORTFOLIO ISOTOPE
if ($('.isotope_items').length) {

     var $container = $('.isotope_items');
     $container.isotope();

    $('.portfolio_filter ul li').on("click", function(){
        $(".portfolio_filter ul li").removeClass("select-cat");
        $(this).addClass("select-cat");				 
        var selector = $(this).attr('data-filter');
        $(".isotope_items").isotope({
            filter: selector,
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false,
            }
    });
        return false;
    });  
    
}
    
}); // window load end 



$(document).ready( function() {	
    
    
    // WOW JS
    new WOW({ mobile: false }).init();
    
    
      
    //SMOOTH SCROLL
    $(document).on("scroll", onScroll);
    $('a[href^="#"]').on('click', function (e) {
        var target = $(this.hash);
        if (!this.hash || !target.length) {
            return;
        }

        e.preventDefault();
        $(document).off("scroll");
        
        $('a').each(function () {
            $(this).removeClass('active');
             if ($(window).width() < 768) {
                 $('.nav-menu').slideUp();
             }
        });
            
        $(this).addClass('active');
      
        $('html, body').stop().animate({
            'scrollTop': target.offset().top+2
        }, 500, 'swing', function () {
            window.location.hash = target.selector;
            $(document).on("scroll", onScroll);
        });
    });
    
        
        function onScroll(event){
          if ($('#home').length) {     
    var scrollPos = $(document).scrollTop();
    $('nav ul li a').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));
        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $('nav ul li a').removeClass("active");
            currLink.addClass("active");
        }
        else{
            currLink.removeClass("active");
        }
    });
   }              
}


    
    
    //NAVBAR SHOW - HIDE
    $(window).scroll(function() {
        var legacyNav = $("nav").not(".modern-navbar");
        var homeSection = $(".home");

        if (!legacyNav.length || !homeSection.length) {
            return;
        }

        var scroll = $(window).scrollTop();
        var homeheight = homeSection.height() - 86;

        if (scroll > homeheight) {
            legacyNav.slideDown(100);
        } else {
            legacyNav.slideUp(100);
        }
     }); 
    
    	
 // RESPONSIVE MENU
$('.responsive').on('click', function (e) {
        $('.nav-menu').slideToggle();
    });
    
    
    // HOME PAGE HEIGHT
     function centerInit() {
        var hometext = $('.home')

        hometext.css({
            "height": $(window).height() + "px"
        });
    }
    centerInit();
    $(window).resize(centerInit);
    
    
    // HOME TYPED JS
    if ($('.element').length) {
        $('.element').each(function () {
            $(this).typed({
                strings: [$(this).data('text1'), $(this).data('text2')],
                loop: $(this).data('loop') ? $(this).data('loop') : false ,
                backDelay: $(this).data('backdelay') ? $(this).data('backdelay') : 2000 ,                
                typeSpeed: 10,
            });
        });
    }
 
    
    
    // MAGNIFIC POPUP FOR PORTFOLIO PAGE
    $('.link').magnificPopup({
        type:'image',
        gallery:{enabled:true},
        zoom:{enabled: true, duration: 300}
    });
    
       // OWL CAROUSEL GENERAL JS
    var owlcar = $('.owl-carousel');
    if (owlcar.length) {
        owlcar.each(function () {
            var $owl = $(this);
            var itemsData = $owl.data('items');
            var autoPlayData = $owl.data('autoplay');
            var paginationData = $owl.data('pagination');
            var navigationData = $owl.data('navigation');
            var stopOnHoverData = $owl.data('stop-on-hover');
            var itemsDesktopData = $owl.data('items-desktop');
            var itemsDesktopSmallData = $owl.data('items-desktop-small');
            var itemsTabletData = $owl.data('items-tablet');
            var itemsTabletSmallData = $owl.data('items-tablet-small');
            $owl.owlCarousel({
                items: itemsData
                , pagination: paginationData
                , navigation: navigationData
                , autoPlay: autoPlayData
                , stopOnHover: stopOnHoverData
                , navigationText: ["<", ">"]
                , itemsCustom: [
                    [0, 1]
                    , [500, itemsTabletSmallData]
                    , [710, itemsTabletData]
                    , [992, itemsDesktopSmallData]
                    , [1199, itemsDesktopData]
                ]
            , });
        });
    }
    
    
}); // document ready end 



/* Contact Form JS*/
(function($){
   'use strict'; 
   
   $(".contact-form").on('submit', function(e){
        e.preventDefault();
        
        var uri = $(this).attr('action');
        $("#con_submit").val('Wait...');
        var con_name = $("#con_name").val();
        var con_email = $("#con_email").val();
        var con_message = $("#con_message").val();
        
        var required = 0;
        $(".required", this).each(function() {
            if ($(this).val() == '')
            {
                $(this).addClass('reqError');
                required += 1;
            }
            else
            {
                if ($(this).hasClass('reqError'))
                {
                    $(this).removeClass('reqError');
                    if (required > 0)
                    {
                        required -= 1;
                    }
                }
            }
        });
        if (required === 0)
        {
            $.ajax({
                type: "POST",
                url: 'mail.php',
                data: {con_name: con_name, con_email: con_email, con_message: con_message},
                success: function(data)
                {
                    $(".contact-form input, .contact-form textarea").val('');
                    $("#con_submit, .sitebtn").val('Done!');
					$("#con_submit .sitebtn").addClass("ok");
                }
            });
        }
        else
        {
            $("#con_submit, .sitebtn").val('Failed!');
        }
   });
   $(".required").keyup(function() {
        $(this).removeClass('reqError');
    });
   
})(jQuery);