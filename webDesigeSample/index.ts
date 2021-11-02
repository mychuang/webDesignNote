let devices: string[] = [];
let ipAddresses: string[] = [];

function eventSettig(){
    $('#addButton').click(function(){
        $('#addModal').modal({
            backdrop: false
        });
        $('#addModal').draggable({
            cursor: "move",
            handle: ".dragable_touch"
        });
    });

    $('#saveBtn').click(function(){
        let name: any = $('#Name').val();
        let ipAddr: any = $('#IP').val();
        let msg: string = '';

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

                $('#Name').val("");
                $('#IP').val("");
                $('#addModal').modal('hide');
            }
        }

        $('#closeBtn').click(function(){
            $('#foot').text("");
        })

        $('#resetBtn').click(function() {
            let msg = ' <div class="col-md-6">Device name</div><div class="col-md-6">IP Address</div>';
            $('#msg').html(msg);
          });
    });
}

// @ts-ignore
$(document).ready(function(){
    eventSettig();
});