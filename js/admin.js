var showConfirm = (msg) => {
    overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
    $('#lblConfirm').text(msg);
    $('#divConfirm').fadeIn(500);
}

var hideConfirm = () => {
    overlay.remove();
    $('#divConfirm').fadeOut(500); 
}

var showMessage = (msg) => {
    overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
    $('#lblMessage').text(msg);
    $('#divMessage').fadeIn(500);
}

var hideMessage = () => {
    overlay.remove();
    $('#divMessage').fadeOut(500); 
}

$(() => {

    $('#btnList').on('click', () => {
        $.get('/userslist', (html) => { 
            $('body').html(html);
        });
    });

    $('#btnCreate').on('click', () => {
        console.log('btnCreate');
        $.ajax({
            url: '/usersexists',
            dataType: 'text',
            type: 'get',
            contentType: 'text/plain',
            processData: false,
            data: 'users'
        })
        .then((text) => {
            console.log('usersexists='+text);
            if (text=='true') {
                showMessage('Users Table Already Exists.');
            } else {
                $('#lblConfirm').val('create');
                showConfirm('Create Users Table?');
            }
        });
    });

    $('#btnDelete').on('click', () => {
        console.log('btnDelete');
        $.ajax({
            url: '/usersexists',
            dataType: 'text',
            type: 'get',
            contentType: 'text/plain',
            processData: false,
            data: 'users'
        })
        .then((text) => {
            console.log('delete='+text);
            if (text=='true') {
                $('#lblConfirm').val('delete');
                showConfirm('Delete Users Table?');
            } else {
                showMessage('Users Table does not exist.');   
            }
        });
    });

    $('#btnYes').on('click', () => {
        hideConfirm();
        var lbl = $('#lblConfirm').val();
        if (lbl=='create') {
            $.ajax({
                url: '/createUsersTable',
                dataType: 'text',
                type: 'get',
                contentType: 'text/plain',
                processData: false,
                data: 'users'
            })
            .then((text) => {
                if (text=='success') {
                    showMessage('Users Table created successfully.');  
                } 
            });
        } else {
            $.ajax({
                url: '/deleteUsersTable',
                dataType: 'text',
                type: 'get',
                contentType: 'text/plain',
                processData: false,
                data: 'users'
            })
            .then((text) => {
                if (text=='success') {
                    showMessage('Users Table deleted successfully.');  
                } 
            });
        }
    });

    $('#btnNo').on('click', () => {
        hideConfirm();
    });

    $('#btnOk').on('click', () => {
        hideMessage();
    });
});