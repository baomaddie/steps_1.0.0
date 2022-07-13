var confirmDelete = (id) => {
    $('#txtDelId').val(id);
    fadeIn();
}

var editUser = (id) => {
    item={};
    item['id'] = id;
    $.ajax({
        url: '/edituser',
        dataType: 'html',
        type: 'post',
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify(item)
    })
    .then((html) => {
        $('body').html(html);
    });
}

var deleteUser = (id) => {
    item={};
    item['id'] = id;
    $.ajax({
        url: '/deleteuser',
        dataType: 'html',
        type: 'post',
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify(item)
    })
    .then((html) => {
        $('body').html(html);
    });
}

var fadeIn = () => {
    overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
    $('#divDelete').fadeIn(500);
}

var fadeOut = () => {
    overlay.remove();
    $('#divDelete').fadeOut(500);
}

$(() => {
    $('input').on('click', (elem) => {
        const idArr=elem.target.id.split('-');
        var mode = idArr[0];
        var id=idArr[1];    
        switch (mode) {
            case 'delete':
                confirmDelete(id);
                break;
            case 'add':
            case 'edit':
                editUser(id);
                break;
            case 'btnYes':
                fadeOut();
                deleteUser($('#txtDelId').val());
                break;
            case 'btnNo':
                fadeOut();
                break;  
        }
    });

     $('#btnAdmin').on('click', () => {
         location.href='/asteps';
     });
});