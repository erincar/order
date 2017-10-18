function adjustContainerHeight() {
    $("#container").css("margin-top", $("header").css("height"));
    var wh = $( window ).height();
    var fh = parseFloat( $("footer").css("height") );
    var mt = parseFloat( $("#container").css("margin-top") );
    $("#container").height(wh - fh - mt);
}

var shown_section;

$(function(){
    // Adjust container height according to heights of header and footer
    adjustContainerHeight();

    // When page is loaded, show the 'about' section
    $(document).ready(function(){
        $("#about").show("slow",function(){/*$('#about-resume').height($('#about-summary').height());*/});
        shown_section = "about";
        console.log($('#about-summary').height());
    });

    // When the section links are pressed, show the requested section
    $( ".section-shortcuts > ul > li > a" ).click(function()
    {
        console.log($('#about-summary').height());
        if($(this).text() !== shown_section)
        {
            $("#"+shown_section).hide("slow");
            $( "#"+$(this).text() ).show("slow");
            shown_section = $(this).text();
        }
        else
        {
            var fs = $( "#"+shown_section ).css("font-size");
            $( "#"+shown_section ).animate({fontSize: "24"}, "fast");
            $( "#"+shown_section ).animate({fontSize: fs}, "fast");
        }
    });

    // When the window is resized, re-adjust container height
    $( window ).resize(function() {
        adjustContainerHeight();
    });
});
