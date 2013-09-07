/* BaldrickJS  V2.01 | (C) David Cramer - 2013 | MIT License */
(function($){
	$.fn.baldrick = function(){
		this.removeClass(this.selector.split('.')[1]).addClass('_tisBound');
		var defaults = {};
		if(arguments.length){
			defaults = arguments[0];
		}
		if(typeof baldrickHelper !== 'undefined'){
			for(var helper in baldrickHelper){
				if(typeof baldrickHelper[helper] === 'function'){
					baldrickHelper[helper](this);
				}
			}
		}
		return this.each(function(){
			var tr = $(this), ev = (tr.data('event') ? tr.data('event') : 'click');
			tr.on(ev, function(e){
				if(tr.data('for')){
					var fort 		= $(tr.data('for')),
						datamerge 	= $.extend({}, tr.data());
						delete datamerge.for;
					fort.data(datamerge);
					return fort.trigger((fort.data('event') ? fort.data('event') : ev));
				}
				if((tr.data('before') ? (typeof window[tr.data('before')] === 'function' ? window[tr.data('before')](this, e) : true) : true) === false){return}
				var cb = (tr.data('callback') ? ((typeof window[tr.data('callback')] === 'function') ? window[tr.data('callback')] : tr.data('callback')) : (defaults.callback ? defaults.callback : false)),
					re = (tr.data('request') ? tr.data('request') : (defaults.request ? defaults.request : cb)),
					ta = (tr.data('target') ? (($(tr.data('target')).length < 1) ? $('<span>') : $(tr.data('target'))) : (cb ? cb : tr)),
					ti = (tr.data('targetInsert') ? tr.data('targetInsert') : 'html'),
					lc = (tr.data('loadClass') ? tr.data('loadClass') : 'loading'),
					ac = (tr.data('activeClass') ? tr.data('activeClass') : 'active'),
					ae = (tr.data('activeElement') ? $(tr.data('activeElement')) : tr),
					le = (tr.data('loadElement') ? $(tr.data('loadElement')) : ta),
					ch = (tr.data('cache') ? $(tr.data('cache')) : false);
				switch (typeof re){
					case 'function' : e.preventDefault(); re(this, e); return;
					case 'boolean' : return re;
					case 'string' :
						if(typeof window[re] === 'function'){return  window[re](tr[0], e);}
						cb = (typeof cb === 'boolean' ? function(){} : cb);
				}
				e.preventDefault();
				(tr.data('group') ? $('._tisBound[data-group="'+tr.data('group')+'"]').each(function(){
					var or  = $(this),
						tel = ($(this).data('activeElement') ? $($(this).data('activeElement')) : or );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : ac));}
				) : $('._tisBound:not([data-group])').each(function(){
					var or  = $(this),
						tel = ($(this).data('activeElement') ? $($(this).data('activeElement')) : or );
					tel.removeClass((or.data('activeClass') ? or.data('activeClass') : ac));  }
				));
				ae.addClass(ac);
				if(typeof le !== 'function' && typeof le !== 'string'){ le.addClass(lc);}
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
				$.ajaxSetup({cache: ch});
				if((tr.data('templateUrl') || tr.data('template')) && typeof Handlebars === 'object'){
					if(tr.data('template')){
						var source = $(tr.data('template')).html();
						var template = Handlebars.compile(source);
						$.getJSON(re, data, function(dt,st,xhr){ta.html(template(dt));ta.parent().find('.trigger').baldrick();le.removeClass(lc);return cb(dt,{trigger: tr[0], target: ta[0]},st,xhr);});
					}else if(tr.data('templateUrl')){
						$.get(tr.data('templateUrl'), function(source){
							var template = Handlebars.compile(source);
							$.getJSON(re, data, function(dt,st,xhr){ta.html(template(dt));ta.parent().find('.trigger').baldrick();le.removeClass(lc);return cb(dt,{trigger: tr[0], target: ta[0]},st,xhr);});
						});
					}
				}else{
					if(typeof cb === 'string'){
						$.getScript(re, function(tx,st,xhr){return (typeof window[cb] === 'function' ? window[cb](tx,{trigger: tr[0], target: ta[0]}, st,xhr) : true);});
					}else{
						if(typeof data === 'string' && typeof ta !== 'function'){
							ta.load(re, data, function(tx,st,xhr){$(ta).parent().find('.trigger').baldrick();le.removeClass(lc);return cb(tx,st,xhr);});
						}else{
							$.post(re, data, function(tx,st,xhr){
								if(typeof ta !== 'function' && typeof ta !== 'string'){
									$(ta)[ti](tx);
									$(ta).parent().find('.trigger').baldrick();
									le.removeClass(lc);
								}
								return cb(tx,{trigger: tr[0], target: ta[0]}, st,xhr);
							});
						}
					}
				}
			});
			if(tr.data('autoload') || tr.data('poll')){(tr.data('delay') ? setTimeout(function(tr, ev){return tr.trigger(ev);}, tr.data('delay'), tr, ev) : tr.trigger(ev));}
			if(tr.data('poll')){(tr.data('delay') ? setTimeout(function(tr, ev){return setInterval(function(tr, ev){return tr.trigger(ev);}, tr.data('poll'), tr, ev)}, tr.data('delay')) : setInterval(function(tr, ev){return tr.trigger(ev);}, tr.data('poll'), tr, ev))}
			return this;
		});
	};
})(jQuery);