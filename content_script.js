var clickedEl = null;

document.addEventListener("mousedown", function(e){
    //right click
    if(event.button == 2) { 
        clickedEl = e.target;
        //console.log(clickedEl);
    }
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "getClickedEl") {
        sendResponse(clickedEl);
    }
});