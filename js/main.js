const fadeSpeed = 500;

var logoutConfirmed = () => {
    hideLogoutMsg();
    sessionStorage.removeItem('login');
    window.location.href='/login';
}

var hideLogoutMsg = () => {
    overlay.remove();
    $('#divLogout').fadeOut(fadeSpeed);
}

$(() => { //document.ready()
    //verify login
    if (sessionStorage.getItem('login') == null) {
        window.location.href='/login';
    } else {
        $('#userId').text(sessionStorage.getItem('login'));
    }

    //Enter new Serology form
    $("#enter").on('click', () => {
        window.location.href='/entry?id=0';
    });

    //View Patient Data
    $("#view").on('click', () => {
        $.get('/list', (html) => { 
            window.document.write(html); //to client
        });
    });
    //Upload Patient Data
    $("#upload").on('click', () => {
        $.get('/upload', (html) => { 
            window.document.write(html); //to client
        });
    });
    //Logout
    $("#logout").on('click', () => {
        //logout code here
        overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
        $('#divLogout').fadeIn(fadeSpeed);
    });

    //flush the state and signature local storage
    localStorage.removeItem('cv1');
    localStorage.removeItem('s1');
});