var devices = [];
var ipAddresses = [];

function eventSettig(){
    $('#addButton').click(function() {
        //open modal
        console.log("click!!");
        $('#addModal').modal({
          backdrop: false,
          show: true
        });
        $('#addModal').draggable({
          cursor: "move",
          handle: ".dragable_touch"
        });
      });
    
    $('#saveBtn').click(function(){
        console.log("save click");
        let name = $('#Name').val();
        let ipAddr = $('#IP').val();
        let msg = '';
        
        if(name == "" || ipAddr == ""){
            $('#foot').text("Wrong message");
        }else{
            devices.push(name);
            ipAddresses.push(ipAddr);
            msg = ' <div class="col-md-6">Device name</div><div class="col-md-6">IP Address</div>';
            for(let i=0; i<devices.length; i++){
                console.log(devices[i]);
                msg = msg + '<div class="col-md-6 custom-grid">' + devices[i] + 
                            '</div><div class="col-md-6 custom-grid">' + ipAddresses[i] + '</div>'
                $('#msg').html(msg);
            }

            $('#Name').val("");
            $('#IP').val("");
            $('#addModal').modal('hide');
        }
    })

    $('#closeBtn').click(function(){
        $('#foot').text("");
    })

    $('#resetBtn').click(function() {
        let msg = ' <div class="col-md-6">Device name</div><div class="col-md-6">IP Address</div>';
        $('#msg').html(msg);
      });
};

$(document).ready(function(){
    eventSettig();
});