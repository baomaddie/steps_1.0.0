const arr = ['  ', 'AL', 'AK', 'AZ', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI',
    'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI',
    'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
    'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
    'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'AS', 'GU', 'MP', 'PR', 'UM', 'VI'];

const saveMsg = 'Save Data?';
const cancelMsg = 'Back to Main Menu?';
const clearMsg = 'Clear Data?';
const pink = '#eba3a3';
const bluish = '#a5beeb';
const white = 'white';
const bgc = 'background-color';
const inset = 'inset 0 1px 1px rgba(0,0,0,.39)';
const fadeSpeed = 500;
var toggle = false;
var editset = false; //true = edit mode, data has been loaded so don't refresh certain parts

//populates the states dropdown from arr
var populateStateDropdown = () => {
    for (i = 0; i < arr.length; i++) {
        option = document.createElement('option');
        option.setAttribute('value', arr[i]);
        option.appendChild(document.createTextNode(arr[i]));
        $('#s1').append(option);
    }
}

//resets selected state value when the user hits the refresh button
var setState = (mode) => {
    if (mode == 'add') {
        if (localStorage.getItem('s1') !== null) {
            $('#s1').val(localStorage.getItem('s1'));
        }
    } else { //edit mode, reset state selector
        if (localStorage.getItem('s1') !== null) {
            $('#s1').val(localStorage.getItem('s1'));
        } else {
            $('#s1').val($('#se1').val());
        }
    }
}

var setSTItestResults = (mode) => {
    //usually perform for edit mode and only once (editset = false)
    editset = localStorage.getItem('editset');
    console.log('1entry.js.setSTItestResults.editset=' + editset);
    if (editset == null) { editset = false; }
    console.log('2entry.js.setSTItestResults.editset=' + editset);
    if (mode == 'edit' && editset == false) {
        for (i = 2; i <= 5; i++) {
            var option = '';
            //var s = 'selected';
            var v = false;
            //var o = $('#s' + i).val().split(',');
            for (j = 0; j < 4; j++) {
                //v = parseBool(o[j]);
                $('#s' + i.toString() + j.toString()).prop('selected', v);
            }
        }
        localStorage.setItem('editset', true);
    }
}

var parseBool = (val) => {
    //converts a string boolean ("true"/"false") to a true boolean (true/false)
    return val === true || val === "true"
}

var setHCVtestResults = (on) => {
    //on=true, enable   on=false, disable
    var o = '';
    if (!on) { o = '.2'; } else { o = '1'; }

    $('#lblhcv').css('opacity', o);
    $('#lblHCVnd').css('opacity', o);
    $('#lblHCVpdtx').css('opacity', o);
    $('#lblHCVpcnotx').css('opacity', o);

    if (!on) {
        $('#r53').prop('checked', on);
        $('#r54').prop('checked', on);
        $('#r55').prop('checked', on);
    }

    $('#r53').attr('disabled', !on);
    $('#r54').attr('disabled', !on);
    $('#r55').attr('disabled', !on);
}

//for STI Test Results checkboxes, the associated dropdown is disabled along with the checkbox
var setDropdown = (chk, slt) => {
    if ($('#' + chk).prop('checked')) {
        $('#' + slt).prop('disabled', false);
    } else {
        disableDropdown(slt);
    }
}

//disable and unselect the dropdown
var disableDropdown = (slt) => { //can't touch this
    var s = $('#' + slt);
    for (var i = 0; i < s[0].options.length; i++) {
        s[0].options[i].selected = false;
    }
    $('#' + slt).prop('disabled', true);
}

//set and show the modal question prompt
var confirm = (txt) => {
    //overlay = $('<div></div>').prependTo('body').attr('id', 'overlay');
    overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
    $('#lblMessage').text(txt);
    $('#divMsg').fadeIn(fadeSpeed);
}

//the user has selected YES or NO from the modal question prompt
var confirmed = (txt) => {
    const lbl = $('#lblMessage').text();
    switch (txt) {
        case 'yes':
            switch (lbl) {
                case saveMsg:
                    //save data
                    saveData();
                    clearData();
                    window.location.href = '/main'; //reload main menu
                    break;
                case cancelMsg:
                    clearData();
                    window.location.href = '/main'; //reload main menu
                    break;
                case clearMsg:
                    clearData();
                    break;
            }
            break;
        case 'no': //always do nothing. think about it.
            break;
    }
    overlay.remove();
    $('#divMsg').fadeOut(fadeSpeed); //always hide the prompt
}

//this function posts all the client data from the screen to the server. the server actually saves the data
var saveData = () => {
    //console.log('in savedata');
    if (validateRequiredFields()) {
        var url = '/save';
        items = {};
        for (i = 1; i <= 13; i++) {
            items['t' + i] = $('#t' + i).val(); //texts
        }
        for (i = 1; i <= 2; i++) {
            items['d' + i] = $('#d' + i).val(); //dates        
        }

        items['p1'] = $('#p1').val(); //phone

        for (i = 1; i <= 55; i++) {
            items['r' + i] = $('#r' + i).prop('checked').toString(); //radio buttons
        }
        for (i = 1; i <= 21; i++) {
            items['c' + i] = $('#c' + i).prop('checked').toString(); //checkboxes 
        }
        items['s1'] = $("#s1 option:selected").text(); //state

        for (i = 2; i <= 5; i++) {
            for (j = 0; j <= 3; j++) {
                
                if ($('#s' + i.toString() + j.toString()).prop('selected')) {
                    items['s' + i.toString() + j.toString()] = 'selected';
                } else {
                    items['s' + i.toString() + j.toString()] = '';
                }
            }
        }
        items['id'] = $('#id').val();
        items['mode'] = $('#mode').val();
        items['cv1'] = ($('#cv1')[0]).toDataURL("image/png"); //signature

        //console.log('items=',JSON.stringify(items));

        $.ajax({
            url: '/save',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(items),
            processData: false,
            success: () => {
                //display the 'data saved' message here
                console.log('savedata: success');
            }
        });
    }
}

var clearData = () => {
    //clears all user entry elements
    var elements = document.getElementsByTagName('input');
    //clear all text, date, radio, and checkbox elements
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == 'text' || elements[i].type == 'date' || elements[i].type == 'tel') {
            elements[i].value = '';
            if (elements[i].style.backgroundColor = pink) {
                elements[i].style.backgroundColor = white;
            }
            elements[i].style.boxShadow = inset;
        }
        if (elements[i].type == 'radio' || elements[i].type == 'checkbox') {
            elements[i].checked = false;
        }
    }

    //clear all select dropdown lists
    for (var i = 2; i <= 5; i++) {
        disableDropdown('s' + i);
    }
    $('#s1').prop('selectedIndex', 0);
    $('#s1').css('background-color', white);

    $('#tdMsg').css(bgc, bluish)

    //clear the state selection from local storage
    localStorage.removeItem('s1');

    //clear the HCV results
    setHCVtestResults(false);
    toggle = false;
    toggleOfficialUseDiv(toggle);

    //clear the signature
    signaturePad.clear();
    localStorage.removeItem('cv1');
    $('#cve1').val('');
    localStorage.removeItem('editset');
}

var loadCanvas = (mode) => {
    //loads the signature image if it is stored in local storage
    if (mode == 'add') {
        if (localStorage.getItem('cv1')) {
            var dataURL = localStorage.getItem('cv1');
            var img = new Image;
            img.src = dataURL;
            img.onload = () => {
                var c = document.getElementById('cv1');
                var ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
            }
        }
    } else { //edit mode
        if (localStorage.getItem('cv1')) { //refreshed
            var dataURL = localStorage.getItem('cv1');
            var img = new Image;
            img.src = dataURL;
            img.onload = () => {
                var c = document.getElementById('cv1');
                var ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
            }
        } else { //retrieved from db
            var dataURL = $('#cve1').val();
            var img = new Image;
            img.src = dataURL;
            img.onload = () => {
                var c = document.getElementById('cv1');
                var ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
            }
        }
    }
}

var setTodaysDate = (mode) => {
    //set Today's Date on the screen
    if (mode==='add') {
        const d = document.querySelector('#d1');
        d.valueAsDate = new Date();
    }
}

var validate = () => {
    //performs all required field validations
    if (validateRequiredFields()) {//validation passed, proceed
        confirm('Save Data?');
    } else {
        //notify the user to correct the required fields
        window.scrollTo(0, 0);
        //overlay = $('<div></div>').prependTo('body').attr('id', 'overlay');
        overlay = $('<div><img src="./static/semigray2.png" style="width: 100%; height: 100%;"></div>').prependTo('body').attr('id', 'overlay');
        $('#divValidate').fadeIn(500);
    }
}

//hides the validation div
var closeValidateMsg = () => {
    overlay.remove();
    $('#divValidate').fadeOut(fadeSpeed);
    $('#d1').focus();
}

var validateRequiredFields = () => {
    //validates all required fields, returns false if any fields fail validation
    var p = true;
    p = validateDate($('#d1'), p);  //today's date    
    p = validatePhone($('#p1'), p); //phone
    p = validateText($('#t1'), p);  //fname
    p = validateText($('#t2'), p);  //lname
    p = validateText($('#t4'), p);  //addr1
    p = validateText($('#t5'), p);  //city
    p = validateState($('#s1'), p); //state
    p = validateZip($('#t7'), p);   //zip
    p = validateDate($('#d2'), p);  //dob
    p = validateEmail($('#t8'), p); //email
    p = validatePname($('#t9'), p); //preferred name
    p = validateMsg(p);             //radio buttons for phone message    
    return p;
}

var validateText = (txt, p) => {
    //this is a required field, if blank then flag it
    var b = p;
    if (txt.val() == '') {
        txt.css(bgc, pink);
        txt.css('boxShadow', inset);
        b = false;
    }
    return b;
}

var validateDate = (dt, p) => {
    //this is a required field, if blank then flag it
    var b = p;
    if (!dt.val()) {
        dt.css(bgc, pink);
        dt.css('boxShadow', inset);
        b = false;
    }
    return b;
}

var validatePhone = (phn, p) => {
    //this is a required field, if blank then insert 'N/A', 
    //otherwise it must be a valid phone format or it will be flagged
    var b = p;
    if (phn.val() == '' || phn.val() == '000-000-0000') {
        phn.val('000-000-0000');
        phn.css(bgc, white);
        phn.css('boxShadow', inset);
    } else {
        if (!phn.val().match('[0-9]{3}-[0-9]{3}-[0-9]{4}')) {
            phn.css(bgc, pink);
            phn.css('boxShadow', inset);
            b = false;
        }
    }
    return b;
}

var validateState = (st, p) => {
    //state is required
    var b = p;
    if (st.val() == null || st.val().trim().length == 0) {
        st.css(bgc, pink);
        st.css('boxShadow', inset);
        b = false;
    }
    return b;
}

var validateZip = (zip, p) => {
    //zip is required and must be a valid zip code format
    var b = p;
    if (zip.val().trim().length == 0) { //can't be blank
        zip.css(bgc, pink);
        zip.css('boxShadow', inset);
        b = false;
    } else {
        if (!isValidPostalCode(zip.val().trim())) { //must be a valid zip code format
            zip.css(bgc, pink);
            zip.css('boxShadow', inset);
            b = false;
        } else {
            zip.css(bgc, white); //all is okay
            zip.css('boxShadow', inset);
        }
    }
    return b;
}

//email is optional, but if it is entered it must be in a valid format
var validateEmail = (email, p) => {
    var b = p;
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!email.val() == '') { //blank email is valid
        if (!email.val().match(validRegex)) { //test for valid email format
            email.css(bgc, pink);
            email.css('boxShadow', inset);
            b = false;
        }
    } else {
        email.css(bgc, white); //all is okay
        email.css('boxShadow', inset);
    }
    return b;
}

//preferred name
var validatePname = (txt, p) => {
    var b = p;
    //this is a required field, if blank then fill with first name
    if (txt.val() == '') {
        txt.val($('#t1').val());
        if (txt.val() == '') { //after filling from first name, if still blank mark it as error
            txt.css(bgc, pink);
            txt.css('boxShadow', inset);
            b = false;
        } else {
            txt.css(bgc, white); //all is okay
            txt.css('boxShadow', inset);
        }
    }
    return b;
}

//yes/no radio buttons
var validateMsg = (p) => {
    //one of these radio button must be selected
    var b = p;
    if (!$('#r1').prop('checked') && !$('#r2').prop('checked')) {
        $('#tdMsg').css(bgc, pink);
        $('#tdMsg').css('boxShadow', inset);
        b = false;
    }
    return b;
}

function isValidPostalCode(zip) {
    //validates zip code entry (example: 12345 or 12345-1234)
    return (/(^\d{5}$)|(^\d{5}-\d{4}$)/).test(zip);
}

//if a key is pressed in this field, set the background to white
var keypressed = (i) => {
    $('#' + i).css(bgc, 'white');
    $('#' + i).css('boxShadow', inset);
}

var toggleOfficialUseDiv = (t) => {
    $('#divOfficial *').prop('disabled', !t); //enable/disable all elements in div
    for (i = 2; i < 6; i++) {//now enable/disable the multi-select dropdowns for the STI test results
        if ($('#c' + (16 + i)).prop('checked') && !$('#c' + (16 + i)).prop('disabled')) {
            $('#s' + i).prop('disabled', !t);
        } else {
            $('#s' + i).prop('disabled', t);
        }
    }
    //finally, enable/disable the HCV test results for Antibody Positive
    if (!$('#r52').prop('disabled') && $('#r52').prop('checked')) {
        $('#r53').prop('disabled', false);
        $('#r54').prop('disabled', false);
        $('#r55').prop('disabled', false);
    } else {
        $('#r53').prop('disabled', true);
        $('#r54').prop('disabled', true);
        $('#r55').prop('disabled', true);
    }
}

$(() => { //document.ready()
    //verify login
    if (sessionStorage.getItem('login') == null) {
        window.location.href='/login';
    } else {
        $('#userId').text(sessionStorage.getItem('login'));
    }

    //console.log('document ready');
    $('#s1').on('change', () => { //save selected state to local storage in case of refresh
        localStorage.setItem('s1', $('#s1').val());
    });

    $('#c18').on('click', () => {
        setDropdown('c18', 's2');
    });

    $('#c19').on('click', () => {
        setDropdown('c19', 's3');
    });

    $('#c20').on('click', () => {
        setDropdown('c20', 's4');
    });

    $('#c21').on('click', () => {
        setDropdown('c21', 's5');
    });

    //reset the background color if this radio button is clicked
    $('#r1').on('click', () => {
        $('#tdMsg').css(bgc, bluish)
    });

    //reset the background color if this radio button is clicked
    $('#r2').on('click', () => {
        $('#tdMsg').css(bgc, bluish)
    });

    populateStateDropdown();
    setState($('#mode').val());
    loadCanvas($('#mode').val());
    setTodaysDate($('#mode').val());

    //initially the 'Official Use Only' div is disabled, Alt-i to enable it
    $('#divOfficial *').prop('disabled', true);

    //this is the code which enables/disables the 'Official Use Only' div
    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.key === 'i') {
            toggle = !toggle;
            toggleOfficialUseDiv(toggle);
        }
    });
});