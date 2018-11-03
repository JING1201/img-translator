var clickedEl = null;

document.addEventListener("mousedown", function(e){
    //right click
    if(event.button == 2) { 
        clickedEl = e.target;
    }
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "getClickedEl") {
        //sendResponse({id: clickedEl.id});
        sendResponse(clickedEl);
        //console.log(JSON.stringify(clickedEl))
    }
});