/* bldrkJS  V0.0.2 | (C) David Cramer & Rory McGuire - 2013 | MIT License */
    var bindClass = 'trigger',
    triggers,
    actionQueued,
    bldrk = function(bindClass){        
        return new bldrk.fn.bindTriggers(bindClass);
    };
    bldrk.fn = bldrk.prototype = {
        bindTriggers: function(bindClass){
            var bindings    = false, autoloads   = [];
            if(document.getElementsByClassName(bindClass)){
                bindings    = document.getElementsByClassName(bindClass);
            }            
            for(i=0;i<bindings.length;i++){
                bindings[i].delay = 0;
                var eventType = (bindings[i].nodeName == 'FORM' ? 'submit' : 'click'), hashChange = true;;
                for(var att in bindings[i].attributes){
                    if(bindings[i].attributes[att]){
                        var value = bindings[i].attributes[att].value;
                        switch (bindings[i].attributes[att].name){
                            case 'data-init':
                                if(typeof window[value] == 'function'){window[value](bindings[i])};
                                bindings[i].removeAttribute('data-init');
                            break;
                            case 'data-delay':
                                bindings[i].delay = value;
                            break;
                            case 'data-poll':
                                if(value > 0){
                                    bindings[i].removeAttribute('data-poll');
                                    setInterval(function(){
                                        bldrk.fn.doAction(arguments[0]);
                                    },value, bindings[i]);
                                }
                            // fall through to load the first poll.
                            case 'data-autoload':
                                if(value){
                                    bindings[i].removeAttribute('data-autoload');
                                    if(value == 'clean'){bindings[i].setAttribute('data-once', true);}
                                    var dly = (bindings[i].getAttribute('data-delay') ? bindings[i].getAttribute('data-delay'):0);
                                    setTimeout(function(){
                                        bldrk.fn.doAction(arguments[0]);
                                    },dly, bindings[i]);
                                }
                            break;
                            case 'data-event':
                                eventType = value;
                            break;
                            case 'data-history':
                                if(value == 'off'){
                                    hashChange = false;
                                }
                            break
                            default:
                            break;
                        }
                    }
                }
                if(!bindings[i]._isTrigger){
                    bindings[i]._isTrigger = true;
                    if(bindings[i].addEventListener) {
                      bindings[i].addEventListener(eventType, bldrk.fn.queueEvent, false);
                    }else if(bindings[i].attachEvent){
                      bindings[i].attachEvent('on'+eventType, bldrk.fn.queueEvent);
                    }
                }
            }
            if(hashChange){
                window.addEventListener('hashchange', bldrk.fn.hashAction, false);
            }
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
            if(actionQueued){clearTimeout(actionQueued);}
            actionQueued = setTimeout(function(){
                bldrk.fn.buildHash(element);
                bldrk.fn.doAction(element, e);
            }, element.delay);
        },
        doAction: function(element, ev){
            if(typeof element === 'string'){
                if(document.getElementById(element)){
                    element = document.getElementById(element);
                }else{
                    return;
                }
            }
            if(!element){
                bldrk.fn.log('Invalid trigger element');
                return;
            }
            window.removeEventListener('hashchange', bldrk.fn.hashAction);
            var target = (element.getAttribute('data-target') ? document.getElementById(element.getAttribute('data-target')) : null);
            if(target){
                if(target.xmlhttp){
                    target.xmlhttp.abort();
                }
            }else{ 
                if(element.getAttribute('data-target')){
                    if(document.getElementsByClassName(element.getAttribute('data-target').substr(1))){
                        var target = document.getElementsByClassName(element.getAttribute('data-target').substr(1));
                    }
                }
            }
            var action = {
                request     : (element.getAttribute('data-request') ? element.getAttribute('data-request') : null),
                hrefaction  : (element.href ? element.href : (element.nodeName == "FORM" ? (element.getAttribute('action') ? element.getAttribute('action') : requestURL) : null)),
                callback    : (element.getAttribute('data-callback') ? element.getAttribute('data-callback') : (element.getAttribute('data-target') ? element.getAttribute('data-target') : null)),
                success     : (element.getAttribute('data-success') ? element.getAttribute('data-success') : null),
                fail        : (element.getAttribute('data-fail') ? element.getAttribute('data-fail') : null),
                activeClass : (element.getAttribute('data-active-class') ? element.getAttribute('data-active-class') : 'active'),
                method      : (element.getAttribute('data-method') ? element.getAttribute('data-method').toUpperCase() : (element.nodeName == "FORM" ? (element.getAttribute('method').toUpperCase() ? element.getAttribute('method').toUpperCase() : 'GET') : 'GET')),
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

            if(window.FileReader && action.method == 'POST' && FormData){
                var data    = (element.nodeName == "FORM" ? new FormData(element) : new FormData());
                if(value != false){data.append('value', value);}
            }else{
                //var data    = (element.nodeName == "FORM" ? element : new FormData());
                var data    = {}
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
                bldrk.fn.log('Invalid target or no target defined. set either data-target or data-calback', element, ev);
            }
            if((action.request || action.hrefaction) && (target || typeof window[action.callback] == 'function' || action.progress)){
                try{
                    bldrk.fn.doRequest(action, {
                        element: element,
                        success: function(e){
                            if(typeof window[action.success] == 'function'){window[action.success](element,e);}
                            if(element.getAttribute('data-once')){
                                element.parentNode.removeChild(element);
                            }
                            bldrk.fn.bindTriggers(bindClass);
                        },
                        fail: function(e){
                            if(typeof window[action.fail] == 'function'){window[action.fail](element,e);}
                            bldrk.fn.bindTriggers(bindClass);
                        },
                        data: data
                    });
                }catch(err){
                    bldrk.fn.log(err);
                }
            }else{
                bldrk.fn.log('No request URL defined');
                if(typeof window[action.callback] == 'function'){window[action.callback](element, ev);bldrk.fn.bindTriggers(bindClass);}
                if(element.getAttribute('data-clear')){
                    var list = element.getAttribute('data-clear').split(';');
                    list.forEach(function(e){
                        if(document.getElementById(e)){
                            if(document.getElementById(e).nodeName == 'INPUT'){
                                document.getElementById(e).value = null;
                            }else{
                                document.getElementById(e).innerHTML = '';    
                            }
                            
                        }
                    });
                }
            }
        },
        doRequest: function(){            
            var xmlhttp;
            var element = arguments[1].element;
            var processor = (arguments[0].request ? arguments[0].request : arguments[0].hrefaction);
            var timeOut = (element.getAttribute('data-timeout') ? element.getAttribute('data-timeout') : '30000');
            var target = arguments[0].target;
            var loadelement = (element.getAttribute('data-load-element') ? document.getElementById(element.getAttribute('data-load-element')) : target);
            var loadtext = (element.getAttribute('data-load-text') ? element.getAttribute('data-load-text') : null);
            var progress = arguments[0].progress;
            if(progress){
                if(typeof window[progress] != 'function'){
                    if(document.getElementById(progress)){
                        progress = document.getElementById(progress);
                    }
                }
            }
            if(loadelement){
                if(loadtext){
                    var prevLoadText = '';
                    if(loadelement.innerHTML){prevLoadText = loadelement.innerHTML;}
                    loadelement.innerHTML = loadtext;
                }
                var loadClass = (element.getAttribute('data-load-class') ? element.getAttribute('data-load-class') : 'loading');
                if(loadelement.length){
                    var classname = [];
                    for(i=0;i<loadelement.length;i++){
                        classname.push(loadelement[i].className.replace(' '+loadClass,''));
                        loadelement[i].className = classname[i]+' '+loadClass;                        
                    };
                }else{
                    var classname = loadelement.className.replace(' '+loadClass,'');
                    loadelement.className = classname+' '+loadClass;
                }
            }
            var success = arguments[1].success;
            var fail = arguments[1].fail;
            if(typeof window[arguments[0].callback] == 'function'){
                var callback     = arguments[0].callback;
                var callbacktype= (element.getAttribute('data-callback-type') ? element.getAttribute('data-callback-type') : 'html');
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
            if(target){                
                if(target.length){
                    for(i=0;i<target.length;i++){
                        target[i].xmlhttp = xmlhttp;
                    };
                }else{
                    target.xmlhttp = xmlhttp;
                }
            }
            if(timeOut > 0){
                var requestTimeout = setTimeout(function(){
                    if(timeOut > 0){
                        xmlhttp.abort();
                        bldrk.fn.log('Timeout ('+timeOut+'ms)');
                    }
                }, timeOut);
            }
            xmlhttp.onreadystatechange=function(){
                
                if (xmlhttp.readyState == 4 && xmlhttp.status == 0){
                    if(loadelement){
                        loadelement.innerHTML=prevLoadText;
                    }
                }
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
                    clearTimeout(requestTimeout);
                    if(progress){
                        if(typeof window[progress] == 'function'){
                            window[progress]({response: xmlhttp.responseText, completed: 100});
                        }else{
                            progress.style.width = '100%';
                        }
                    }
                    if(loadelement){
                        if(loadelement.length){
                            for(i=0;i<loadelement.length;i++){
                                loadelement[i].className = classname[i];
                            };
                        }else{                        
                            loadelement.className = classname;
                        }
                    }
                    if(target){
                        if(element.getAttribute('data-target-insert')){
                            switch (element.getAttribute('data-target-insert')){
                                case 'append':
                                case 'after':
                                    if(target.length){
                                        for(i=0;i<loadelement.length;i++){
                                            target[i].innerHTML=target[i].innerHTML+xmlhttp.responseText;
                                        }
                                    }else{
                                        target.innerHTML=target.innerHTML+xmlhttp.responseText;
                                    }
                                break;    
                                case 'prepend':
                                case 'before':
                                    if(target.length){
                                        for(i=0;i<loadelement.length;i++){
                                            target[i].innerHTML=xmlhttp.responseText+target[i].innerHTML;
                                        }
                                    }else{
                                        target.innerHTML=xmlhttp.responseText+target.innerHTML;
                                    }
                                break;    
                                default:
                                    if(target.length){
                                        for(i=0;i<loadelement.length;i++){
                                            target[i].innerHTML=xmlhttp.responseText;
                                        }
                                    }else{
                                        target.innerHTML=xmlhttp.responseText;
                                    }
                                break;    
                            }
                            
                        }else{
                            if(target.length){
                                for(i=0;i<loadelement.length;i++){
                                    target[i].innerHTML=xmlhttp.responseText;
                                    delete target[i].xmlhttp;
                                }
                            }else{
                                target.innerHTML=xmlhttp.responseText;
                                delete target.xmlhttp;
                            }
                        }                        
                        
                    }
                    if(callback){
                        var script = document.createElement("script");
                        script.setAttribute('type', 'text/javascript');
                        if(callbacktype == 'html' || callbacktype == 'HTML'){
                            window[callback](xmlhttp.responseText, element);
                        }else{
                            if(JSON){
                                window[callback](JSON.parse(xmlhttp.responseText), element);
                            }else{
                                script.text = callback+'('+xmlhttp.responseText+');';
                                document.head.appendChild(script);
                                document.head.removeChild(document.head.lastChild);
                            }
                        }
                    }
                    success(xmlhttp);                    
                }
                if (xmlhttp.readyState == 4 && xmlhttp.status == 307){
                    if(loadelement){
                        loadelement.innerHTML=prevLoadText;
                    }
                    clearTimeout(requestTimeout);
                    bldrk.fn.log('HTTP Status: 307');
                    document.location = './';
                }
                if (xmlhttp.readyState == 4 && xmlhttp.status != 200 && xmlhttp.status != 307){
                    if(loadelement){
                        loadelement.innerHTML=prevLoadText;
                        loadelement.className = classname;
                    }
                    clearTimeout(requestTimeout);
                    if(xmlhttp.status){
                        bldrk.fn.log('HTTP Status: '+xmlhttp.status);
                    }
                    if(target){
                        delete target.xmlhttp;
                    }
                    if(fail){
                        fail(xmlhttp);
                        bldrk.fn.log('Request failed');
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
            if(arguments[1].element.getAttribute('data-clear')){
                var list = arguments[1].element.getAttribute('data-clear').split(';');
                list.forEach(function(e){
                    if(document.getElementById(e)){
                        if(document.getElementById(e).nodeName == 'INPUT'){
                            document.getElementById(e).value = null;
                        }else{
                            document.getElementById(e).innerHTML = '';    
                        }
                        
                    }
                });
            }

        },
        hashAction: function(e){
            if(!window.location.hash){document.location = document.location};
            var lastTrigger = window.location.hash.substring(2);
            var vars = lastTrigger.split('&');
            if(vars[0] == '_tr'){
                for(i=1;i<vars.length;i++){
                    var pair = vars[i].split('=');
                    if(pair.length == 1){
                        var hashElement = document.createElement(pair[0]);             
                    }else{
                        if(pair[0] == 'href'){
                            hashElement.setAttribute(pair[0], pair[1]);
                        }else{
                            hashElement.setAttribute('data-'+pair[0], pair[1]);
                        }                        
                    }                
                }
                if(hashElement){
                    bldrk.fn.doAction(hashElement);
                    delete hashElement;
                    return;
                }
            }
        },
        buildHash: function(element){
            if(!element){return;}
            if(element.getAttribute('data-history')){if(element.getAttribute('data-history') == 'off'){return;}}
            if(element.nodeName == 'FORM' || element.nodeName == 'INPUT'){return;}
            var hash = [element.nodeName.toLowerCase()];
            for (var i=0; i<element.attributes.length; i++) {
                name = element.attributes[i].name;
                if (name=='href' || name=='data-request') {
                    var request = encodeURIComponent(element.attributes[i].name.replace('data-', ''))+"="+encodeURIComponent(element.attributes[i].value);
                } else if (name.indexOf('data-')==0) {
                    hash.push(encodeURIComponent(element.attributes[i].name.slice(5))+"="+encodeURIComponent(element.attributes[i].value));
                }
            }
            window.location = '#!_tr&'+hash.join("&")+'&'+request;
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
                    case 'checkbox':
                    case 'radio':
                        if (form.elements[i].checked) {
                            q[form.elements[i].name] = form.elements[i].value;
                        }
                        break;
                    case 'file':
                        bldrk.fn.log('Browser does not support file uploads file API');
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
                default:
                    q[form.elements[i].name] = form.elements[i].value;
                break;

                }
            }
            return q;
        },
        defaults: {

        },
        log: function(){}
    }
    bldrk.fn.bindTriggers.prototype = bldrk.fn;
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            baldrick = bldrk(bindClass);
            clearInterval(readyStateCheckInterval);
        }
    }, 10);