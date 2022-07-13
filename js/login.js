const fadeSpeed = 500;

var validatePage = () => {
    var err1 = '';
    var err2 = '';
    if ($('#txtUser').val().length == 0) {
        err1 = 'Username is blank. ';
    }
    if ($('#txtPwd').val().length == 0) {
        err2 = 'Password is blank.'
    }
    if (err1.length != 0 || err2.length != 0) {
        $('#msg').text('Error: ' + err1 + err2);
        $('#msg').fadeIn(fadeSpeed);
        if (err1.length != 0) {
            $('#txtUser').focus();
        } else {
            $('#txtPwd').focus();
        }
    } else {
        //passed client validation
        $('#msg').fadeOut(fadeSpeed);
        jsonLogin = {};
        jsonLogin['usr'] = $('#txtUser').val();
        jsonLogin['pwd'] = $('#txtPwd').val();
        $.ajax({
            url: '/login',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(jsonLogin),
            success: (res) => {
                if (res.message == 'found') {
                    sessionStorage.setItem('login',$('#txtUser').val());
                    window.location.href = '/main';
                } else {
                    $('#msg').text('Error: Invalid username/password.');
                    $('#msg').fadeIn(fadeSpeed);
                    $('#txtUser').focus();
                }
            }
        });
    }
}

$(() => { //document.ready()
    $(document).keyup(function (event) {
        if (event.which === 13) {
            validatePage();
        }
    });

    $('#divLogin').click(() => {
        validatePage();
    });

    $('#btnLogin').focus(() => {
        $('#divLogin').css('background-color', '#00a651');
        $('#btnLogin').css('background-color', '#00a651');
        $('#btnLogin').css('color', '#ffffff'); //white text
    });

    //extend div colors to input on blur
    $('#btnLogin').blur(() => {
        $('#divLogin').css('background-color', '#64e6a3');
        $('#btnLogin').css('background-color', '#64e6a3');
        $('#btnLogin').css('color', '#000000'); //black text
    });

});
