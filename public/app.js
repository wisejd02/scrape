// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {
// Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     var image = data[i].image.replace(/'/g,"");
//     // Display the apropos information on the page
//     $("#articles").append("<img src='"+image+"' alt='"+ data[i].image +"' height='142' width='142'><p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link +"</p>");
//   }
// });

$(".btn").on('click', function(){
  //alert("I work");
  console.log(this);
  console.log($(this).attr("data-id"));
  console.log($(this).attr("id"));
  if($(this).attr("id") === 'btnDeleteFavorite'){
    alert("Removed from your favorites")
  }else if($(this).attr("id") === 'btnAddNote'){
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    }).done(function(data) {
      if(data){
        console.log(data);
        $(".modal-title").html(data.note.title);
        var note = data.note.body.trim().split(/\r?\n/);
        console.log(note.length);
        console.log(note);
        $(".modal-body").append("<div id='divNoteList'><ul class='list-group' id='noteList'></ul><div>");
        $.each(note, function( index, value ) {
          $("#noteList").append("<li class='list-group-item'id='"+index+"'>"+value+"</li>")
        });
      }

      
      $("#myModal").modal();
    });
    
  }
})

$('#myModal').on('hidden.bs.modal', function () {
  $(".modal-body").html("");
})

$('#myModal').on('show.bs.modal', function () {
  $("#btnDeleteNote").hide();
  $("#btnSaveNote").hide();
  $("#btnCancelNote").hide();
  $("#btnNewNote").show();
})


// Whenever someone clicks a p tag
$(".modal-body").on("click", "li", function() {
  console.log(this);
  $('.modal-body li').not(this).removeClass('active');
  $(this).toggleClass("active");
  if($( "li" ).hasClass( "active" )){
    $("#btnDeleteNote").show();
  }else{
    $("#btnDeleteNote").hide();
  }

  
  //Empty the notes from the note section
  // $("#notes").empty();
  // // Save the id from the p tag
  // var thisId = $(this).attr("data-id");

  // // Now make an ajax call for the Article
  // $.ajax({
  //   method: "GET",
  //   url: "/articles/" + thisId
  // })
  //   // With that done, add the note information to the page
  //   .then(function(data) {
  //     console.log(data);
  //     // The title of the article
  //     $("#notes").append("<h2>" + data.title + "</h2>");
  //     // An input to enter a new title
  //     $("#notes").append("<input id='titleinput' name='title' >");
  //     // A textarea to add a new note body
  //     $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
  //     // A button to submit a new note, with the id of the article saved to it
  //     $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

  //     // If there's a note in the article
  //     if (data.note) {
  //       // Place the title of the note in the title input
  //       $("#titleinput").val(data.note.title);
  //       // Place the body of the note in the body textarea
  //       $("#bodyinput").val(data.note.body);
  //     }
  //   });
});

$("#btnNewNote").on("click",function(){
  $("#btnNewNote").hide();
  $("#noteList").append(`
    <div class="input-group form-control">
      <input type="text" class="form-control" aria-label="...">
    </div>
  `)
  $("#btnSaveNote").show();
  $("#btnCancelNote").show();
});

$("#btnSaveNote").on("click",function(){
  $("#btnSaveNote").hide();
  $("#btnCancelNote").hide();
  $("#btnNewNote").show();
  $(".input-group").remove();
});

$("#btnCancelNote").on("click",function(){
  $("#btnSaveNote").hide();
  $("#btnCancelNote").hide();
  $("#btnNewNote").show();
  $(".input-group").remove();
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
});
