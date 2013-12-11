/* Baldrick animate plugin IN DEV */
(function($){

	$.fn.baldrick.registerhelper('animate', {
		target	: function (obj){
			if(obj.params.trigger.data('animate')){
				var copy = obj.params.target.clone().prop('id', 'animator_'+obj.params.target.prop('id')).removeClass(obj.params.loadClass).insertAfter(obj.params.target);
				obj.params.target.hide();
			}
		},
		after_target	: function (obj){
			if(obj.params.trigger.data('animate')){
				obj.params.target.css({marginTop:-50, opacity:0}).show().animate({opacity: 1, marginTop: 0}, 500);//slideDown(200);
				$('#animator_'+obj.params.target.prop('id')).css({position: 'absolute', top: 0, width: obj.params.target.outerWidth()}).animate({opacity: 0, top: 50}, 500, function(){
					//obj.params.target.css({marginTop:-50, opacity:0}).show().animate({opacity: 1, marginTop: 0}, 500);//slideDown(200);
					$(this).remove();
				});
			}

			//var copy = obj.params.target.clone().prop('id', 'animator').insertAfter(obj.params.target).hide();
		}
	});

})(jQuery);