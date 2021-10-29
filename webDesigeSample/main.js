$(document).ready(function(){

    $("#addButton").click(function(){
        $("#addModal").modal("show");
        $("#addModalHeader").on("mousedown", function(mousedownEvt) {
            var $draggable = $(this);
            var x = mousedownEvt.pageX - $draggable.offset().left,
                y = mousedownEvt.pageY - $draggable.offset().top;
            $("body").on("mousemove.draggable", function(mousemoveEvt) {
                $draggable.closest(".modal-dialog").offset({
                    "left": mousemoveEvt.pageX - x,
                    "top": mousemoveEvt.pageY - y
                });
            });
            $("body").one("mouseup", function() {
                $("body").off("mousemove.draggable");
            });
            $draggable.closest(".modal").one("bs.modal.hide", function() {
                $("body").off("mousemove.draggable");
            });
        });
    });

});