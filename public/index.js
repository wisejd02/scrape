$(function() {
    $(".btn").on('click', function(){
        alert("I work");
        console.log($(this).attr("data-image"));
        console.log($(this).attr("data-title"));
        console.log($(this).attr("data-link"));
        // var favItem = {
        //     image: $(this).attr("data-image"),
        //     title: $(this).attr("data-title"),
        //     link: $(this).attr("data-link")
        // }
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
            //   // Empty the notes section
            //   $("#notes").empty();
            });
    });

});