var Tasks = new Class({
  dom:{},
  storage:null,
  tasks:{
    list:[]
  },
  initialize:function(){
    this.dom = {
      form:document.id('add_task_form'),
      field:document.id('task'),
      container:document.id('tasks_list'),
      sync:document.id('sync_remote'),
      status:document.id('status')
    }
    this.storage = new Storage();
    this.loadLocalTasks();
    this.bindEvents();
  },
  bindEvents:function(){
    this.dom.closers = $$('a.remove');
    this.dom.tasks = $$('li.task');
    this.dom.form.addEvent('submit',this.onAddTask.bind(this));
    this.dom.closers.addEvent('click',this.removeTask.bind(this));
    this.dom.sync.addEvent('click',this.syncToServer.bind(this));
  },
  onAddTask:function(ev){
    ev.stop();
    var task = this.dom.field.get('value');
    this.addTask(task);
  },
  addTask:function(task){
    var li = new Element('li',{'class':'task'});
    li.set('html',task);
    var a = new Element('a',{'class':'rep remove', 'title':'Remove'}).set('html','Remove').addEvent('click',this.removeTask.bind(this));
    a.inject(li);
    li.inject(this.dom.container,'top');
    this.dom.field.set('value','');
    this.saveTask(task);
  },
  removeTask:function(ev){
    var tgt = $(ev.target);parent = tgt.getParent('.task');
    tgt.removeEvents('click');
    parent.dispose();
    this.tasks.list.splice(this.dom.tasks.indexOf(parent),1);
    this.storage.set('tasks',JSON.encode(this.tasks));
  },
  saveTask:function(task){
    this.tasks.list.splice(0,0,task);
    this.storage.set('tasks',JSON.encode(this.tasks));
  },
  loadLocalTasks:function(){
    var tasks = JSON.decode(this.storage.get('tasks') || '{list:[]}');
    Array.each(tasks.list,function(task){
      this.addTask(task);
    }.bind(this));
  },
  syncToServer:function(ev){
    var xhr = new Request.CORS({
      url:'http://tasks.localdomain:3000/data/save',
      method:'post',
      onSuccess:this.onSyncComplete.bind(this),
      onFailure:this.onSyncError.bind(this)
    });
    xhr.send(this.tasks.list.join(','));
  },
  onSyncComplete:function(response){
    var data = JSON.decode(response);
    if(data.status === 200){
      this.dom.status.set('class','ok').set('opacity',0).set('html','Sync Succeeded');
    } else {
      this.dom.status.set('class','error').set('opacity',0).set('html','Sync Failed');
    }
    this.dom.status.fade('in').fade.delay(2000,this.dom.status,['out']);
  },
  onSyncError:function(xhr){
    this.dom.status.set('class','error').set('opacity',0).set('html','Sync Failed');
    this.dom.status.fade('in').fade.delay(2000,this.dom.status,['out']);
  }
});

var Storage = new Class({
  initialize:function(){
    this.engine = window.localStorage ? new StorageEngine.Local() : new StorageEngine.Persistent();
    return this;
  },
  set:function(key,value){
    this.engine.set(key,value);
    return this;
  },
  get:function(key){
    return this.engine.get(key);
  },
  remove:function(key){
    this.engine.remove(key);
    return this;
  }
});

var StorageEngine = {
  Local:null,
  Persistent:null
}

StorageEngine.Local = new Class({
  initialize:function(){
    this.engine = window.localStorage;
  },
  set:function(key,value){
    this.engine.setItem(key,value);
  },
  get:function(key){
    return this.engine.getItem(key);
  },
  remove:function(key){
    this.engine.removeItem(key);
  }
});

StorageEngine.Persistent = new Class({
  name:null,
  initialize:function(){
    this.name = self.location.hostname.replace(/\./gi,'_');
    this.engine = new Element("var",{id:'persistent_storage'}).setStyle("behavior","url('#default#userData')").inject(document.body);
  },
  set:function(key,value){
    var now = new Date();
    now.setYear(now.getYear() + 1);
    var expires = now.toUTCString();
    this.engine.setAttribute(key,value);
    this.engine.expires = expires;
    this.engine.save(this.name);
  },
  get:function(key){
    this.engine.load(this.name);
    return this.engine.getAttribute(key) || null;
  },
  remove:function(key){
    this.engine.removeAttribute(key);
    this.engine.save(this.name);
  }
});

Request.CORS = new Class({
  Implements:[Options],
  options:{
    url:null,
    method:'get',
    withCredentials:false,
    onSuccess:function(){},
    onFailure:function(){}
  },
  xhr:null,
  initialize:function(options){
    this.setOptions(options);
    this.xhr = this.getXHR(this.options.url,this.options.method);
    return this;
  },
  getXHR:function(url,method){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
      xhr.open(method, url, true);
      if(this.options.withCredentials){
        xhr.withCredentials = true;
      }
    } else if (typeof XDomainRequest != "undefined"){
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      xhr = null;
    }
    return xhr;
  },
  send:function(data){
    if(this.xhr !== null){
      this.xhr.setRequestHeader('Content-Type','text/plain');
      this.xhr.onload = this.onSuccess.bind(this);
      this.xhr.onerror = this.onError.bind(this);
      this.xhr.send(data);
    }
  },
  setHeader:function(header,value){
    this.xhr.setRequestHeader(header,value);
    return this;
  },
  onSuccess:function(){
    if(typeof(this.options.onSuccess) === 'function'){
      this.options.onSuccess(this.xhr.responseText);
    }
  },
  onError:function(){
    if(typeof(this.options.onFailure) === 'function'){
      this.options.onFailure(this.xhr);
    }
  }
});