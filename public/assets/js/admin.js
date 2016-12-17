	// Connect to the socket
var socket = io();

function PauseFunction (button) {
    console.log(button.id);
    socket.emit('Pause-user',{ user: button.id});
}

function show(div)
{
$("#"+div.id+'_wrap').slideToggle( "slow");
}

function UpdateUser()
{
    $('#image_popup').dialog("close");
    console.log('emit event');
    socket.emit('change-files',{user: document.getElementById("user").value, files:$("select").data('picker').selected_values() });
}

function UpdateGroup()
{
    $('#image_popup').dialog("close");
    console.log('emit event');
    socket.emit('change-group',{group: document.getElementById("user").value, files:$("#picker").data('picker').selected_values() });
}


function OpenFilesBrowser(btn)
{
    var tmp= document.getElementById("user");
    tmp.value = btn.id;
    console.log(tmp.value);
    $( '#image_popup' ).dialog({ minWidth: window.innerWidth});
}


function OpenDatePicker(btn)
{
    $('#'+btn.id).datetimepicker();
}

function SaveDateToUser(btn)
{
    var tuser=$('#'+btn.id+"_start").data('value');
    var tstart=$('#'+btn.id+"_start").find("input").val();
    var tstop=$('#'+btn.id+"_end").find("input").val();
    var timage =$('#'+btn.id).val();
    socket.emit("schedule-user", { user: tuser, start:tstart, stop: tstop, image: timage })
}


$(function() {
    $("#picker").imagepicker();
socket.emit('hello',{ user: 'admin'});
socket.on('admincast',function(data){
    console.log(data);
    var myElements = document.querySelectorAll(".user");
    for (var i = 0; i < myElements.length; i++) {
    myElements[i].style.backgroundColor = "#a70000";
    }
        var myElements = document.querySelectorAll(".user_btn");
    for (var i = 0; i < myElements.length; i++) {
    myElements[i].style.backgroundColor = "#a70000";
    }
    for (var key in data.users)
    {
        if(data.users[key] !='admin'){
        var myElement = document.querySelector("#"+data.users[key]);
        myElement.style.backgroundColor = "#00a700";
        var myElement = document.querySelector("#"+data.users[key]+"_btn");
        myElement.style.backgroundColor = "#00a700";
    }
    }
});

});