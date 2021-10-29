//window.onload = function(){alert("Hello jQuery")};
$(document).ready(function(){
    $("a").addClass("test");
    $("a").click(function(event){
        alert("Hello jQuery");
        event.preventDefault();
    });
});
