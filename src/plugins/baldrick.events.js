/* Baldrick Event Plugin  V1 | (C) Rory McGuire - 2013 | MIT License */

(function(){
	baldrick.prototype.emit = function (ev_name) {
		if (!this._events || !this._events[ev_name]) { return;}

		for (i=0;i<this._events[ev_name].length; i++) {
			this._events[ev_name][i].apply(this,Array.prototype.slice.apply(arguments))
		}
	}
	baldrick.prototype.on = function (ev_name, callback) {
		if (!this._events) { this._events = []; }
		if (!this._events[ev_name]) {
			this._events[ev_name] = []
		}
		this._events[ev_name].push(callback);
	}

	orig_buildTriggers = baldrick.prototype.buildTriggers
	orig_queueEvent = baldrick.prototype.queueEvent
	orig_doAction = baldrick.prototype.doAction
	orig_doRequest = baldrick.prototype.doRequest

	baldrick.prototype.bindTriggers = function (bindclass) {
		orig_buildTriggers.call(this,bindclass)
		baldrick.prototype.emit('init', bindclass)
	}
	baldrick.prototype.queueEvent = function (event) {
		orig_queueEvent.call(this,event);
		baldrick.prototype.emit('queueEvent', event);
	}
	baldrick.prototype.doAction = function (event) {
		ret = orig_doAction.call(this,event);
		baldrick.prototype.emit('doAction', event);
		return ret;
	}
	baldrick.prototype.doRequest = function () {
		args = Array.prototype.slice.apply(arguments);
		orig_doRequest.apply(this, args);
		baldrick.prototype.emit('doRequest', args);
	}
})();
