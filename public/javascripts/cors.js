var CORS = {
  _xhr:null,
  init:function(){},
  send:function(url,method,data, onSuccess, onFailure){
    xhr = this._getXHR(url,method);
    if(xhr !== null){
      xhr.onload = function(){
        if(typeof(onSuccess) === 'function'){
          onSuccess(xhr.responseText);
        }
      }
      xhr.onerror = function(){
        if(typeof(onFailure) === 'function'){
          onFailure(xhr);
        }
      }
      xhr.send(data);
    }
  },
  _getXHR:function(url,method){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined"){
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      xhr = null;
    }
    return xhr;
  }
}