var RoomModel = function(JSON_Obj) {
	this.status = JSON_Obj.status;
	this.number = JSON_Obj.number;
	this.type = JSON_Obj.type;
	this.consumptions = JSON_Obj.consumptions ? JSON_Obj.consumptions : [];
	this.startTime = JSON_Obj.startTime ? new Date(JSON_Obj.startTime) : null;

	this.statusChanged = new _Event(this);
	this.startTimeChanged = new _Event(this);
	this.startTiming = new _Event(this);
	this.consumptionDeled = new _Event(this);
	this.consumptionAdded = new _Event(this);
	this.consumptionsChanged = new _Event(this);
	this.consumptionQuantityChanged = new _Event(this);
	this.postBill_done = new _Event(this);
	this.putConsumptions_done = new _Event(this);
};

RoomModel.prototype = {

	patchData : function(data) {
		var def = $.Deferred();
		$.ajax({
			url: URL + "/rooms/" + this.number,
			method: 'PATCH',
			data: JSON.stringify(data),
			contentType: "application/json"})
		.done(function( data, textStatus, jqXHR ) {
			def.resolve();
		});
		return def.promise();
	},

	empty : function() {
		this.patchData({status:'empty', consumptions: [], startTime:null})
			.done(function() {
				this.status = 'empty';
				this.consumptions = [];
				this.startTime = null;
				this.statusChanged.notify();
			}.bind(this));
	},

	taken : function() {
		this.patchData({status:'taken'})
			.done(function() {
				this.status = 'taken';
				this.statusChanged.notify();
			}.bind(this));
	},

	set_startTime : function(time) {
		var _time;
		if (getType(time) == 'Date') {
			_time = time;
		} else {
			//转换成JS的时间对象
			_time = new Date(time);
		}
		this.patchData({startTime:_time})
			.done(function() {
				if (!this.startTime) {
					this.startTiming.notify();
				}
				this.startTime = _time;
				this.startTimeChanged.notify();
			}.bind(this));
	},

	get_startTime : function() {
		return this.startTime ? new Date(this.startTime) : null;
	},

	get_playedTimeMS: function() {
		var playedTime = this.startTime ? new Date() - this.startTime : null;
		if (playedTime <= 0) {
			return 0;
		}
		return playedTime;
	},

	get_totalConsumptions : function() {
		if (!this.consumptions) {
			return 0;
		}
		var total = 0;
		var eachConsumption;
		for (var i = 0; i < this.consumptions.length; i++) {
			eachConsumption = this.consumptions[i].price * this.consumptions[i].quantity;
			total += eachConsumption;
		}
		return total;
	},

	get_consumptionByIndex : function(index) {
		return this.consumptions[index];
	},

	get_consumptionByName : function(name) {
		for (var i=0; i < this.consumptions.length; i++) {
			if (this.consumptions[i].name === name) {
				return this.consumptions[i];
			}
		}
		return null;
	},

	putConsumptions : function(consumptions) {
		$.ajax({
			url: URL + "/rooms/" + this.number + "/consumptions",
			method: 'PUT',
			data: JSON.stringify(consumptions),
			contentType: "application/json"
		})
		.done(function( data, textStatus, jqXHR) {
			this.addConsumptions(consumptions);
			this.putConsumptions_done.notify();
		}.bind(this));
	},

	addConsumptions : function(consumptions) {
		var i;
		for (i=0; i<consumptions.length; i++) {
			this.addConsumption(consumptions[i]);
		}
	},

	addConsumption : function(consumption) {
		var _consumption = this.get_consumptionByName(consumption.name);
		if (_consumption) {
			this.setConsumptionQuantity(_consumption.name, _consumption.quantity + consumption.quantity);
		} else {
			this.consumptions.push(consumption);
		}
		//this.consumptionsChanged.notify();
		this.consumptionAdded.notify();
	},

	is_overTimeConsumption : function(consumption) {
		if (consumption.name === "+30分" || consumption.name === "+1小时") {
			return true;
		}
		return false;
	},

	get_overTimeMin : function() {
		var playedTimeMS = this.get_playedTimeMS();
		//这里会得到2个时间差，单位为MS
		var overTimeMS = playedTimeMS - OVER_TIME_MS;
		var overTimeMin = Math.floor(overTimeMS / MS_TO_X.min);
		return overTimeMin;
	},

	addOverTimeConsumption : function() {
		var overTimeMin = this.get_overTimeMin();
		var x = overTimeMin % 60;
		//超时了
		if (overTimeMin >= 15) {
			if (x >= 15) {
				if (x < 30) {
					this.addConsumption({name:"+30分", price: 5, quantity: 1});
				} else {
					this.addConsumption({name:"+1小时", price: 10, quantity: 1});
				}
			}
			var overTimeHour = Math.floor(overTimeMin / 60);
			if (overTimeHour) {
				this.addConsumption({name:"+1小时", price: 10, quantity: overTimeHour});
			}
		}
	},

	removeOverTimeConsumption : function() {
		var i;
		for (i = this.consumptions.length - 1; i >= 0; i--) {
			var consumption = this.consumptions[i];
			if (this.is_overTimeConsumption(consumption)) {
				this.delConsumption(consumption);
			}
		}
	},

	setConsumptionQuantity_ajax : function(name, quantity) {
		$.ajax({
			url: URL + "/rooms/" + this.number + "/consumptions/" + name + "/quantity",
			method: 'PUT',
			data: JSON.stringify({"quantity":quantity}),
			contentType: "application/json"
		})
		.done(function( data, textStatus, jqXHR) {
			this.setConsumptionQuantity(name, quantity);
		}.bind(this));
	},

	setConsumptionQuantity : function(name, quantity) {
		var consumption = this.get_consumptionByName(name);
		consumption.quantity = quantity;
		this.consumptionQuantityChanged.notify(consumption.name);
		this.consumptionsChanged.notify();
	},

	delConsumption_ajax: function(consumption) {
		$.ajax({
			url: URL + "/rooms/" + this.number + "/consumptions/" + consumption.name,
			method: 'DELETE',
		})
		.done(function( data, textStatus, jqXHR) {
			this.delConsumption(consumption);
		}.bind(this));
	},

	delConsumption : function(consumption) {
		var index = this.consumptions.indexOf(consumption);
		this.consumptions.splice(index, 1);
		this.consumptionDeled.notify(consumption.name);
		this.consumptionsChanged.notify();
	},

	postBill : function(bill) {
		$.ajax({
			url: URL + "/bills",
			method: 'POST',
			data: JSON.stringify(bill),
			contentType: "application/json"
		})
		.done(function( data, textStatus, jqXHR) {
			this.postBill_done.notify();
		}.bind(this));
	},

};
