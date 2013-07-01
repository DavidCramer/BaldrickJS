/* BaldrickJS V0.4 | (C) David Cramer & Rory McGuire - 2013 | MIT License */
var bindClass = '.trigger',
triggers,
actionQueued,
baldrick,
bldrk = function(bindClass){        
	return new bldrk.fn.bindTriggers(bindClass);
};
bldrk.fn = bldrk.prototype = {
	bindTriggers: function(bindClass){
		jQuery(bindClass+':not(.bldrk)').each(function(){
			this.delay = 0;
			var eventType = (this.nodeName == 'FORM' ? 'submit' : (jQuery(this).data('event') ? jQuery(this).data('event') : 'click'));
			//console.log(this.attributes);
			for(var att=0; att<this.attributes.length; att++){
				var value = this.attributes[att].value;
				//console.log(this.attributes[att].name);
				switch (this.attributes[att].name){
					case 'data-init':
						if(typeof window[value] == 'function'){window[value](this)};
						this.removeAttribute('data-init');
					break;
					case 'data-poll':
						if(value > 0){
							this.removeAttribute('data-poll');
							if(this._bldrkPoll){
								clearInterval(this._bldrkPoll);
							}
							this._bldrkPoll = setInterval(function(el){
								if(el.parentNode !== null){
									bldrk.fn.doAction(el);
								}else{
									clearInterval(el._bldrkPoll);
								}
							},value, this);
						}
					// fall through to load the first poll.
					case 'data-autoload':
						if(value){
							this.removeAttribute('data-autoload');
							if(value == 'clean'){this.setAttribute('data-once', true);}
							var dly = (this.getAttribute('data-delay') ? this.getAttribute('data-delay'):0);
							this._bldrkDelay = setTimeout(function(el){
								if(el.parentNode !== null){
									bldrk.fn.doAction(el);
								}else{
									clearTimeout(this._bldrkDelay);
								}
							},dly, this);
						}
					break;
					default:
					break;
				}
			}
			if(!this._isTrigger){
				this._isTrigger = true;
				jQuery(this).addClass('bldrk');
				if(this.addEventListener) {
				  this.addEventListener(eventType, bldrk.fn.queueEvent, false);
				}else if(this.attachEvent){
				  this.attachEvent('on'+eventType, bldrk.fn.queueEvent);
				}
			}
		});
		window.addEventListener('hashchange', bldrk.fn.hashAction, false);
	},
	queueEvent: function(e){
		var element  = this;
		if(element.getAttribute('data-before')){
			if(typeof window[element.getAttribute('data-before')] == 'function'){
				if(window[element.getAttribute('data-before')](e, element) == false){
					return;
				}
			}
		}
		e.preventDefault();
		if(element.getAttribute('data-for')){
			element = (document.getElementById(element.getAttribute('data-for')) ? document.getElementById(element.getAttribute('data-for')) : element);
		}
		if(this.getAttribute('data-delay')){
			if(element._actionQueue){clearTimeout(element._actionQueue);}
			element._actionQueue = setTimeout(function(){
				bldrk.fn.buildHash(element);
				bldrk.fn.doAction(element, e);
			}, this.getAttribute('data-delay'));
		}else{
			bldrk.fn.buildHash(element);
			bldrk.fn.doAction(element, e);
		}
	},
	doAction: function (el, ev){
		jQuery(el).doAction({}, ev);
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
	log: function(){}
};
// pull in jQuery methods
// wrapped the definition in a ready to prevent premature binding;
jQuery(function($){
	(function ( $, window, document, undefined ) {
		//pull in baldrick for later use
		bldrk.fn.bindTriggers.prototype = bldrk.fn;
		var baldrick = bldrk(bindClass);
		var defaults = {
			activeclass : "active",
			loadclass   : "loading",
			url         : null,
			method      : "GET",
			timeout 	: false,
			baldrick	: baldrick
		};
		// plugin constructor
		$.fn.doAction = function(options, e){			
			this.options = $.extend({}, defaults, options );
			this._defaults = defaults;
			if (this.length > 1){
				this.each(function() { $(this).doAction(options) });
				return this;
			}
			var element     = this,
				vars        = (element.data() ? element.data() : {}),
				activeclass = (element.data('activeClass') ? element.data('activeClass') : element.options.activeclass),
				data        = {},
				target, loadelement;
				data.data   = vars;

			if(element.data('dataStart')){
				if(window[element.data('dataStart')](e) === false){
					return false;
				}
			}
			this.init = function(ev){
				// remove the old event for hash
				window.removeEventListener('hashchange', element.options.baldrick.hashAction);
				// success functions determind by targets and callbacks
				if(typeof vars.target === 'undefined'){
					if(vars.callback){
						if(typeof window[vars.callback] === 'function'){
							target = vars.callback;
						}
					}
				}else{
					target = (jQuery(element.data('target')).length > 0 ? jQuery(element.data('target')) : (jQuery('#'+element.data('target')).length > 0 ? jQuery('#'+element.data('target')) : element.data('target')));
				}
				// base request
				var request = {
					type: (element.data('method') ? element.data('method') : (element.attr('method') ? element.attr('method') : element.options.method)),
					url: element.options.url,
					data: data.data,
					timeout: (element.data('timeout') ? element.data('timeout') : element.options.timout),
					complete: function(){
						if(element.data('once')){
							if(element.data('once') === true){
								element.remove();
							}
						}
						if(typeof loadelement !== 'undefined'){
							loadelement.removeClass(element.options.loadclass);
						}
						bldrk(bindClass);
					}
				}

				// if no target - keep going as it will be silent
				if(typeof target !== 'undefined'){
					//	return false;
					// get a loaderElement
					if(element.data('loadElement')){
						var loadelement = (jQuery(element.data('loadElement')).length > 0 ? jQuery(element.data('loadElement')) : jQuery('#'+element.data('loadElement')));
					}
					if(target.length > 0 && typeof target !== 'string'){
						if(typeof loadelement !== 'undefined'){
							if(loadelement.length === 0){
								loadelement = target;
							}
						}else{
							loadelement = target;
						}
						loadelement.addClass(element.options.loadclass);
						request.success = function(response,status,xhr){
							if(vars.targetInsert){
								if(vars.targetInsert !== 'append' && vars.targetInsert !== 'prepend'){
									vars.targetInsert = 'html';
								}
								target[vars.targetInsert](response);
							}else{
								if(target.is(':input')){
									target.val(response);
								}else{
									target.html(response);
								}
							}
							if(element.data('success')){
								window[element.data('success')](response,element,xhr);
							}
						}
						request.error = function(response,status,xhr){
							if(element.data('fail')){
								window[element.data('fail')](response,element,xhr);
							}
						}
					}else{
						if(typeof loadelement !== 'undefined'){
							loadelement.addClass(element.options.loadclass);
						}
						request.success = function(response,status,xhr){
							if(typeof window[target] === 'function'){
								window[target](response,element,xhr);
							}
							if(element.data('success')){
								window[element.data('success')](response,element,xhr);
							}						
						}
						request.error = function(response,status,xhr){
							if(element.data('fail')){
								window[element.data('fail')](response,status,xhr);
							}
						}
					}
					// abort any request active on target or trigger
					if(target.length > 0){
						if(target[0].xhr){
							target[0].xhr.abort();
							delete target[0].xhr;
						}
					}else{
						if(element[0].xhr){
							element[0].xhr.abort();
							delete element[0].xhr;
						}
					}

				}
				// add elements value if there is one
				if(element.val()){
					request.data.value  = element.val();
				}
				if(vars.group){
					jQuery(bindClass+'[data-group="'+vars.group+'"]').removeClass(activeclass);
				}else{
					jQuery(bindClass+':not([data-group])').removeClass(activeclass);
				}
				element.addClass(activeclass);

				if(vars.method){
					request.type = vars.method;
				}
				if(element.prop('type') === 'file' || element.is('form')){
					if(typeof FormData === 'function'){
						var formData = new FormData();
						for(var key in data){
							if(key == 'data'){
								for(var datakey in data[key]){
									formData.append(datakey, data[key][datakey]);
								}
							}else{
								formData.append(key, data[key]);
							}
						}
						if(element.is('form')){
							for(var i = 0; i<element.context.elements.length;i++){
								if(element.context.elements[i].name){
									formData.append(element.context.elements[i].name, element.context.elements[i].value);
								}
							}
						}else{
							if(element.context.name){
								formData.append(element.context.name, element.context.files[0]);
							}
						}
					}else{
						// resort to an object method- no file uploads :(
						var formData = {};
						for(var key in data.data){
							formData[key] = data.data[key];
						}
						for(var i = 0; i<element.context.elements.length;i++){
							if(element[0].elements[i].name){
								formData[element[0].elements[i].name] = element[0].elements[i].value;
							}
						}
					}
					request.data = formData;
					if(typeof FormData === 'function'){
						request.processData = false;
						request.contentType = false;						
						request.xhr = function() {
							var xhr = new window.XMLHttpRequest();
							//Upload progress
							xhr.upload.addEventListener("progress", function(evt){
								if (evt.lengthComputable){
									var percentComplete = (evt.loaded/evt.total)*100;
									if(element.data('progress')){
										jQuery('#'+element.data('progress')).width(percentComplete+'%');
									}else{
										if(typeof window[element.data('progress')] == 'function'){
											window[element.data('progress')](percentComplete, evt);
										}
									}
								}
							}, false);
							//Download progress
							xhr.addEventListener("progress", function(evt){
								if (evt.lengthComputable) {
									var percentComplete = evt.loaded / evt.total;
									if(element.data('progress')){
										jQuery('#'+element.data('progress')).width('100%');
									}else{
										if(typeof window[element.data('progress')] == 'function'){
											window[element.data('progress')](100, evt);
										}
									}
								}
							}, false);
							return xhr;
						}
					}
				}
				if(vars.request){
					if(typeof window[vars.request] !== 'function'){
						request.url = vars.request;
					}
				}else if(element.context.href){
					request.url = element.context.href;
				}else if(element.context.action){
					request.url = element.context.action;
				}
				if(request.url === null){
					// if request is function
					// do calback if set
					if(typeof window[vars.request] === 'function'){
						clearTarget(element);
						try {
							var cbData = window[vars.request](request.data, element[0], e);
							request.success(cbData, element, vars.request);
						}
						catch(e){
							if(typeof request.error === 'function'){
								request.error(e, element, vars.request);
							}
						}
					}
					if(vars.callback){
						if(typeof window[vars.callback] === 'function'){
							window[vars.callback](element[0], e);
							clearTarget(element);
						}
					}
					request.complete();
					return;
				}else{
					if(typeof target !== 'undefined'){
						clearTarget(element);
						if(target.length > 0){
							target[0].xhr = jQuery.ajax(request);
						}else{
							element[0].xhr = jQuery.ajax(request);
						}
					}else{
						jQuery.ajax(request);
					}
				}

			}
			var clearTarget = function(element){
				if(element.data('clear')){
					var clear = (jQuery(element.data('clear')).length > 0 ? jQuery(element.data('clear')) : jQuery('#'+element.data('clear')));
					clear.each(function(){
						if(this.nodeName.toLowerCase() === 'input'){
							this.value = null;
						}else{
							jQuery(this).empty();
						}
					})
				}
			}
			return this.init(e);
		}
	})( jQuery, window, document);
});