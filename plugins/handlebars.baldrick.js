/* Baldrick handlebars.js templating plugin */
(function($){

	var dataBoundGroups = {};

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
			checkjason		: function(request, defaults, params){
				if((params.trigger.data('templateUrl') || params.trigger.data('template')) && typeof Handlebars === 'object'){
					request.dataType = 'json';
					return request;
				}
			}
		},
		refresh				: {
			updatebindings	: function(opts){
				//console.log(opts.params.trigger.data('bind'));
				$('[data-bind]').each(function(){
					var bind = $(this).data('bind'),
						data_object = dataBoundGroups[bind.split('.')[0]],
						traverse = bind.replace(/\[/g,'.').replace(/\]/g,'').split('.'),
						traverseBindings = function(context_object, bind_context){
							$.each(context_object, function(k,v){

								k = (typeof k === 'number' ? "["+k+"]" : "."+k);

								if(typeof v === 'object'){
									var level_up = bind_context+k;
									traverseBindings(v, level_up);
								}else if(typeof v === 'string'){
									$("[data-bind='"+bind_context+k+"']").not(this).not('input').html(v);
								}
							});
						};
						for(var i=1; i<traverse.length; i++){
							if(data_object[traverse[i]]){
								data_object = data_object[traverse[i]];
								//console.log(data_object);
							}
						}
						if(typeof data_object === 'string'){
							$("[data-bind='"+bind+"']").not(this).not('input').html(data_object);
						}else if(typeof data_object === 'object'){
							traverseBindings(data_object, bind);
						}
				});
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
					//data-bind="users"
					var source = false;
					if(opts.params.trigger.data('bind')){
						if(opts.params.trigger.data('bind').split('.').length === 1){
							dataBoundGroups[opts.params.trigger.data('bind').split('.')[0]] = opts.data;
							source = true;
						}

						Handlebars.registerHelper('_bindContext', function(context, options) {
							return opts.params.trigger.data('bind');
						});
					}

					if(typeof opts.params.template === 'function'){
						var temp = $('<div>').html($($.trim(opts.params.template(opts.data)))),

							mergeTemplate = function(target, template){
								var targetChildren = target.children(),
									templateChildren = template.children();

								targetChildren.each(function(k,v){
									if(!templateChildren[k]){
										var targetChild = $(targetChildren[k]);
										if(targetChild.data('bind')){
											$('[data-bind^="'+targetChild.data('bind')+'"]').remove();
										}
										targetChildren[k].remove();
									}
								});
								templateChildren.each(function(k,v){
									
									var targetChild = $(targetChildren[k]),
										templateChild = $(v);
									
									if(!targetChildren[k]){
										target.append(v);
									}else{

										if(targetChild.data('bind') !== templateChild.data('bind')){
											targetChild.replaceWith(templateChild);
										}
									}

									if(targetChild.children().length > 0){
										mergeTemplate(targetChild, templateChild);
									}

								});
							},
							traverseBindings = function(context_object, bind_context){
								$.each(context_object, function(k,v){

									k = (typeof k === 'number' ? "["+k+"]" : "."+k);

									if(typeof v === 'object'){
										var level_up = bind_context+k;
										traverseBindings(v, level_up);
									}else if(typeof v === 'string'){
										$("[data-bind='"+bind_context+k+"']").not(this).not('input').html(v);
									}
									
									//$("input[data-bind='"+bind.data('bind')+"']").not(this).val(bind.html());
								});
							};
						//var test = $.extend(true, opts.params.target.contents(), temp.contents());

						temp.find('input[data-bind]').on('keyup', function(){
							var bind = $(this);
							//$("[data-bind='"+bind.data('bind')+"']").not(this).html(bind.val());
						});

						/*temp.find('[data-bind]').each(function(){
							var bind = $(this).data('bind'),
								context = bind.replace(opts.params.trigger.data('bind')+'.', ''),
								data_object = ((typeof dataBoundGroups[bind.split('.')[0]] !== 'undefined' && opts.params.trigger.data('bind') !== bind.split('.')[0]) ? dataBoundGroups[bind.split('.')[0]] : opts.data),
								traverse = context.replace(/\[/g,'.').replace(/\]/g,'').split('.');

								for(var i=0; i<traverse.length; i++){
									if(data_object[traverse[i]]){
										data_object = data_object[traverse[i]];
										//console.log(data_object);
									}
								}
								if(typeof data_object === 'string'){
									$("[data-bind='"+bind+"']").not(this).not('input').html(data_object);
								}else if(typeof data_object === 'object'){
									traverseBindings(data_object, bind);
								}

						});*/
						//traverseBindings(opts.data, opts.params.trigger.data('bind'));
						mergeTemplate(opts.params.target, temp);
						delete opts.params.target;
					}
				}
				return opts;
			}
		},
		request				: {
			compiletemplate	: function(opts, defaults){
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

						if(trigger.data('bind')){
							var bindpath = trigger.data('bind').replace(/\[/g,'.').replace(/\]/g,'').split('.');
							if(typeof dataBoundGroups[bindpath[0]] !== 'undefined'){

								if(bindpath.length > 1){
									var cacheSet = dataBoundGroups[bindpath[0]];

									for(c=1;c<bindpath.length; c++){
										cacheSet = cacheSet[bindpath[c]];
									}

									var cache = {data:cacheSet, rawData: cacheSet, request: opts.request, params: opts.params};

									cache.cacheSet = defaults.helpers.filter.dotemplate(cache);
									defaults.helpers.filter._totarget(cache);
									opts.params.loadElement.removeClass(opts.params.loadClass);
									return false;
								}
							}
						}

						return opts;
					}
				}
			}
		}
	});

})(jQuery);