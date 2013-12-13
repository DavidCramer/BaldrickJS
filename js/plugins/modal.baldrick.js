/* Baldrick handlebars.js templating plugin */
(function($){

	var bm_hasModal = false;
	
	$.fn.baldrick.registerhelper('bootstrap_modal', {
		event	: function(el){
			var triggers = $(el), modal_id = 'bm';
			if(triggers.data('modal') && bm_hasModal === false){
				if(triggers.data('modal') !== 'true'){
					modal_id = triggers.data('modal');
				}
				if(!$('#' + modal_id + '_baldrickModal').length){
					//bm_hasModal = true;
					// write out a template wrapper.
					var modal = $('<div>', {
							id					: modal_id + '_baldrickModal',
							tabIndex			: -1,
							"ariaLabelled-by"	: modal_id + '_baldrickModalLable',
							"class"				: "modal"
						}),
						modalDialog = $('<div>', {"class" : "modal-dialog"});
						modalContent = $('<div>', {"class" : "modal-content"});
						modalHeader = $('<div>', {"class" : "modal-header"});
					// set animation
					if(triggers.data('modalAnimate')){
						modal.addClass('fade');
					}
					modalHeader.append($('<button>', { type:"button", "class":"close", "data-dismiss":"modal", "aria-hidden":"true"}).html('&times;')).
					append($('<h4>', {"class" : "modal-title", id : modal_id + '_baldrickModalLable'})).
					appendTo(modalContent);

					modalContent.append($('<div>', {"class":"modal-body", id: modal_id + '_baldrickModalLoader'})).
					append($('<div>', {"class":"modal-body", id: modal_id + '_baldrickModalBody'})).
					append($('<div>', {"class":"modal-footer", id: modal_id + '_baldrickModalFooter'}));

					modalContent.appendTo(modalDialog);
					modalDialog.appendTo(modal);
					modal.appendTo($('body'));
				}
			}
		},
		request_complete	: function(obj, params){
			if(obj.params.trigger.data('modal')){
				var modal_id = 'bm';
				if(obj.params.trigger.data('modal') !== 'true'){
					modal_id = obj.params.trigger.data('modal');
				}

				if(obj.params.trigger.data('modalLife')){
					var delay = parseFloat(obj.params.trigger.data('modalLife'));
					if(delay > 0){
						setTimeout(function(){
							$('#' + modal_id + '_baldrickModal').modal('hide');
						}, delay);
					}else{
						$('#' + modal_id + '_baldrickModal').modal('hide');
					}
				}
				$('#' + modal_id + '_baldrickModalLoader').hide();
				$('#' + modal_id + '_baldrickModalBody').show();
			}
		},
		after_filter	: function(obj){
			if(obj.params.trigger.data('modal')){
				if(obj.params.trigger.data('targetInsert')){
					var modal_id = 'bm';
					if(obj.params.trigger.data('modal') !== 'true'){
						modal_id = obj.params.trigger.data('modal');
					}
					var data = $(obj.data).prop('id', modal_id + '_baldrickModalBody');
					obj.data = data;
				}
			}
			return obj;
		},
		params	: function(params,defaults){

			var trigger = params.trigger, modal_id = 'bm';
			if(params.trigger.data('modal') !== 'true'){
				modal_id = params.trigger.data('modal');
			}

			if(trigger.data('modal') && (params.url || trigger.data('modalContent'))){
				var modal;

				if(params.url){
					params.target = $('#' + modal_id + '_baldrickModalBody');
					params.loadElement = $('#' + modal_id + '_baldrickModalLoader');
					params.target.empty();
				}

				if(trigger.data('modalTemplate')){
					modal = $(trigger.data('modalTemplate'));
				}else{
					modal = $('#' + modal_id + '_baldrickModal');
				}
				// close if already open
				if($('.modal-backdrop').length){
					//modal.modal('hide');
				}

				// get options.
				var label	= $('#' + modal_id + '_baldrickModalLable'),
					loader	= $('#' + modal_id + '_baldrickModalLoader'),
					body	= $('#' + modal_id + '_baldrickModalBody'),
					footer	= $('#' + modal_id + '_baldrickModalFooter');

				// reset modal
				//modal.removeClass('fade');

				label.empty().parent().hide();
				loader.show();
				body.hide();
				footer.empty().hide();
				if(trigger.data('modalTitle')){
					label.html(trigger.data('modalTitle')).parent().show();
				}
				if(trigger.data('modalButtons')){
					var buttons = $.trim(trigger.data('modalButtons')).split(';');
					if(buttons.length){
						for(b=0; b<buttons.length;b++){
							var options		= buttons[b].split('|'),
								buttonLabel	= options[0],
								callback	= options[1],
								atts		= {"class":'btn btn-default'},
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

				}
				//optional content
				if(trigger.data('modalContent')){
					body.html($(trigger.data('modalContent')).html());
					loader.hide();
					body.show();
					$(defaults.triggerClass).baldrick(defaults);
				}
				// launch
				modal.modal('show').on('hidden.bs.modal', function (e) {
					bm_hasModal = false;
					$(this).remove();
				});
			}
		}
	});

})(jQuery);