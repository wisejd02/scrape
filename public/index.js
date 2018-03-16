$(function() {
    $(".btn").on('click', function(){
        $.ajax({
            method: "POST",
            url: "/favorites",
            data: {
                image: $(this).attr("data-image"),
                title: $(this).attr("data-title"),
                link: $(this).attr("data-link")
            }
          })
            // With that done
            .then(function(data) {
              // Log the response
              console.log(data);
            });
    });

});