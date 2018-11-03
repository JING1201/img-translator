
document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[name="fromLanguage"]').onchange=changeFromLanguageHandler;
},false);


function changeFromLanguageHandler(event){
	chrome.storage.local.set({language: event.target.value});
	console.log(event.target.value);
	
}

document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[name="toLanguage"]').onchange=changeToLanguageHandler;
},false);
	
function changeToLanguageHandler(event){
	chrome.storage.local.set({language: event.target.value});
	console.log(event.target.value);
	
}
