var canvas = document.getElementById('cv1');
var cve1 = document.getElementById('cve1');
var clearBtn = document.getElementById('clear');

var resizeCanvas = () => {
    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
}

var signaturePad = new SignaturePad(canvas, {
    backgroundColor: 'white'
   });

//signature clear button
clearBtn.addEventListener('click', () => {
   // console.log('clear.click()');
    signaturePad.clear();
    localStorage.removeItem('cv1');
    cve1.value='';
});

//save signature to local storage in case someone refreshes the page (so we don't lose the signature)
signaturePad.onEnd = function(){ 
    localStorage.setItem('cv1', signaturePad.toDataURL());
}

window.onresize = resizeCanvas;
resizeCanvas();