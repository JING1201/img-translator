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
        var sentences = trans.split("\n");
        var textnode = document.createTextNode(trans);  // Create a text node
        clickedEl.parentElement.appendChild(textnode); 
        var positions = (((JSON.parse(pos).responses || [{}])[0]).textAnnotations || [{}]);

        var rect = clickedEl.getBoundingClientRect();

        var text = (((JSON.parse(pos).responses || [{}])[0]).textAnnotations || [{}])[0].description || '';
        var splits = text.split("\n");
        var counts = [];
        for(var i = 0; i < splits.length; i++)
        {
            var words = splits[i].split(" ");
            if(i == 0)
                counts.push(words.length - 1);
            else
                counts.push(words.length - 1 + counts[i - 1]);
        }

        console.log(counts);

        console.log(positions);

        console.log(rect.top,rect.right,rect.bottom,rect.left);

        //create divs
        for(var i = 1; i < sentences.length; i++)
        {
            if(i == 1)
                var vertz = (positions[1].boundingPoly || [{}]).vertices || "{x: 11, y: 11}";
            else
                var vertz = (positions[i + counts[i - 2]].boundingPoly || [{}]).vertices || "{x: 11, y: 11}";
            var div = document.createElement("div");
            /*div.style.width = (vertz[1].x -vertz[0].x) + "px";
            div.style.height = (vertz[0].y -vertz[1].y) + "px";*/
            div.style.top = rect.top + vertz[1].y;
            div.style.left = rect.left + vertz[0].x;
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



