/* BaldrickJS  V2.01 | (C) David Cramer - 2013 | MIT License */
(function($){
	$.fn.baldrick = function(){
		this.removeClass(this.selector.split('.')[1]).addClass('_tisBound');
		
		var defaults		= (arguments.length ? arguments[0] : {}),
			triggerClass	= this.selector,
			ncb				= function(){return true;},
			callbacks		= {
				"before"	: ncb,
				"callback"	: ncb,
				"complete"	: ncb,
				"error"		: ncb
			};

		for(var c in callbacks){
			if(typeof defaults[c] === 'string'){
				callbacks[c] = (typeof window[defaults[c]] === 'function' ? window[defaults[c]] : ncb);
			}else if(typeof defaults[c] === 'function'){
				callbacks[c] = defaults[c];
			}
		}

		if(typeof baldrickHelper !== 'undefined'){
			for(var helper in baldrickHelper){
				if(typeof baldrickHelper[helper] === 'function'){
					baldrickHelper[helper](this);
				}
			}
		}
		return this.each(function(){
			var tr = $(this), ev = (tr.data('event') ? tr.data('event') : (defaults.event ? defaults.event : ( tr.is('form') ? 'submit' : 'click' )));
			tr.on(ev, function(e){
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

				var cb = (tr.data('callback')		? ((typeof window[tr.data('callback')] === 'function') ? window[tr.data('callback')] : tr.data('callback')) : callbacks.callback()),
					re = (tr.data('request')		? tr.data('request')			: (defaults.request			? defaults.request : cb)),
					tp = (tr.data('method')			? tr.data('method')				: (tr.attr('method')		? tr.attr('method') :(defaults.method ? defaults.method : 'GET'))),
					rt = (tr.data('type')			? tr.data('type')				: (defaults.dataType		? defaults.dataType : false)),
					ta = (tr.data('target')			? $(tr.data('target'))			: (defaults.target			? $(defaults.target) : $('<div>'))),
					ti = (tr.data('targetInsert')	? (tr.data('targetInsert') === 'replace' ? 'replaceWith' : tr.data('targetInsert'))	: (defaults.targetInsert ? (defaults.targetInsert === 'replace' ? 'replaceWith': defaults.targetInsert) : 'html')),
					lc = (tr.data('loadClass')		? tr.data('loadClass')			: (defaults.loadClass		? defaults.loadClass : 'loading')),
					ac = (tr.data('activeClass')	? tr.data('activeClass')		: (defaults.activeClass		? defaults.activeClass : 'active')),
					ae = (tr.data('activeElement')	? $(tr.data('activeElement'))	: (defaults.activeElement	? ($(defaults.activeElement) ? $(defaults.activeElement) : tr) : tr)),
					le = (tr.data('loadElement')	? $(tr.data('loadElement'))		: (defaults.loadElement		? ($(defaults.loadElement) ? $(defaults.loadElement) : ta) : ta)),
					ch = (tr.data('cache')			? tr.data('cache')				: (defaults.cache			? defaults.cache : false)),
					cp = (tr.data('complete')		? (typeof window[tr.data('complete')] === 'function'		? window[tr.data('complete')] : callbacks.complete ) : callbacks.complete),
					rq = false;

				switch (typeof re){
					case 'function' : e.preventDefault(); re(this, e); return;
					case 'boolean' : return re;
					case 'string' :
						if(typeof window[re] === 'function'){return  window[re](tr[0], e);}
						cb = (typeof cb === 'boolean' ? function(){} : cb);
						if(re.indexOf(' ') > -1){
							var rp = re.split(' ');
							re	= rp[0];
							rq	= rp[1];
						}
				}

				e.preventDefault();
				var active = (tr.data('group') ? $('._tisBound[data-group="'+tr.data('group')+'"]').each(function(){
					var or  = $(this),
						tel = ($(this).data('activeElement') ? $($(this).data('activeElement')) : or );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : ac));}
				) : $('._tisBound:not([data-group])').each(function(){
					var or  = $(this),
						tel = ($(this).data('activeElement') ? $($(this).data('activeElement')) : or );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : ac));  }
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
				//$.ajaxSetup({cache: ch});
				//if(typeof tr === 'function'){return tr(tr,ta);}
				//ta.load(re+' '+rq);
				var args = {
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

							if(template){
								dt = template(dt);
							}

							ta[ti](dt);

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
							$(triggerClass).baldrick(defaults);
						},
						error: function(xhr,ts,ex){
							callbacks.error(xhr,ts,ex);
						}

					},
					template = false;
				if(rt){
					args.dataType = rt;
				}

				if(tr.data('templateUrl') || tr.data('template') && typeof Handlebars === 'object'){
					if(tr.data('template')){
						if($(tr.data('template')).length){
							template = Handlebars.compile($(tr.data('template')).html());
						}
					}
				}

				if(tr.data('templateUrl') && typeof Handlebars === 'object'){
					$.get(tr.data('templateUrl'), function(tml){
						template = Handlebars.compile(tml);
						$.ajax(args);
					});
				}else{
					$.ajax(args);
				}

			});
			if(tr.data('autoload') || tr.data('poll')){
				if(tr.data('delay')){
					setTimeout(function(tr, ev){
						return tr.trigger(ev);
					}, tr.data('delay'), tr, ev);
				}else{
					tr.trigger(ev);
				}
			}

			if(tr.data('poll')){
				if(tr.data('delay')){
					setTimeout(function(tr, ev){
						return setInterval(function(tr, ev){
							return tr.trigger(ev);
						}, tr.data('poll'), tr, ev);
					}, tr.data('delay'));
				}else{
					setInterval(function(tr, ev){
						return tr.trigger(ev);
					}, tr.data('poll'), tr, ev);
				}
			}
			return this;
		});
	};
})(jQuery);