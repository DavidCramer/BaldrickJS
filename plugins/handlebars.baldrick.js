/* Baldrick handlebars.js templating plugin */
(function($){
	$.fn.hbSerializeObject = function(){

		var self = this,
			json = {},
			push_counters = {},
			patterns = {
				"validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
				"key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
				"push":     /^$/,
				"fixed":    /^\d+$/,
				"named":    /^[a-zA-Z0-9_]+$/
			};


		this.build = function(base, key, value){
			base[key] = value;
			return base;
		};

		this.push_counter = function(key){
			if(push_counters[key] === undefined){
				push_counters[key] = 0;
			}
			return push_counters[key]++;
		};

		$.each($(this).serializeArray(), function(){

			// skip invalid keys
			if(!patterns.validate.test(this.name)){
				return;
			}

			var k,
				keys = this.name.match(patterns.key),
				merge = this.value,
				reverse_key = this.name;

			while((k = keys.pop()) !== undefined){

				// adjust reverse_key
				reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

				// push
				if(k.match(patterns.push)){
					merge = self.build([], self.push_counter(reverse_key), merge);
				}

				// fixed
				else if(k.match(patterns.fixed)){
					merge = self.build([], k, merge);
				}

				// named
				else if(k.match(patterns.named)){
					merge = self.build({}, k, merge);
				}
			}

			json = $.extend(true, json, merge);
		});

		return json;
	};
	$.fn.baldrick.registerhelper({
		request_params		: {
			checkjason		: function(request, params){
				if((params.trigger.data('templateUrl') || params.trigger.data('template')) && typeof Handlebars === 'object'){
					request.dataType = 'json';
					return request;
				}
			}
		},
		filter				: {
			dotemplate		: function(opts){
				if(opts.params.trigger.data('postCommit') === 'silent'){
					if(opts.params.target.hasClass(opts.params.loadClass)){
						opts.params.target.removeClass(opts.params.loadClass);
					}
					opts.params.target = false;
				}else{
					if(typeof opts.params.template === 'function'){
						opts.data = opts.params.template(opts.data);
					}
				}
				return opts;
			}
		},
		request				: {
			compiletemplate	: function(opts){

				var trigger	= opts.params.trigger,
					reqobj	= this,
					tml;

				if((trigger.data('templateUrl') || trigger.data('template')) && trigger.data('postCommit') && typeof Handlebars === 'object' && typeof opts.request.template === 'undefined'){
					if(trigger.data('template') && typeof Handlebars === 'object'){
						tml						= $(trigger.data('template')).html();
						opts.params.template	= Handlebars.compile(tml);
						var entry = $($.trim(opts.params.template(trigger.hbSerializeObject())));

						if(opts.params.loadElement === opts.params.target){
							opts.params.loadElement.removeClass(opts.params.loadClass);
							entry.addClass(opts.params.loadClass);
						}

						switch (opts.params.targetInsert){
							case 'append':
								entry.appendTo(opts.params.target);
								break;
							case 'prepend':
								entry.prependTo(opts.params.target);
								break;
							case 'replaceWith':
								entry.replaceWith(opts.params.target);
								break;
							default:
								opts.params.target.html(entry);
								break;
						}
						opts.params.target = entry;
						opts.params.targetInsert = 'replaceWith';
						if(trigger.is('form') && trigger.data('clear')){
							trigger.trigger('reset');
						}
						return opts;
					}
				}


				if((trigger.data('templateUrl') || trigger.data('template')) && typeof Handlebars === 'object' && typeof opts.request.template === 'undefined'){
					if(trigger.data('templateUrl') && typeof Handlebars === 'object'){
						$.get(trigger.data('templateUrl'), function(tml){
							opts.params.template = Handlebars.compile(tml);
							return reqobj._dorequest(opts);
						});
						return false;
					}
					if(trigger.data('template') && typeof Handlebars === 'object'){
						tml = $(trigger.data('template')).html();
						opts.params.template = Handlebars.compile(tml);
						return opts;
					}
				}
			}
		}
	});

})(jQuery);