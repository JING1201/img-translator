window.addEventListener('load',function() {
    chrome.storage.sync.get('supportedLanguages', function(list){
        var languages = list.supportedLanguages;
        //console.log(languages);
        //Create and append select list
        var lang = chrome.storage.sync.get(['to'], function(obj){
            console.log(obj.to);
            document.querySelector('select[id="to"]').value = obj.to;
            return obj.to;
        });
        if (lang === null){
            lang = navigator.language;
        }
        var selectList = document.getElementById("to");
        for (var i = 0; i < languages.length; i++) {
            var option = document.createElement("option");
            option.value = languages[i][0];
            option.text = languages[i][1];
            option.id = languages[i][0];
            // if (languages[i][0]===lang){
            //     option.selected = "selected";
            //     //console.log(navigator.language)
            // }
            selectList.appendChild(option);
        }
    });
},false);
    
// function changeToLanguageHandler(event){
//     chrome.storage.sync.set({to: event.target.value});
//     console.log(event.target.value);
// }

document.getElementById("to").addEventListener("change", handler);

function handler(){
    var chosen = document.getElementById('to').value;
    chrome.storage.sync.set({to: chosen});
    //console.log(chosen);
}



