/* BaldrickJS  V2.01 | (C) David Cramer - 2013 | MIT License */
(function($){

	var baldrickCache = {},
		baldrickhelpers = {
		bind			: {},
		event			: {
			_event		: function(el,e){
				return el;
			}
		},
		filter			: {
			_totarget	: function(opts){
				if(opts.params.target){
					opts.params.target[opts.params.targetInsert](opts.data);

					if(typeof opts.params.callback === 'string'){
						if(typeof window[opts.params.callback] === 'function'){
							return window[opts.params.callback](opts);
						}
					}else if(typeof opts.params.callback === 'function'){
						return opts.params.callback(opts);
					}
				}
			}
		},
		request			: {
			_dorequest	: function(opts){
				
				if(opts.request.url.indexOf('#_cache_') > -1){
					if(typeof baldrickCache[opts.request.url.split('#_cache_')[1]] === 'object'){
						return {data: baldrickCache[opts.request.url.split('#_cache_')[1]]};
					}
				}
				return $.ajax(opts.request);
			}
		},
		request_complete: {
			_docomplete	: function(opts){
				opts.params.complete(opts);
				opts.params.loadElement.removeClass(opts.params.loadClass);
			}
		},
		request_error	: {
			_doerror	: function(opts){
				opts.params.complete(opts.jqxhr,opts.textStatus);
			}
		},
		refresh	: {
			_dorefresh	: function(opts, defaults){
				$(defaults.triggerClass).baldrick(defaults);
			}
		}
	};

	$.fn.baldrick = function(){

		var triggerClass	= this.selector,
			inst			= this.not('._tisBound');

		inst.addClass('_tisBound');
		var defaults		= $.extend(true, arguments[0], { helpers : baldrickhelpers}, {triggerClass:triggerClass}),
			ncb				= function(){return true;},
			callbacks		= {
				"before"	: ncb,
				"callback"	: false,
				"complete"	: ncb,
				"error"		: ncb
			},
			output;
		for(var c in callbacks){
			if(typeof defaults[c] === 'string'){
				callbacks[c] = (typeof window[defaults[c]] === 'function' ? window[defaults[c]] : ncb);
			}else if(typeof defaults[c] === 'function'){
				callbacks[c] = defaults[c];
			}
		}
		var do_helper = function(h,input, ev){
			var out;
			if(typeof defaults.helpers[h] === 'object'){
				for(var helper in defaults.helpers[h]){
					if(typeof defaults.helpers[h][helper] === 'function'){
						out = defaults.helpers[h][helper](input, defaults, ev);
						if(typeof out !== 'undefined'){ input = out;}
						if(input === false){return false;}
					}
				}
			}else if(typeof defaults.helpers[h] === 'function'){
				out = defaults.helpers[h](input, defaults, ev);
				if(typeof out !== 'undefined'){ input = out;}
				if(!input){return false;}
			}
			return input;
		};

		inst = do_helper('bind', inst);
		if(inst === false){return this;}
		return do_helper('ready', inst.each(function(key){
			if(!this.id){
				this.id = "baldrick_trigger_" + (new Date().getTime() + key);
			}
			var el = $(this), ev = (el.data('event') ? el.data('event') : (defaults.event ? defaults.event : ( el.is('form') ? 'submit' : 'click' )));
			el.on(ev, function(e){

				var tr = $(do_helper('event', this, e));

				if(tr.data('for')){
					var fort		= $(tr.data('for')),
						datamerge	= $.extend({}, tr.data());
						delete datamerge['for'];
					fort.data(datamerge);
					return fort.trigger((fort.data('event') ? fort.data('event') : ev));
				}
				if(tr.is('form') && !tr.data('request') && tr.attr('action')){
					tr.data('request', tr.attr('action'));
				}
				if(tr.is('a') && !tr.data('request') && tr.attr('href')){
					tr.data('request', tr.attr('href'));
				}

				if((tr.data('before') ? (typeof window[tr.data('before')] === 'function' ? window[tr.data('before')](this, e) : callbacks.before(this, e)) : callbacks.before(this, e)) === false){return;}

				var params = {
					trigger: tr,
					callback : (tr.data('callback')		? ((typeof window[tr.data('callback')] === 'function') ? window[tr.data('callback')] : tr.data('callback')) : callbacks.callback),
					method : (tr.data('method')			? tr.data('method')				: (tr.attr('method')		? tr.attr('method') :(defaults.method ? defaults.method : 'GET'))),
					dataType : (tr.data('type')			? tr.data('type')				: (defaults.dataType		? defaults.dataType : false)),
					target : (tr.data('target')			? $(tr.data('target'))			: (defaults.target			? $(defaults.target) : $('<html>'))),
					targetInsert : (tr.data('targetInsert')	? (tr.data('targetInsert') === 'replace' ? 'replaceWith' : tr.data('targetInsert'))	: (defaults.targetInsert ? (defaults.targetInsert === 'replace' ? 'replaceWith': defaults.targetInsert) : 'html')),
					loadClass : (tr.data('loadClass')		? tr.data('loadClass')			: (defaults.loadClass		? defaults.loadClass : 'loading')),
					activeClass : (tr.data('activeClass')	? tr.data('activeClass')		: (defaults.activeClass		? defaults.activeClass : 'active')),
					activeElement : (tr.data('activeElement')	? (tr.data('activeElement') === '_parent' ? tr.parent() :$(tr.data('activeElement')))	: (defaults.activeElement ? (defaults.activeElement === '_parent' ? tr.parent() : $(defaults.activeElement)) : tr)),
					cache : (tr.data('cache')			? tr.data('cache')				: (defaults.cache			? defaults.cache : false)),
					complete : (tr.data('complete')		? (typeof window[tr.data('complete')] === 'function'		? window[tr.data('complete')] : callbacks.complete ) : callbacks.complete),
					resultSelector : false
				};
				params.url			= (tr.data('request')		? tr.data('request')			: (defaults.request			? defaults.request : params.callback));
				params.loadElement	= (tr.data('loadElement')	? $(tr.data('loadElement'))		: (defaults.loadElement		? ($(defaults.loadElement) ? $(defaults.loadElement) : params.target) : params.target));

				params = do_helper('params', params);
				if(params === false){return false;}

				switch (typeof params.url){
					case 'function' : return params.url(this, e);
					case 'boolean' :
					case 'object': return;
					case 'string' :
						if(params.url.indexOf(' ') > -1){
							var rp = params.url.split(' ');
							params.url	= rp[0];
							params.resultSelector	= rp[1];
						}
				}

				e.preventDefault();
				var active = (tr.data('group') ? $('._tisBound[data-group="'+tr.data('group')+'"]').each(function(){
					var or  = $(this),
						tel = (or.data('activeElement') ? (or.data('activeElement') === '_parent' ? or.parent() :$(or.data('activeElement'))) : (defaults.activeElement ? (defaults.activeElement === '_parent' ? tr.parent() : $(defaults.activeElement)) : or) );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : (defaults.activeClass ? defaults.activeClass : params.activeClass)));}
				) : $('._tisBound:not([data-group])').each(function(){
					var or  = $(this),
						tel = (or.data('activeElement') ? (or.data('activeElement') === '_parent' ? or.parent() :$(or.data('activeElement'))) : (defaults.activeElement ? (defaults.activeElement === '_parent' ? tr.parent() : $(defaults.activeElement)) : or) );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : (defaults.activeClass ? defaults.activeClass : params.activeClass)));}
				));
				
				params.activeElement.addClass(params.activeClass);
				params.loadElement.addClass(params.loadClass);

				var sd = tr.serializeArray(), data;
				if(sd.length){
					var arr = [];
					$.each( tr.data(), function(k,v) {
						arr.push({name:k, value:v});
						if(k.indexOf('field')>-1){
							tmp.push({name: k.substr(5).toLowerCase(), value: v});
						}
					});
					data = $.extend(arr,sd);
				}else{
					var tmp = [];
					$.each( tr.data(), function(k,v) {
						tmp.push({name: k, value:v});
						if(k.indexOf('field')>-1){
							tmp.push({name: k.substr(5).toLowerCase(), value: v});
						}
					});
					data = $.param(tmp);
				}

				var request = {
						url		: params.url,
						data	: data,
						cache	: params.cache,
						type	: params.method,
						success	: function(dt, ts, xhr){

							if(params.resultSelector){
								if(typeof dt === 'object'){
									var traverse = params.resultSelector.replace(/\[/g,'.').replace(/\]/g,'').split('.'),
										data_object = dt;
									for(var i=0; i<traverse.length; i++){
										data_object = data_object[traverse[i]];
									}
									dt = data_object;
								}else if (typeof dt === 'string'){
									var tmp = $(params.resultSelector, $('<html>').html(dt));
									if(tmp.length === 1){
										dt = $('<html>').html(tmp).html();
									}else{
										dt = $('<html>');
										tmp.each(function(){
											dt.append(this);
										});
										dt = dt.html();
									}
								}
							}
							var rawdata = dt;
							do_helper('filter', {data:dt, rawData: rawdata, request: request, params: params});
						},
						complete: function(xhr,ts){
							
							do_helper('request_complete', {jqxhr:xhr, textStatus:ts, request:request, params:params});
							
							do_helper('refresh', {jqxhr:xhr, textStatus:ts, request:request, params:params});

							if(tr.data('once')){
								tr.off(ev).removeClass('_tisBound');
							}
						},
						error: function(xhr,ts,ex){
							do_helper('request_error', {jqxhr:xhr, textStatus:ts, error:ex, request:request, params:params});
						}
					};
				if(params.dataType){
					request.dataType = params.dataType;
				}
				request = do_helper('request_params', request, params);
				if(request === false){return inst;}

				var request_result = do_helper('request', {request: request, params: params});
				if(request_result.data){
					var dt		= request_result.data,
						rawdata = dt;

					do_helper('filter'			, {data:dt, rawData: rawdata, request: request, params: params});
					do_helper('request_complete', {jqxhr:false, textStatus:true, request:request, params:params});
					do_helper('refresh'			, {jqxhr:false, textStatus:true, request:request, params:params});

					//console.log(request_result.data);
				}
			});
			if(el.data('autoload') || el.data('poll')){
				if(el.data('delay')){
					setTimeout(function(el, ev){
						return el.trigger(ev);
					}, el.data('delay'), el, ev);
				}else{
					el.trigger(ev);
				}
			}

			if(el.data('poll')){
				if(el.data('delay')){
					setTimeout(function(el, ev){
						return setInterval(function(el, ev){
							return el.trigger(ev);
						}, el.data('poll'), el, ev);
					}, el.data('delay'));
				}else{
					setInterval(function(el, ev){
						return el.trigger(ev);
					}, el.data('poll'), el, ev);
				}
			}
			return this;
		}));
	};
	$.fn.baldrick.cacheObject = function(id, object){
		baldrickCache[id] = object;
	};
	$.fn.baldrick.registerhelper = function(helper, slug, callback){
		if(typeof helper === 'object'){
			baldrickhelpers = $.extend(true, helper, baldrickhelpers);
		}else if(typeof helper === 'string' && typeof slug === 'string' && typeof callback === 'function'){
			var newhelper = {};
			newhelper[helper] = {};
			newhelper[helper][slug] = callback;
			baldrickhelpers = $.extend(true, newhelper, baldrickhelpers);
		}
		
	};
	jQuery(function($){
		$('.baldrick').baldrick();
	});
})(jQuery);