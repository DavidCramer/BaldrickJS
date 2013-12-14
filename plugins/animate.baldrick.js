/* Baldrick animate plugin IN DEV */
(function($){

	$.fn.baldrick.registerhelper('animate', {
		target	: function (obj){
			if(obj.params.trigger.data('animate')){
				var target = obj.params.target.offset(), width = obj.params.target.outerWidth();
				if($('#animator_'+obj.params.target.prop('id')).length){
					$('#animator_'+obj.params.target.prop('id')).remove();
				}
				var copy = obj.params.target.clone().prop('id', 'animator_'+obj.params.target.prop('id')).removeClass(obj.params.loadClass).appendTo($('body'));
				obj.params.target.hide();
				copy.css({position:'absolute', top:target.top, left : target.left, width: width});
			}
		},
		after_target	: function (obj){
			if(obj.params.trigger.data('animate')){
				var anim = $('#animator_'+obj.params.target.prop('id')),
					start = -50,
					end = anim.offset().top + 50;
				if(obj.params.trigger.data('animate') === 'up'){
					start = +50;
					end = anim.offset().top - 50;
				}

				obj.params.target.css({marginTop: start, opacity:0}).show().animate({opacity: 1, marginTop: 0}, 300);//slideDown(200);
				anim.animate({opacity: 0, top: end}, 300, function(){
					//obj.params.target.css({marginTop:-50, opacity:0}).show().animate({opacity: 1, marginTop: 0}, 500);//slideDown(200);
					$(this).remove();
				});
			}

			//var copy = obj.params.target.clone().prop('id', 'animator').insertAfter(obj.params.target).hide();
		}
	});

})(jQuery);