/* Baldrick handlebars.js templating plugin */
(function($){

	$.fn.baldrick.registerhelper({
		filter: {
			_handlebars	: function(dt, options){
				if(typeof options.params.template === 'function'){
					return options.params.template(dt);
				}
				return dt;
			}
		},
		request: {
			_handlebars	: function(params, options){
				var tr		= $(options.trigger),
					reqobj	= this;
				if((tr.data('templateUrl') || tr.data('template')) && typeof Handlebars === 'object' && typeof params.template === 'undefined'){
					if(tr.data('templateUrl') && typeof Handlebars === 'object'){
						$.get(tr.data('templateUrl'), function(tml){
							params.template = Handlebars.compile(tml);
							return reqobj._dorequest(params, options);
						});
						return false;
					}
					if(tr.data('template') && typeof Handlebars === 'object'){
						tml = $(tr.data('template')).html();
						params.template = Handlebars.compile(tml);
						return params;
					}
				}
				return params;
			}
		}
	});

})(jQuery);