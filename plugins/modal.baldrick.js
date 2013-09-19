/* Baldrick handlebars.js templating plugin */
(function($){

	var bm_hasModal = false;
	
	$.fn.baldrick.registerhelper({
		ready	: {
			gettriggers	: function(triggers){
				if(triggers.data('modal') && bm_hasModal === false){
					
					// write out a template wrapper.
					var modal = $('<div>', {
							id					: "_baldrickModal",
							role				: "dialog",
							tabIndex			: -1,
							"ariaLabelled-by"	: "baldrickModalLable",
							"aria-hidden"		: true,
							class				: "modal hide"
						}),
						titleWrap = $('<div>', {class : "modal-header"});

					titleWrap.
					append($('<button>', { type:"button", class:"close", "data-dismiss":"modal", "aria-hidden":"true"}).html('×')).
					append($('<h3>', {id:"baldrickModalLable"})).
					appendTo(modal);

					modal.append($('<div>', {class:"modal-body", id: 'baldrickModalLoader'})).
					append($('<div>', {class:"modal-body", id: 'baldrickModalBody'})).
					append($('<div>', {class:"modal-footer", id: "baldrickModalFooter"}));
					modal.appendTo($('body'));
				}
			}
		},
		request_complete	: {
			togglebody		: function(){
				$('#baldrickModalLoader').hide();
				$('#baldrickModalBody').show();
			}
		},
		params	: {
			checkModal : function(params,defaults){

				var trigger = params.trigger;
				if(trigger.data('modal') && (params.url || trigger.data('modalContent'))){
					var modal;
					if(params.url){
						params.target = $('#baldrickModalBody');
						params.loadElement = $('#baldrickModalLoader');
					}

					if(trigger.data('modalTemplate')){
						modal = $(trigger.data('modalTemplate'));
					}else{
						modal = $('#_baldrickModal');
					}
					// close if already open
					if($('.modal-backdrop').length){
						modal.modal('hide');
					}

					// get options.
					var label	= $('#baldrickModalLable'),
						loader	= $('#baldrickModalLoader'),
						body	= $('#baldrickModalBody'),
						footer	= $('#baldrickModalFooter');

					// reset modal
					modal.removeClass('fade');

					label.empty().parent().hide();
					loader.show();
					body.hide();
					footer.empty().hide();
					if(trigger.data('modalTitle')){
						label.html(trigger.data('modalTitle')).parent().show();
					}
					// set animation
					if(trigger.data('modalAnimate')){
						modal.addClass('fade');
					}
					if(trigger.data('modalButtons')){
						var buttons = $.trim(trigger.data('modalButtons')).split(';');
						if(buttons.length){
							for(b=0; b<buttons.length;b++){
								var options		= buttons[b].split('|'),
									buttonLabel	= options[0],
									callback	= options[1],
									atts		= {class:'btn'},
									button		= $('<button>', atts);

									if(callback === 'dismiss'){
										button.attr("data-dismiss", "modal");
									}else if(typeof window[callback] === 'function' ){
										atts['data-callback'] = callback;
										atts['data-callback'] = callback;

									}
									footer.append(button.html(buttonLabel));
							}
							footer.show();
						}
						//console.log(buttons);
					}

					//optional content
					if(trigger.data('modalContent')){
						body.html($(trigger.data('modalContent')).html());
						loader.hide();
						body.show();
						$(defaults.triggerClass).baldrick(defaults);
					}
					// launch
					console.log(modal);
					modal.modal('show');
				}
			}
		}
	});

})(jQuery);