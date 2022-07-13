const saveMsg = 'Save?';
const cancelMsg = 'Cancel?';

var validate = () => {
    if ($('#txtUsr').val().trim().length==0 || $('#txtPwd').val().trim().length==0) {
        showErr();  
    } else {
        showMsg('Save?');
    }
}

//set and show the modal question prompt
var showMsg = (txt) => {
    $('#lblMessage').text(txt);
    overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
    $('#divMsg').fadeIn(500);
}

var hideMsg = () => {
    overlay.remove();
    $('#divMsg').fadeOut(500); //always hide the prompt
}

var showErr = () => {
    overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
    $('#divErr').fadeIn(500);
}

var hideErr = () => {
    overlay.remove();
    $('#divErr').fadeOut(500); //always hide the prompt
}

//the user has selected YES or NO from the modal question prompt
var confirmed = (txt) => {
    hideMsg();
    switch (txt) {
        case 'yes':
            switch ($('#lblMessage').text()) {
                case saveMsg:
                    saveUser();
                    break;
                case cancelMsg:
                    $.get('/userslist', (html) => { 
                        $('body').html(html);
                    });
                    break;
            }
            break;
        case 'no': //always do nothing. think about it.
            break;
    }
}

var saveUser = () => {
    item = {};
    item['id'] = $('#lblId').text();
    item['username'] = $('#txtUsr').val();
    item['password'] = $('#txtPwd').val();
    $.ajax({
        url: '/saveuser',
        dataType: 'text',
        type: 'post',
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify(item)
    })
    .then((html) => {
        $.get('/userslist', (html) => { 
            $('body').html(html); //to client
        });
    });
}
