var clickedEl = null;
var trans
var pos

document.addEventListener("mousedown", function(e){
    //right click
    if(event.button == 2) { 
        clickedEl = e.target;
        //console.log(clickedEl)
    }
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request === "getClickedEl") {
        sendResponse(clickedEl);
    }
    else{
        var trans = request[0];
        var pos = request[1]
        var textnode = document.createTextNode(trans);  // Create a text node
        clickedEl.parentElement.appendChild(textnode); 
        var positions = (((JSON.parse(pos).responses || [{}])[0]).textAnnotations || [{}]);

        var rect = clickedEl.getBoundingClientRect();

        console.log(trans);

        var sentences = trans.split("\n");

        console.log(rect.top,rect.right,rect.bottom,rect.left);

        for(var i = 1; i <= sentences.length; i++)
        {
            var vertz = (positions[i].boundingPoly || [{}]).vertices || "{x: 11, y: 11}";
            var div = document.createElement("div");
            /*div.style.width = (vertz[1].x -vertz[0].x) + "px";
            div.style.height = (vertz[0].y -vertz[1].y) + "px";*/
            div.style.top = rect.top + vertz[1].y;
            div.style.right = rect.right - vertz[1].x;
            div.style.position = "absolute";
            div.style.backgroundColor = "#000000";
            div.style.color = "white";
            div.innerHTML = sentences[i-1];
            clickedEl.parentElement.appendChild(div); 
            console.log(trans);
        }

        /*<div style="top:200; right:640;position:absolute;background-color:#000000; color: white;">Bottom Left</div>*/
    }           
});



