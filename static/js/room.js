function Room(obj, ele) {
	var eleIsHTMLElement = ele instanceof HTMLElement;
	if (!eleIsHTMLElement) {
		throw TypeError("ele is not a HTMLElement,it is a " + getType(ele) + ".");
	}
	if (ele.className != "room") {
	   throw Error("ele is not a room HTMLElement!");
	}	  	
	//需检查obj对象
	if (hasProperties(['number', 'bill_id', 'consumptions', 'status', 'startTime'], obj) === false) {
		throw Error('not a valid room_obj!');
	}
	this.ele = ele;
	this.ele.roomNum = ele.getElementsByClassName('roomNum')[0];
	this.ele.timer = $$(ele, 'timer');
	this.ele.startTime = ele.getElementsByClassName('startTime')[0];
	this.ele.billing = ele.getElementsByClassName('btn-billing')[0];
	this.ele.playedTime = ele.getElementsByClassName('playedTime')[0];
	this.ele.totalConsumptions = $$(ele, "totalConsumptions");
	this.ele.consumptionsAdd = $$(ele, "consumptionsAdd");
	this.ele.consumptionItemsDiv = $$(ele, "consumptionItemsDiv");

	this.status = obj.status;
	this.num = obj.number;
	this.type = obj.type;
	this.bill_id = obj.bill_id;
	this.consumptions = obj.consumptions;
	this.setStartTime(obj.startTime, false);
	switch (obj.status) {
		case 'empty':
			this.empty(false);
			break;
		case 'taken':
			this.taken(false);
			if (this.getTotalConsumptions() > 0) {
				this.set_totalConsumptions(this.getTotalConsumptions());
				displayElement(this.ele.totalConsumptions, 'flex');
			}
			if (this.startTime != null) {
				hideElement(this.ele.timer);
				displayElement(this.ele.startTime, 'flex');
				displayElement(this.ele.playedTime, 'flex');
			} else {
				displayElement(this.ele.timer, 'flex');
			}
			break;
		case 'reserved':
			break;
	}
	this.ele.timer.addEventListener('touchmove', this.touchmoveHandle.bind(this), false);	
	this.ele.timer.addEventListener('touchend', this.touchendHandle.bind(this), false);
}

Room.prototype = {

	SLIDE_DISTANCE : 250,

	set_totalConsumptions : function(n) {
		this.ele.totalConsumptions.innerHTML = "$" + n;
	},

	putData : function() {
		Ajax.put(URL + "rooms/" + this.num, JSON.stringify(this), function() {
			//console.log(this.num + " put succ");
		}, function() {
			//console.log(this.num + " put faild");
		});
	},

	empty : function(putData) {
		this.status = 'empty';
		this.startTime = null;
		this.consumptions = [];
		this.ele.startTime.innerHTML = "";
		this.ele.totalConsumptions.innerHTML = '0';
		this.ele.playedTime.innerHTML = "00:00";
		this.changeRoomColor(ROOM_COLOR.empty);

		hideElement(this.ele.timer);
		hideElement(this.ele.startTime);
		hideElement(this.ele.playedTime);
		hideElement(this.ele.consumptionsAdd);
		hideElement(this.ele.consumptionItemsDiv);
		hideElement(this.ele.totalConsumptions);

		if (putData) { this.putData(); }
	},

	taken : function(putData) {
		this.status = 'taken';
		this.changeRoomColor(ROOM_COLOR.taken);
		displayElement(this.ele.consumptionsAdd, 'flex');
		//生成计时按钮位置信息
		displayElement(this.ele.timer, 'flex');
		if (!this.ele.timer.rect) {
			this.ele.timer.rect = this.ele.timer.getBoundingClientRect();
			this.ele.timer.rect.halfWidth = this.ele.timer.rect.width / 2;
		}
		if (putData) { this.putData(); }
	},

	touchendHandle: function(event) {
		this.ele.timer.style.left = '0px';
	},

	touchmoveHandle : function(event) {
		if (event.targetTouches.length == 1) {
			var touch = event.targetTouches[0];
			//只能往右滑动
			if (touch.pageX  > (this.ele.timer.rect.left + this.ele.timer.rect.halfWidth)) {
				this.ele.timer.style.left = touch.pageX - this.ele.timer.rect.left - this.ele.timer.rect.halfWidth + 'px';
				//滑动到位后
				if(this.ele.timer.offsetLeft > (this.ele.timer.rect.left + this.SLIDE_DISTANCE)) {
					this.ele.timer.style.left = '0px';
					this.ele.timer.style.display = 'none';
					this.setStartTime(new Date(), true);
					if (this.type == 'majiang') {
						if (this.num == 201) {
							this.addConsumption('台费', 70, 1);
						} else {
							this.addConsumption('台费', PRICE.majiang, 1);
						}
					}
					displayElement(this.ele.startTime, 'flex');
					displayElement(this.ele.playedTime, 'flex');
					displayElement(this.ele.totalConsumptions, 'flex');
				}
			}
		}
	},

	addConsumption : function(name, price, quantity, putData) {
		putData = typeof putData !== 'undefined' ?  putData : true;
		var notFind = true;
		var int_price = parseInt(price);
		var int_quantity = parseInt(quantity);	
		//如果没有消费的话下面的循环将不会被执行。。。
		for (var i = 0; i < this.consumptions.length; i++) {
			if (name == this.consumptions[i].name) {
				this.consumptions[i].quantity += int_quantity;
				notFind = false;
				break;
			}		
		}
		if (notFind) {
			this.consumptions.push({'name':name, 'price':int_price, 'quantity':int_quantity});
		}
		this.ele.totalConsumptions.innerHTML = '$' + this.getTotalConsumptions();
		if (this.ele.totalConsumptions.style.display != 'flex') {
			displayElement(this.ele.totalConsumptions, 'flex');
		}
		if (putData) {
			this.putData();
		}
	},

	delConsumption : function(name, putData) {
		putData = typeof putData !== 'undefined' ?  putData : true;
		for (var i = 0; i < this.consumptions.length; i++) {
			if (this.consumptions[i].name == name) {
				this.consumptions.splice(i, 1);
				break;
			}
		}
		this.ele.totalConsumptions.innerHTML = '$' + this.getTotalConsumptions();
		if (putData) {
			this.putData();
		}
	},

	getTotalConsumptions : function() {
		var total = 0;
		var eachConsumption;
			for (var i = 0; i < this.consumptions.length; i++) {
				eachConsumption = this.consumptions[i].price * this.consumptions[i].quantity;
				total += eachConsumption;
			}
		return total;
	},

	changeRoomColor : function(color) {
		if (isVaildColor(color) === false) {
			throw Error("invalid color --> " + color);
		}
		this.ele.roomNum.style.background = color;
	},

	setStartTime : function(time, putData) {
		if (time === null) {
			this.startTime = null;
		} else {
			if (getType(time) == 'Date') {
				this.startTime = time;
				this.ele.startTime.innerText = getTimeStringHHMM(time);
				this.updatePlayedTime();
			} else {
				//转换成JS的时间对象
				this.startTime = new Date(time);
				this.ele.startTime.innerText = getTimeStringHHMM(this.startTime);
				this.updatePlayedTime();
			}
		}
		if (putData) { this.putData(); }
	},

	getPlayedTimeMS : function() {
		var timeMS = null;
		if (this.startTime) {
			timeMS = new Date() - this.startTime;
		}
		return timeMS;	
	},

	overTimeMin : function() {
		this.updatePlayedTime();
		var playedTimeMS = this.getPlayedTimeMS();
		//这里会得到2个时间差，单位为MS
		var overTimeMS = playedTimeMS - OVER_TIME_MS;
		var overTimeMin = Math.floor(overTimeMS / MS_TO_X.min);
		return overTimeMin;
	},
				
	updatePlayedTime : function() {
		if (this.startTime !== null) {
			var playedTime = this.getPlayedTimeMS();
			if (playedTime <= 0) {
				this.ele.playedTime.innerText = "00:00";
				this.ele.playedTime.style.color = "black";
			} else {
				if (playedTime > OVER_TIME_MS) {
					if (this.ele.playedTime.style.color != "red") {
						this.ele.playedTime.style.color = "red";
					}
				} else {
					if (this.ele.playedTime.style.color != "black") {
						this.ele.playedTime.style.color = "black";
					}
				}
				this.ele.playedTime.innerText = MS_To_HHMM(playedTime);
			}
		}
	},

	addOverTimeConsumption : function() {
		var overTimeMin = this.overTimeMin();
		var x = overTimeMin % 60;
		//超时了
		if (overTimeMin >= 15) {
			if (x >= 15) {
				if (x < 30) {
					this.addConsumption(CONSUMPTIONS.overTime['30M'], 5, 1, false);
				} else {
					this.addConsumption(CONSUMPTIONS.overTime['1H'], 10, 1, false);
				}
			}
			var overTimeHour = Math.floor(overTimeMin / 60);
			var y = 0;
			for (;y < overTimeHour;y++) {
				this.addConsumption(CONSUMPTIONS.overTime['1H'], 10, 1, false);
			}
		}
	},

	clearOverTimeConsumption: function() {
		var keys = Object.keys(CONSUMPTIONS.overTime);
		for (var i = 0; i < keys.length; i++) {
			this.delConsumption(CONSUMPTIONS.overTime[keys[i]], false);
		}
	},

};

