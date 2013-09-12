/* BaldrickJS  V2.01 | (C) David Cramer - 2013 | MIT License */
(function($){

	var baldrickhelpers = {
		bind			: {},
		event			: {
			_event		: function(el,e){
				return el;
			}
		},
		filter			: {},
		params			: {},
		request			: {
			_dorequest	: function(params, el){
				return $.ajax(params);
			}
		}
	};

	$.fn.baldrick = function(){

		var triggerClass	= this.selector,
			inst			= this.not('._tisBound');

		inst.addClass('_tisBound');
		var defaults		= $.extend(true, arguments[0], { helpers : baldrickhelpers}),
			ncb				= function(){return true;},
			callbacks		= {
				"before"	: ncb,
				"callback"	: ncb,
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
		var do_helper = function(h,input,options){
			if(typeof defaults.helpers[h] === 'object'){
				for(var helper in defaults.helpers[h]){
					if(typeof defaults.helpers[h][helper] === 'function'){
						input = defaults.helpers[h][helper](input, options);
						if(!input){return false;}
					}
				}
			}else if(typeof defaults.helpers[h] === 'function'){
				input = defaults.helpers[h](input, options);
				if(!input){return false;}
			}
			return input;
		};

		inst = do_helper('bind', inst);
		if(inst === false){return this;}
		return inst.each(function(){
			var el = $(this), ev = (el.data('event') ? el.data('event') : (defaults.event ? defaults.event : ( el.is('form') ? 'submit' : 'click' )));
			el.on(ev, function(e){
				var tr = $(do_helper('event', this, e));

				if(tr.data('for')){
					var fort		= $(tr.data('for')),
						datamerge	= $.extend({}, tr.data());
						delete datamerge.for;
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

				var cb = (tr.data('callback')		? ((typeof window[tr.data('callback')] === 'function') ? window[tr.data('callback')] : tr.data('callback')) : callbacks.callback),
					re = (tr.data('request')		? tr.data('request')			: (defaults.request			? defaults.request : cb)),
					tp = (tr.data('method')			? tr.data('method')				: (tr.attr('method')		? tr.attr('method') :(defaults.method ? defaults.method : 'GET'))),
					rt = (tr.data('type')			? tr.data('type')				: (defaults.dataType		? defaults.dataType : false)),
					ta = (tr.data('target')			? $(tr.data('target'))			: (defaults.target			? $(defaults.target) : $('<html>'))),
					ti = (tr.data('targetInsert')	? (tr.data('targetInsert') === 'replace' ? 'replaceWith' : tr.data('targetInsert'))	: (defaults.targetInsert ? (defaults.targetInsert === 'replace' ? 'replaceWith': defaults.targetInsert) : 'html')),
					lc = (tr.data('loadClass')		? tr.data('loadClass')			: (defaults.loadClass		? defaults.loadClass : 'loading')),
					ac = (tr.data('activeClass')	? tr.data('activeClass')		: (defaults.activeClass		? defaults.activeClass : 'active')),
					ae = (tr.data('activeElement')	? (tr.data('activeElement') === '_parent' ? tr.parent() :$(tr.data('activeElement')))	: (defaults.activeElement ? (defaults.activeElement === '_parent' ? tr.parent() : $(defaults.activeElement)) : tr)),
					le = (tr.data('loadElement')	? $(tr.data('loadElement'))		: (defaults.loadElement		? ($(defaults.loadElement) ? $(defaults.loadElement) : ta) : ta)),
					ch = (tr.data('cache')			? tr.data('cache')				: (defaults.cache			? defaults.cache : false)),
					cp = (tr.data('complete')		? (typeof window[tr.data('complete')] === 'function'		? window[tr.data('complete')] : callbacks.complete ) : callbacks.complete),
					rq = false;
				

				switch (typeof re){
					case 'function' : return re(this, e);
					case 'boolean' : case 'object': return re;
					case 'string' :
						if(re.indexOf(' ') > -1){
							var rp = re.split(' ');
							re	= rp[0];
							rq	= rp[1];
						}
				}
				
				e.preventDefault();
				var active = (tr.data('group') ? $('._tisBound[data-group="'+tr.data('group')+'"]').each(function(){
					var or  = $(this),
						tel = (or.data('activeElement') ? (or.data('activeElement') === '_parent' ? or.parent() :$(or.data('activeElement'))) : (defaults.activeElement ? (defaults.activeElement === '_parent' ? tr.parent() : $(defaults.activeElement)) : or) );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : (defaults.activeClass ? defaults.activeClass : ac)));}
				) : $('._tisBound:not([data-group])').each(function(){
					var or  = $(this),
						tel = (or.data('activeElement') ? (or.data('activeElement') === '_parent' ? or.parent() :$(or.data('activeElement'))) : (defaults.activeElement ? (defaults.activeElement === '_parent' ? tr.parent() : $(defaults.activeElement)) : or) );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : (defaults.activeClass ? defaults.activeClass : ac)));}
				));
				
				ae.addClass(ac);
				le.addClass(lc);

				var sd = tr.serializeArray(), data;
				if(sd.length){
					var arr = [];
					$.each( tr.data(), function(k,v) {
						arr.push({name:k, value:v});
					});
					data = $.extend(arr,sd);
				}else{
					data = $.param(tr.data());
				}

				var params = {
						url		: re,
						data	: data,
						cache	: ch,
						type	: tp,
						success	: function(dt, ts, xhr){

							if(rq){
								var tmp = $(rq, $('<html>').html(dt));
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
							
							dt = do_helper('filter', dt, {params: params, target: ta, text_status: ts, jqXHR: xhr});
							
							ta[ti](dt);

							$(triggerClass).baldrick(defaults);
							
							if(typeof cb === 'string'){
								if(typeof window[cb] === 'function'){
									return window[cb](tr,ta);
								}
							}else if(typeof cb === 'function'){
								return cb(dt,{trigger:tr,target:ta},xhr);
							}
						},
						complete: function(xhr,ts){
							cp(xhr,ts);
							le.removeClass(lc);
							if(tr.data('once')){
								tr.off(ev).removeClass('_tisBound');
							}
						},
						error: function(xhr,ts,ex){
							callbacks.error(xhr,ts,ex);
						}
					};
				if(rt){
					params.dataType = rt;
				}
				params = do_helper('params', params, this);
				if(params === false){return inst;}

				return do_helper('request', params, {trigger: tr, target: ta});
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
		});
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

	//$('.baldrick').baldrick();
})(jQuery);