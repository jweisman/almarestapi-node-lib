var request    = require('request');
var xpath      = require('xpath');
var dom        = require('xmldom').DOMParser;
var serializer = require('xmldom').XMLSerializer;

const API_PATH = process.env.ALMA_APIPATH || 'https://api-na.hosted.exlibrisgroup.com/almaws/v1';
const API_KEY  = process.env.ALMA_APIKEY;
const ALMAWS_NS = {"alma": "http://com/exlibris/urm/general/xmlbeans"};
const XPATH_ALMAWS_ERROR = '/alma:web_service_result/alma:errorList/alma:error/alma:errorMessage';

function performRequestPromise(endpoint, method, data, contentType='json') {
  return new Promise(function (resolve, reject) {
    performRequest(endpoint, method, data, function(err, data) {
      if (err) reject(err);
      else resolve(data);
    }, contentType);
  });
}

function performRequest(endpoint, method, data, callback, contentType='json') {
  if (!API_KEY) 
    throw new Error('No API key provided.');

  var dataString;
  var headers = {
    'Authorization': 'apikey ' + API_KEY,
    'Accept': (contentType=='json' ? 
      'application/json' : 'application/xml') 
  };

  var options = {
    uri: (endpoint.substring(0,4) == 
      'http' ? '' : API_PATH) + endpoint,
    method: method,
    headers: headers,
  };

  if (method != 'GET') {
    if (contentType=='json') {
      dataString = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    } else {
      dataString = typeof data == 'object' ? 
        new serializer().serializeToString(data) : data;
      headers['Content-Type'] = 'application/xml';
    }
    headers['Content-Length'] = dataString.length;
    options['body'] = dataString;
  }

  request(
    options,
    function(err, response, body) {
      var obj;
      try {
        if (method != 'DELETE') {
          if (body=='') body = contentType=='json' ? 
            'null' : '<root/>';
          obj = (contentType=='json' ? 
            JSON.parse(body) : new dom().parseFromString(body));
        }
        if (!err && ('' + response.statusCode).match(/^[4-5]\d\d$/)) {
          var message;
          try {
            if (contentType=='json') {
              message = obj.errorList.error[0].errorMessage + " (" + 
                obj.errorList.error[0].errorCode + ")";
            } else {
              var select = xpath.useNamespaces(ALMAWS_NS);
              message = select(XPATH_ALMAWS_ERROR, obj)[0]
                .firstChild.data;
            }
          } catch (e) {
            message = "Unknown error from Alma.";
          }
          err = new Error(message);
        }
      } catch (e) {
        err = e;
      }
      callback(err, contentType=='json' ? obj : body);
    });
}

exports.get = function(url, callback) {
  performRequest(url, 'GET', null, 
    function(err, data) {
      if (err) callback(err);
      else callback(null, data);
    });
};

exports.getp = function(url) {
  return performRequestPromise(url, 'GET', null);
}

exports.getXml = function(url, callback) {
  performRequest(url, 'GET', null, 
    function(err, data) {
      if (err) callback(err);
      else callback(null, data);
    }, 'xml');
};

exports.getXmlp = function(url) {
  return performRequestPromise(url, 'GET', null, 'xml');
}

exports.post = function(url, data, callback) {
  performRequest(url, 'POST', data, 
    function(err, data) {
      if (err) callback(err);
      else callback(null, data);
    });
};

exports.postp = function(url, data) {
  return performRequestPromise(url, 'POST', data);
}

exports.put = function(url, data, callback) {
  performRequest(url, 'PUT', data, 
    function(err, data) {
      if (err) callback(err);
      else callback(null, data);
    });
};

exports.putp = function(url, data) {
  return performRequestPromise(url, 'PUT', data);
}

exports.putXml = function(url, data, callback) {
  performRequest(url, 'PUT', data, 
    function(err, data) {
      if (err) callback(err);
      else callback(null, data);
    }, 'xml');
};

exports.putXmlp = function(url, data) {
  return performRequestPromise(url, 'PUT', data, 'xml');
}

exports.delete = function(url, callback) {
  performRequest(url, 'DELETE', null, 
    function(err, data) {
      if (err) callback(err);
      else callback(null, data);
    });
}

exports.deletep = function(url) {
  return performRequestPromise(url, 'DELETE', null);
}
