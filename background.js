var API_KEY = '';
var MAX_LABELS = 4; // Only show the top few labels for an image.
var LINE_COLOR = '#f3f315';
var saved;
var translatedText;
var translatedPos;
var req;

// http makes an HTTP request and calls callback with parsed JSON.
var http = function (method, url, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) { return; }
    if (xhr.status >= 400) {
      notify('API request failed');
      console.log('XHR failed', xhr.responseText);
      return;
    }
    cb(JSON.parse(xhr.responseText));
  };
  xhr.send(body);
};

// Fetch the API key from config.json on extension startup.
http('GET', chrome.runtime.getURL('config.json'), '', function (obj) {
  API_KEY = obj.key;
  document.dispatchEvent(new Event('config-loaded'));
  var url = "https://translation.googleapis.com/language/translate/v2/languages?target="+ navigator.language + "&key=" + API_KEY;
  http('GET', url, '', function (data) {
    languages = JSON.stringify((data.data || [{}]).languages);
    //copyToClipboard(languages);
    var languageList = [];
    var parsed = JSON.parse(languages);
    for (var i=0; i < parsed.length; i++) {
      var language = [parsed[i].language, parsed[i].name];
      languageList.push(language);
    }
    //copyToClipboard(languageList);
    chrome.storage.sync.set({supportedLanguages: languageList});
  });
});

// translate makes a Cloud Natural Language API request with the API key
var translate = function(text, cb) {
  var url = 'https://translation.googleapis.com/language/translate/v2?key=' + API_KEY;
  chrome.storage.sync.get('to', function(data){
    //copyToClipboard(data.to);
    var data = {
        q: text,
        target: data.to,
        format: 'text'
    };
    http('POST', url, JSON.stringify(data), cb);
  });
};

// detect makes a Cloud Vision API request with the API key.
var detect = function (type, b64data, cb) {
  var url = 'https://vision.googleapis.com/v1/images:annotate?key=' + API_KEY;
  var data = {
    requests: [{
      image: {content: b64data},
      features: [{'type': type}]
    }]
  };
  http('POST', url, JSON.stringify(data), cb);
};

var b64 = function (url, cb) {
  var image = new Image();
  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    canvas.getContext('2d').drawImage(this, 0, 0);
    var b64data = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
    cb(b64data);
  };
  image.src = url;
};

var notify = function (title, message) {
  chrome.notifications.create('', {
    'type': 'basic',
    'iconUrl': 'images/icon.png',
    'title': title,
    'message': message || ''
  }, function (nid) {
    // Automatically close the notification in 4 seconds.
    window.setTimeout(function () {
      chrome.notifications.clear(nid);
    }, 4000);
  });
};

// Returns true if successful.
var copyToClipboard = function (text) {
  var buffer = document.createElement('textarea');
  document.body.appendChild(buffer);
  buffer.value = text;
  buffer.focus();
  buffer.selectionStart = 0;
  buffer.selectionEnd = buffer.value.length;
  if (!document.execCommand('copy')) {
    console.log("Couldn't copy from buffer");
    return false;
  }
  buffer.remove(); // clean up the buffer node.
  return true;
};

chrome.contextMenus.create({
  title: 'Image Text Translation',
  contexts: ['image'],
  onclick: function (obj, tab) {
    chrome.tabs.sendMessage(tab.id, "getClickedEl", function(clickedEl) {
      saved = "123";
      copyToClipboard(clickedEl);

      b64(obj.srcUrl, function (b64data) {
        detect('TEXT_DETECTION', b64data, function (data) {
          
          // Get 'description' from first 'textAnnotation' of first 'response', if present.
          var text = (((data.responses || [{}])[0]).textAnnotations || [{}])[0].description || '';
          if (text === '') {
            notify('No text found');
            return;
          }
          copyToClipboard(JSON.stringify(data));
          translatedPos = JSON.stringify(data);

          translate (text, function(data, position){
            text = (((data.data || [{}]).translations || [{}])[0]).translatedText || '{x: 13, y: 13}';
            if (text === '') {
              notify('No text found');
              return;
            }

            if (copyToClipboard(text)) {
              notify('Text copied to clipboard', text);
            } else {
              notify('Failed to copy to clipboard');
            }
            //create text overlay
            translatedText = text;
            var results = [translatedText, translatedPos];
            chrome.tabs.sendMessage(tab.id, results);
          });
        });
      });

    });
  }
}, function () {
  if (chrome.extension.lastError) {
    console.log('contextMenus.create: ', chrome.extension.lastError.message);
  }
});


console.log("backgoundjs end of file");


