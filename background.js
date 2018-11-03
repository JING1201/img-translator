var API_KEY = '';
var MAX_LABELS = 4; // Only show the top few labels for an image.
var LINE_COLOR = '#f3f315';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: '<all_urls>'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

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
});

// translate makes a Cloud Natural Language API request with the API key
var translate = function(text, cb) {
  var url = 'https://translation.googleapis.com/language/translate/v2?key=' + API_KEY;
  var data = {
      q: text,
      target: 'zh',
      format: 'text'
  };
  http('POST', url, JSON.stringify(data), cb);
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
    'iconUrl': 'images/get_started128.png',
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
  onclick: function (obj) {
    b64(obj.srcUrl, function (b64data) {
      detect('TEXT_DETECTION', b64data, function (data) {
        copyToClipboard(JSON.stringify(data))
        // Get 'description' from first 'textAnnotation' of first 'response', if present.
        var text = (((data.responses || [{}])[0]).textAnnotations || [{}])[0].description || '';
        if (text === '') {
          notify('No text found');
          return;
        }

        translate (text, function(data){
          text = (((data.data || [{}]).translations || [{}])[0]).translatedText || '';
          if (text === '') {
            notify('No text found 2');
            return;
          }
          if (copyToClipboard(text)) {
            notify('Text copied to clipboard', text);
          } else {
            notify('Failed to copy to clipboard');
          }
        });
      });
    });
  }
}, function () {
  if (chrome.extension.lastError) {
    console.log('contextMenus.create: ', chrome.extension.lastError.message);
  }
});


