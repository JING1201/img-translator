document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[name="toLanguage"]').onchange=changeToLanguageHandler;
},false);
	
function changeToLanguageHandler(event){
	chrome.storage.sync.set({to: event.target.value});
	console.log(event.target.value);
	
}
