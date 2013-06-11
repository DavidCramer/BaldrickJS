;(function ( $, window, document, undefined ) {
	var actionQueued,
		bldrk,
		pluginName = "baldrick",
			defaults = {
				trigger		: "trigger",
				activeclass	: "active",
				loadclass	: "loading",
				url			: null,
				method		: "POST"
			};

	// plugin constructor
	function Plugin( element, options ) {
		bldrk = this;
		this.element = element;
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		if(arguments[1]){
			if(arguments[1] == 'doAction'){
				this[arguments[1]](arguments[0]);
			}
		}else{
			this.bindTriggers();
		}
	}
	Plugin.prototype = {
		bindTriggers: function() {
			var context = document;
			if(arguments.length > 0){
				context = arguments[0];
			}
			jQuery('.'+this.options.trigger+':not([data-trigger])', context).each(function(){
				var event 		= 'click',
					processing	= false,
					element		= jQuery(this);
				if(element.is('form')){
					event = 'submit';
				}
				if(element.data('event')){
					event = jQuery(this).data('event');
				}


				jQuery(this).on(event, function(e){
					//console.log(this);					
					bldrk.queueEvent(e, this);
				})
			})

			return this;
		},
		queueEvent: function(e, el) {

			var element 	=jQuery(el),
				vars 		= element.data(),
				loadclass 	= 'loading',
				activeclass = 'active',
				delay		= 0,
				target,
				success;

			// before
			if(element.data('before')){
				if(typeof window[element.data('before')] == 'function'){
					if(window[element.data('before')](element, e) == false){
						return false;
					}
				}
			}
			
			// stop default
			e.preventDefault();
			if(element.context._process){
				clearTimeout(element.context._process);
			}
			// set delay
			if(element.data('delay')){
				delay = parseFloat(element.data('delay'));
			}
			element.context._process = setTimeout(function(){
				// do action
				bldrk.doAction(el, e);
			},delay)

		},
		doAction: function(el, ev){
			var element		= jQuery(el),
				vars 		= element.data(),
				data 		= {},
				target;
				data.data 	= vars;

			if(el.value){
				data.value	= el.value;
			}
			// success functions
			if(!vars.target){
				target = jQuery(element);
			}else{
				if(vars.target.substr(0,1) == '.' || vars.target.substr(0,1) == '#'){
					target = jQuery(vars.target);
				}else{
					target = jQuery('#'+vars.target);
				}
			}
			if(target.length > 0){		
				success = function(response,status,xhr){
					target.removeClass(bldrk.options.loadclass);
					if(vars.targetInsert){
						if(vars.targetInsert !== 'append' && vars.targetInsert !== 'prepend'){
							vars.targetInsert = 'html';
						}
						target[vars.targetInsert](response);
					}else{
						target.html(response);
					}
				}
			}else{
				target = vars.target;
				if(typeof window[target] == 'function'){
					success = function(response,status,xhr){
						window[target](response);
					}
				};
			}
			var request = {
				type: bldrk.options.method,
				url: bldrk.options.url,
				data: data,
				success: success,
				complete: function(){
					bldrk.bindTriggers(target);
				}
			}
			if(vars.group){
				jQuery('.trigger[data-group="'+vars.group+'"]').removeClass(bldrk.options.activeclass);
			}else{
				jQuery('.trigger:not([data-group])').removeClass(bldrk.options.activeclass);
			}
			element.addClass(bldrk.options.activeclass);
			if(target){
				if(target[0].xhr){
					target[0].xhr.abort();
					delete target[0].xhr;
				}
			}
			if(vars.method){
				request.type = vars.method;
			}
			if(element.prop('type') === 'file' || element.is('form')){
				formData = new FormData();
				for(var key in data){
					if(key == 'data'){
						for(var datakey in data[key]){
							formData.append(key+'['+datakey+']', data[key][datakey]);
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
				request.data = formData;
				request.type = "POST";
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
			if(vars.request){
				request.url = vars.request;
			}
			if(request.url == null){
				return;
			}
			bldrk.doRequest(element, request, target);
		},
		doRequest: function(element, request, target){			
			target[0].xhr = jQuery.ajax(request);
		},
		log: function(){}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin( this, options ));
			}
		});
	};

	$('html').baldrick();

})( jQuery, window, document );
