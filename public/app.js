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
  var id = $(this).attr("data-id");
  console.log($(this).attr("data-id"));
  console.log($(this).attr("id"));
  $(".btn").data( "id" ) === $(this).attr("data-id");
  if($(this).attr("id") === 'btnDeleteFavorite'){
    alert("Removed from your favorites")
  }else if($(this).attr("id") === 'btnAddNote'){
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    }).done(function(data) {
      console.log('data');
      console.log(data);
      $("#divAddNote").append("<div id='divNoteList' data-id=" + thisId +"><ul class='list-group' id='noteList'></ul><div>");
      if(data.note){
        $(".modal-title").html(data.note.title);
        var note = data.note.body.trim().split("|,");
        console.log(note.length);
        console.log(data.note.body);
        $.each(note, function( index, value ) {
          console.log(index);
          console.log(value.split('|').join(""));
          $("#noteList").append("<li class='list-group-item'id='"+index+"'>"+value.split('|').join("")+"</li>")
        });
        $("#btnDeleteNote").hide();
        $("#btnSaveNote").hide();
        $("#btnCancelNote").hide();
        $("#btnNewNote").show();
        $("#divTitle").hide();
        $("#divBody").hide();
      }else{
          $("#btnSaveNote").show();
          $("#btnCancelNote").show();
          $("#btnNewNote").hide();
          $("#btnDeleteNote").hide();
          $(".modal-title").html("No notes for this item!");
          $("#divTitle").show();
          $("#divBody").show(); 
          // $("#noteList").append(`
          //   <div class="input-group form-control">
          //     <input id="titleinput" type="text" placeholder="Enter Title" class="form-control" >
          //   </div>
          //   <div class="input-group form-control">
          //     <input id="bodyinput" type="text" placeholder="Enter Note" class="form-control">
          //   </div>
          // `)
          
      }

      
      $("#myModal").modal();
    });
    
  }
})

$('#myModal').on('hidden.bs.modal', function () {
  $("ul").html("");
  $("#titleinput").val("");
  $("#bodyinput").val("");
})

$('#myModal').on('show.bs.modal', function () {
 
})


// Whenever someone clicks a p tag
$(".modal-body").on("click", "li", function() {
  console.log(this);
  $("#divBody").hide();
  $("#btnNewNote").show();
  $("#btnSaveNote").hide();
  $("#btnCancelNote").hide();
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
  // $("#noteList").append(`
  //   <div class="input-group form-control">
  //     <input id="bodyinput" type="text" placeholder="Enter Note" class="form-control" aria-label="...">
  //   </div>
  // `)
  //$("divTitle").hide();
  $('.modal-body li').removeClass('active');
  $("#btnDeleteNote").hide();
  $("#divBody").show(); 
  $("#btnSaveNote").show();
  $("#btnCancelNote").show();
});

$("#titleinput").on('change',function(){
  console.log($(this).val())
})
$("#bodyinput").on('change',function(){
  console.log($(this).val())
})

    $("#btnSaveNote").on("click",function(){
      $("#btnSaveNote").hide();
      $("#btnCancelNote").hide();
      $("#btnNewNote").show();
     
      var title = $("#titleinput").val();
      var body = $("#bodyinput").val();
      var thisId = $("#divNoteList").attr("data-id");
      console.log(thisId);
      console.log(title);
      console.log(body);
      if(title && body && thisId){
        postNote(title, body, thisId);
      }else if(body && thisId){
        title = $('.modal-title').html();
        console.log(title);
        postNote(title, body, thisId);
      }
      
      
    });

    function postNote(title, body, thisId){
      body = body+"|"
      console.log(thisId);
      console.log(title);
      console.log(body);
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from title input
          title: title,
          // Value taken from note textarea
          body: body
        }
      })
      $("#titleinput").val("");
      $("#bodyinput").val("");
    }

$("#btnDeleteNote").on("click",function(){
   console.log($(".active").html());
   remArticle = $(".active").html()+"|"
   $.ajax({
    method: "POST",
    url: "/removeNote",
    data: {body: remArticle}
  })

});


$("#btnCancelNote").on("click",function(){
  $("#bodyinput").val("");
  $("#btnSaveNote").hide();
  $("#btnCancelNote").hide();
  $("#btnNewNote").show();
  // $("#divTitle").hide();
  // $("#divBody").hide();
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
