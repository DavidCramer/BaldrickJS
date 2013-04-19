/* Baldrick Debug Plugin  V1 | (C) David Cramer - 2013 | MIT License */

(function(baldrick){
	oldlogger = baldrick.prototype.log

	baldrick.prototype.log = function(message,element,event) {
		oldlogger(message,element,event)
        if(console){
            console.log(message);
            if(element){
                console.log('Trigger Element:');
                console.log(element);
            }
            if(event){
                console.log('Event:');
                console.log(event);
            }
        }else{
            alert(message);
        }
    }
})(baldrick);