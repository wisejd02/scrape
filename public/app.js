// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {

$(".btn").on('click', function(){
  console.log(this);
  var id = $(this).attr("data-id");
  console.log($(this).attr("data-id"));
  console.log($(this).attr("id"));
  $(".btn").data( "id" ) === $(this).attr("data-id");
  if($(this).attr("id") === 'btnDeleteFavorite'){
    $.ajax({
      method: "POST",
      url: "/removeFavorite",
      data: {_id: $(this).attr("data-id")}
    })
        // Reload the page to get the updated list
        location.reload();
  }else if($(this).attr("id") === 'btnAddNote'){
    var thisId = $(this).attr("data-id");
    $('#myModal').attr("data-id",thisId);
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    }).done(function(data) {
      console.log('data');
      console.log(data);
      $("#divAddNote").append("<div id='divNoteList' data-id=" + thisId +"><ul class='list-group' id='noteList'></ul><div>");
      $("#myModal").modal();
    });
    
  }
})

$('#myModal').on('hidden.bs.modal', function () {
  $("#noteList").html("");
  $("#titleinput").val("");
  $("#bodyinput").val("");
})

$('#myModal').on('show.bs.modal', function () {
  console.log('$(this).attr("data-id")');
  console.log($(this).attr("data-id"));
  var pk = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/notes/" + pk
  }).done(function(data) {
    console.log('show.bs.modaldata');
    populateModal(data);
  })
})

function populateModal(data){
  if(data.length >0){
    $(".modal-title").html(data[0].title);
    console.log('data.note.body');
    console.log(data);
    $.each(data, function( index, value ) {
      console.log(index);
      console.log(value);
      $("#noteList").append("<li class='list-group-item'id='"+index+"'>"+value.body+"</li>")
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
  }
}


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
});

$("#btnNewNote").on("click",function(){
  $("#btnNewNote").hide();
  $('.modal-body li').removeClass('active');
  $("#btnDeleteNote").hide();
  $("#divBody").show(); 
  $("#btnSaveNote").show();
  $("#btnCancelNote").show();
});


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
      body = body
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
          body: body,

          primaryKey: thisId
        }
      })
      $("#titleinput").val("");
      $("#bodyinput").val("");
    }

$("#btnDeleteNote").on("click",function(){
   console.log($(".active").html());
   remArticle = $(".active").html();
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
});

});
