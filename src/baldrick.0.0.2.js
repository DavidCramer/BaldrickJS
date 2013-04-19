/* BaldrickJS  V0.0.2 | (C) David Cramer - 2013 | MIT License */
    var
    bindClass    = 'trigger',
    actionQueued,
    requestURL = null,
    _cache = {},
    baldrick = function(bindClass){
        return new baldrick.fn.buildTriggers(bindClass);
    };
    baldrick.fn = baldrick.prototype = {
        buildTriggers: function(bindClass){
            var bindings    = false;
            if(document.getElementsByClassName(bindClass)){
                bindings    = document.getElementsByClassName(bindClass);
            }
            var autoloads   = [];
            for(i=0;i<bindings.length;i++){
                bindings[i].delay = 0;
                var eventType = (bindings[i].nodeName == 'FORM' ? 'submit' : 'click');
                if(!bindings[i].id){
                    bindings[i].id = 'tr'+Math.floor((Math.random()*110)*(Math.random()*110));
                }
                for(var att in bindings[i].attributes){
                    if(bindings[i].attributes[att]){
                        switch (bindings[i].attributes[att].name){
                            case 'data-init':
                                if(typeof window[bindings[i].attributes[att].value] == 'function'){window[bindings[i].attributes[att].value](bindings[i])};
                                bindings[i].removeAttribute('data-init');
                            break;
                            case 'data-delay':
                                bindings[i].delay = bindings[i].attributes[att].value;
                            break;
                            case 'data-autoload':
                            case 'data-preload':
                                if(bindings[i].attributes[att].value == 'true'){
                                    bindings[i].removeAttribute('data-autoload');
                                    if(bindings[i].attributes[att].name == 'data-preload'){
                                        bindings[i].removeAttribute('data-preload');
                                        _cache[bindings[i].id] = {
                                            html: null,
                                        };
                                    }
                                    var dly = (bindings[i].getAttribute('data-delay') ? bindings[i].getAttribute('data-delay'):0);
                                    setTimeout(function(){
                                        baldrick.fn.doAction(arguments[0]);
                                    },dly, bindings[i]);
                                }
                            break;
                            case 'data-event':
                                eventType = bindings[i].attributes[att].value;
                            break;
                            default:
                            break;
                        }
                    }
                }
                if(bindings[i].addEventListener) {
                  bindings[i].addEventListener(eventType, baldrick.fn.queueEvent, false);
                }else if(bindings[i].attachEvent){
                  bindings[i].attachEvent('on'+eventType, baldrick.fn.queueEvent);
                }
            }
            window.addEventListener('hashchange', baldrick.fn.hashAction, false);
        },
        queueEvent: function(e){
            var element  = this;
            if(element.getAttribute('data-before')){
                if(typeof window[element.getAttribute('data-before')] == 'function'){
                    if(window[element.getAttribute('data-before')](e) == false){
                        return;
                    }
                }
            }
            e.preventDefault();
            if(element.getAttribute('data-for')){
                element = (document.getElementById(element.getAttribute('data-for')) ? document.getElementById(element.getAttribute('data-for')) : element);
            }
            clearTimeout(actionQueued);
            actionQueued = setTimeout(function(){
                baldrick.fn.buildHash(element);
                baldrick.fn.doAction(element, e);
            }, element.delay);
        },
        doAction: function(element, ev){
            if(!element){
                baldrick.fn.log('Invalid trigger element');
                return;
            }
            window.removeEventListener('hashchange', baldrick.fn.hashAction);
            if(element.getAttribute('data-clear')){
                var list = element.getAttribute('data-clear').split(';');
                list.forEach(function(e){
                    if(document.getElementById(e)){
                        document.getElementById(e).innerHTML = '';
                    }
                });
            }
            var target = (element.getAttribute('data-target') ? document.getElementById(element.getAttribute('data-target')) : null);
            if(target){
                if(target.xmlhttp){
                    target.xmlhttp.abort();
                }else{
                    if(_cache[element.id] !== undefined){
                        if(_cache[element.id].xmlhttp){
                            _cache[element.id].xmlhttp.abort();
                            console.log(_cache[element.id].xmlhttp);
                        }
                    }
                }
            }
            var action = {
                request     : (element.getAttribute('data-request') ? element.getAttribute('data-request') : null),
                hrefaction  : (element.href ? element.href : (element.nodeName == "FORM" ? (element.getAttribute('action') ? element.getAttribute('action') : requestURL) : requestURL)),
                callback    : (element.getAttribute('data-callback') ? element.getAttribute('data-callback') : null),
                success     : (element.getAttribute('data-success') ? element.getAttribute('data-success') : null),
                fail        : (element.getAttribute('data-fail') ? element.getAttribute('data-fail') : null),
                activeClass : (element.getAttribute('data-active-class') ? element.getAttribute('data-active-class') : 'active'),
                method      : (element.getAttribute('data-method') ? element.getAttribute('data-method') : (element.nodeName == "FORM" ? (element.getAttribute('method') ? element.getAttribute('method') : 'POST') : 'POST')),
                groups      : document.getElementsByClassName(bindClass),
                target      : target,
                progress    : (element.getAttribute('data-progress') ? element.getAttribute('data-progress') : null)
            }
            if(element.getAttribute('data-start')){
                if(typeof window[element.getAttribute('data-start')] == 'function'){
                    if(window[element.getAttribute('data-start')](ev) == false){
                        return;
                    }
                }
            }
            if(action.groups){
                for(i=0;i<action.groups.length;i++){
                    if(action.groups[i].getAttribute('data-group') === element.getAttribute('data-group')){
                        action.groups[i].className = action.groups[i].className.replace(' '+action.activeClass, '');
                    }
                }
                element.className = element.className+' '+action.activeClass;
            }
            var value       = (element.value ? element.value : false);
            if(window.FileReader && action.method == 'POST'){
                var data    = (element.nodeName == "FORM" ? new FormData(element) : new FormData());
                if(value != false){data.append('value', value);}
            }else{
                var data    = (element.nodeName == "FORM" ? element : new FormData());
                if(value != false){data['value'] = value};
            }
            for(var att in element.attributes){
                if(element.attributes[att]){
                    if(element.attributes[att].name){
                        if(element.attributes[att].name.substr(0,5) == 'data-'){
                            if(window.FileReader && action.method == 'POST'){
                                data.append(element.attributes[att].name.substr(5),element.attributes[att].value);
                            }else{
                                data[element.attributes[att].name.substr(5)] = element.attributes[att].value;
                            }
                        }
                    }
                }
            }
            if(!target && !action.callback && !action.progress){
                baldrick.fn.log('Invalid target or no target defined. set either data-target or data-calback', element, ev);
            }
            if((action.request || action.hrefaction) && (target || typeof window[action.callback] == 'function' || action.progress)){
                try{
                    baldrick.fn.doRequest(action, {
                        element: element,
                        success: function(e){
                            if(typeof window[action.success] == 'function'){window[action.success](element,e);}
                            baldrick.fn.buildTriggers(bindClass);
                        },
                        fail: function(e){
                            if(typeof window[action.fail] == 'function'){window[action.fail](element,e);}
                            baldrick.fn.buildTriggers(bindClass);
                        },
                        data: data
                    });
                }catch(err){
                    baldrick.fn.log(err);
                }
            }else{
                baldrick.fn.log('No request URL defined');
                if(typeof window[action.callback] == 'function'){window[action.callback](element, ev);}
            }
        },
        doRequest: function(){
            var xmlhttp;
            var element = arguments[1].element;
            var processor = (arguments[0].request ? arguments[0].request : arguments[0].hrefaction);
            var timeOut = (element.getAttribute('data-timeout') ? element.getAttribute('data-timeout') : '30000');
            var target = arguments[0].target;
            var loadelement = (element.getAttribute('data-load-element') ? document.getElementById(element.getAttribute('data-load-element')) : target);
            var progress = arguments[0].progress;
            if(progress){
                if(typeof window[progress] != 'function'){
                    if(document.getElementById(progress)){
                        progress = document.getElementById(progress);
                    }
                }
            }
            if(loadelement){
                var loadClass = (element.getAttribute('data-load-class') ? element.getAttribute('data-load-class') : 'loading');
                var classname = loadelement.className.replace(' '+loadClass,'');
                loadelement.className = classname+' '+loadClass;
            }
            var success = arguments[1].success;
            var fail = arguments[1].fail;
            if(typeof window[arguments[0].callback] == 'function'){
                var callback     = arguments[0].callback;
                var callbacktype= (element.getAttribute('data-callback-type') ? element.getAttribute('data-callback-type') : 'html');
            }
            if(_cache[element.id] !== undefined){
                if(_cache[element.id].html){
                    if(target){
                        target.innerHTML = _cache[element.id].html;
                        loadelement.className = classname;
                    }
                    if(callback){
                        var script = document.createElement("script");
                        script.setAttribute('type', 'text/javascript');
                        if(callbacktype == 'html' || callbacktype == 'HTML'){
                            window[callback](_cache[element.id].html);
                        }else{
                            script.text = callback+'('+_cache[element.id].html+');';
                            document.head.appendChild(script);
                            document.head.removeChild(document.head.lastChild);
                        }
                    }
                    success(_cache[element.id]);
                    _cache[element.id].html = null;
                }
            }
            serialize = function(obj) {
                var str = [];
                for(var p in obj){
                    str.push(encodeURIComponent(p)+"="+encodeURIComponent(obj[p]));
                }
                return str.join("&");
            }
            processor = (arguments[0].method == 'GET' ? processor+'?'+serialize(arguments[1].data) : processor);
            if(window.XMLHttpRequest){
                xmlhttp=new XMLHttpRequest();
            }else if(window.ActiveXObject){
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }else{
                return false;
            }
            if(_cache[element.id] !== undefined){
                _cache[element.id].xmlhttp = xmlhttp;
            }else{
                if(target){
                    target.xmlhttp = xmlhttp;
                }
            }
            if(timeOut > 0){
                var requestTimeout = setTimeout(function(){
                    if(timeOut > 0){
                        xmlhttp.abort();
                        baldrick.fn.log('Timeout ('+timeOut+'ms)');
                    }
                }, timeOut);
            }
            xmlhttp.onreadystatechange=function(){
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                    clearTimeout(requestTimeout);
                    if(progress){
                        if(typeof window[progress] == 'function'){
                            window[progress]({response: xmlhttp.responseText, completed: 100});
                        }else{
                            progress.style.width = '100%';
                        }
                    }
                    if(loadelement){loadelement.className = classname;}
                    if(target && _cache[element.id] !== undefined){
                        if(_cache[element.id].html == null){
                            _cache[element.id].html = xmlhttp.responseText;
                            delete _cache[element.id].xmlhttp;
                        }else{
                            target.innerHTML=xmlhttp.responseText;
                            delete target.xmlhttp;
                        }
                    }else{
                        if(target){
                            target.innerHTML=xmlhttp.responseText;
                            delete target.xmlhttp;
                        }
                        if(callback){
                            var script = document.createElement("script");
                            script.setAttribute('type', 'text/javascript');
                            if(callbacktype == 'html' || callbacktype == 'HTML'){
                                window[callback](xmlhttp.responseText);
                            }else{
                                if(JSON){
                                    window[callback](JSON.parse(xmlhttp.responseText));
                                }else{
                                    script.text = callback+'('+xmlhttp.responseText+');';
                                    document.head.appendChild(script);
                                    document.head.removeChild(document.head.lastChild);
                                }
                            }
                        }
                        success(xmlhttp);
                    }
                }
                if (xmlhttp.readyState == 4 && xmlhttp.status == 307){
                    clearTimeout(requestTimeout);
                    baldrick.fn.log('HTTP Status: 307');
                    document.location = './';
                }
                if (xmlhttp.readyState == 4 && xmlhttp.status != 200 && xmlhttp.status != 307){
                    if(loadelement){loadelement.className = classname;}
                    clearTimeout(requestTimeout);
                    if(xmlhttp.status){
                        baldrick.fn.log('HTTP Status: '+xmlhttp.status);
                    }
                    if(target){
                        delete target.xmlhttp;
                    }
                    if(fail){
                        fail(xmlhttp);
                        baldrick.fn.log('Request failed');
                    }
                    if(progress){
                        if(typeof window[progress] == 'function'){
                            window[progress]({response: xmlhttp.responseText, completed: 0});
                        }else{
                            progress.style.width = '0%';
                        }
                    }

                }
            }
            xmlhttp.open(arguments[0].method,processor,true);
            if(callbacktype == 'json' || callbacktype == 'JSON'){xmlhttp.setRequestHeader ("Accept", "application/json,text/javascript");}
            if(arguments[0].method == 'POST'){
                if(!window.FileReader){
                    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                }else{
                    if(xmlhttp.upload && progress){
                        xmlhttp.upload.onprogress = function (event) {
                            if (event.lengthComputable) {
                                if(typeof window[progress] == 'function'){
                                    window[progress]({loaded: event.loaded, total: event.totalSize, completed: (event.loaded / event.totalSize * 100)});
                                }else{
                                    progress.style.width = (event.loaded / event.totalSize * 100)+'%';
                                }
                            }
                        }
                    }
                }
            }else{
                if(typeof window[arguments[0].callback] == 'function'){
                }
                xmlhttp.open(arguments[0].method,processor,true);
                xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            }
            if(arguments[1].data){
                if(!window.FileReader){
                    arguments[1].data = serialize(arguments[1].data);
                }
                xmlhttp.send(arguments[1].data);
            }else{
                xmlhttp.send();
            }
        },
        hashAction: function(e){
            var lastTrigger = window.location.hash.substring(2);
            element = document.getElementById(lastTrigger);
            if(element){
              baldrick.fn.doAction(element, e);
            }
        },
        buildHash: function(element){
            if(!element){return;}
            window.location = '#!'+element.id;
        },
        formObject: function(form) {
            if (!form || form.nodeName !== "FORM") {
                return;
            }
            var i, j, q = new Object;
            for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                if (form.elements[i].name === "") {
                    continue;
                }
                switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                    case 'text':
                    case 'hidden':
                    case 'password':
                    case 'button':
                    case 'reset':
                    case 'submit':
                    case 'TEXTAREA':
                        q[form.elements[i].name] = form.elements[i].value;
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (form.elements[i].checked) {
                            q[form.elements[i].name] = form.elements[i].value;
                        }
                        break;
                    case 'file':
                        baldrick.fn.log('Browser does not support file uploads file API');
                        break;
                    }
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                    case 'select-one':
                        q[form.elements[i].name] = form.elements[i].value;
                        break;
                    case 'select-multiple':
                        for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            if (form.elements[i].options[j].selected) {
                                q[form.elements[i].name][j] = form.elements[i].options[j].value;
                            }
                        }
                        break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                    case 'reset':
                    case 'submit':
                    case 'button':
                        q[form.elements[i].name] = form.elements[i].value;
                        break;
                    }
                    break;
                }
            }
            return q;
        },
        log: function(){}
    }
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            baldrick(bindClass);
            clearInterval(readyStateCheckInterval);
        }
    }, 10);