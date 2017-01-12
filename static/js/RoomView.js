var RoomView = function(model) {
	var self = this;
	this.model = model;
	this.consumptionBox = null;
	this.ele = this.init_ele(model.number);

	this.timerTouched = new _Event(this);
	this.statusChanged = new _Event(this);
	this.startTimeClicked = new _Event(this);
	this.consumptionsBoxConfirmClicked = new _Event(this);
	this.startTimeConfirmClicked = new _Event(this);
	this.swipeInPos = new _Event(this);

	this.ele.roomNum.addEventListener('click', this.displayStatusSelectors.bind(this), false);
	this.ele.startTime.addEventListener('click', this.displayTimePicker.bind(this), false);
	this.ele.consumptionsAdd.addEventListener('click', this.display_consumptionItemsDiv.bind(this), false);
	this.ele.timer.addEventListener('touchmove', this.handleTouchTimer.bind(this), false);

	this.ele.tea.onclick = function() {
		self.displayConsumptionBox.call(self, "consumptionsBox-tea");
	};
	this.ele.drink.onclick = function() {
		self.displayConsumptionBox.call(self, "consumptionsBox-drink");
	};
	this.ele.food.onclick = function() {
		self.displayConsumptionBox.call(self, "consumptionsBox-food");
	};
	this.ele.cigarette.onclick = function() {
		self.displayConsumptionBox.call(self, "consumptionsBox-cigarette");
	};
	this.ele.other.onclick = function() {
		self.displayConsumptionBox.call(self, "consumptionsBox-other");
	};

	this.model.startTiming.attach(this.handle_startTiming.bind(this));
	this.model.startTimeChanged.attach(this.handle_startTimeChanged.bind(this));
	this.model.consumptionAdded.attach(this.handle_consumptionAdded.bind(this));
	this.model.consumptionsChanged.attach(this.update_total.bind(this));
	this.model.putConsumptions_done.attach(this.closeConsumptionBox.bind(this));
	this.model.statusChanged.attach(this.handle_statusChanged.bind(this));
	this.model.statusChanged.notify();
	if (this.model.get_totalConsumptions() || this.model.startTime) {
		displayElement(this.ele.totalConsumptions, 'flex');
	}
	if (this.model.startTime) {
		displayElement(this.ele.startTime, 'flex');
		displayElement(this.ele.playedTime, 'flex');
	}
};

RoomView.prototype = {

	SLIDE_DISTANCE : 250,

	init_ele : function(roomNum) {
		var ele = _$(roomNum);
		ele.roomNum = $$(ele, 'roomNum');
		ele.empty = $$(ele, 'statusSelector_empty');
		ele.take = $$(ele, 'statusSelector_taken');
		ele.reserve = $$(ele, 'statusSelector_reserved');
		ele.timer = $$(ele, 'timer');
		ele.startTime = $$(ele, 'startTime');
		ele.playedTime = $$(ele, 'playedTime');
		ele.totalConsumptions = $$(ele, "totalConsumptions");
		ele.consumptionsAdd = $$(ele, "consumptionsAdd");
		ele.consumptionItemsDiv = $$(ele, "consumptionItemsDiv");
		ele.tea = $$(ele.consumptionItemsDiv, "tea");
		ele.drink = $$(ele.consumptionItemsDiv, "drink");
		ele.food = $$(ele.consumptionItemsDiv, "food");
		ele.cigarette = $$(ele.consumptionItemsDiv, "cigarette");
		ele.other = $$(ele.consumptionItemsDiv, "others");
		ele.timePicker = _$("time-picker-A");
		return ele;
	},

	empty : function() {
		this.ele.timer.style.left = '0px';
		this.update();

		hideElement(this.ele.timer);
		hideElement(this.ele.startTime);
		hideElement(this.ele.playedTime);
		hideElement(this.ele.consumptionsAdd);
		hideElement(this.ele.consumptionItemsDiv);
		hideElement(this.ele.totalConsumptions);
	},

	taken: function() {
		this.updateRoomColor();
		displayElement(this.ele.consumptionsAdd, 'flex');
		//如果已开始计时则不需要显示Timer
		if (!this.model.startTime) {
			this.displayTimer();
		}
	},

	updateRoomColor : function() {
		this.ele.roomNum.style.background = ROOM_COLOR[this.model.status];
	},
	
	update: function() {
		this.updateRoomColor();
		this.update_startTime();
		this.update_playedTime();
		this.update_total();
	},

	getConsumptions : function(id) {
		var consumptions = [];
		var box = _$(id);
		var names = box.getElementsByClassName('consumptionsBox-items-name');
		var prices = box.getElementsByClassName('consumptionsBox-items-price');
		var quantities = box.getElementsByClassName('consumptionsBox-items-quantity');
		for (var i = 0; i < quantities.length; i++) {
			var quantity = parseInt(quantities[i].innerHTML);
			if (quantity > 0) {
				var name = names[i].innerHTML;
				var price = parseInt(prices[i].innerHTML);
				consumptions.push({'name' : name, 'price' : price, 'quantity' : quantity});
			}
		}
		if (!consumptions) { return null; }
		return consumptions;
	},

	displayTimePicker : function() {
		_$("time-picker-time-hour").innerHTML = this.model.startTime.getHours();
		_$("time-picker-time-min").innerHTML = this.model.startTime.getMinutes();
		Layer.open(this.ele.timePicker);
		//如使用jquery的click接口将会导致重复注册event handler到同一个DOM对象上。
		_$("time-picker-btn-yes").onclick = function() {
			var startTime = new Date();
			startTime.setHours(_$("time-picker-time-hour").innerHTML);
			startTime.setMinutes(_$("time-picker-time-min").innerHTML);
			this.startTimeConfirmClicked.notify(startTime);
		}.bind(this);
		_$("time-picker-btn-no").onclick = function() {
			Layer.close(this.ele.timePicker);
		}.bind(this);
	},

   displayTimer : function() {
		displayElement(this.ele.timer, 'flex');
		if (!this.ele.timer.rect) {
			this.ele.timer.rect = this.ele.timer.getBoundingClientRect();
			this.ele.timer.rect.halfWidth = this.ele.timer.rect.width / 2;
		}
	},

	displayStatusSelectors: function() {
		if (this.is_displayed_statusSelectors()) {
			this.hide_statusSelectors();
			return;
		}
		switch (this.model.status) {
			case 'empty':
				displayElement(this.ele.take);
				break;
			case 'taken':
				displayElement(this.ele.empty);
				break;
		}
	},

	display_consumptionItemsDiv : function() {
		if (this.ele.consumptionItemsDiv.style.display == 'flex') {
			hideElement(this.ele.consumptionItemsDiv);
			return;
		}
		displayElement(this.ele.consumptionItemsDiv, 'flex');
	},

	hide_statusSelectors : function() {
		hideElement(this.ele.empty);
		hideElement(this.ele.take);
		hideElement(this.ele.reserve);
	},

	is_displayed_statusSelectors : function() {
		return isDisplayed(this.ele.empty) || isDisplayed(this.ele.take) || isDisplayed(this.ele.reserve);
	},

   update_startTime : function() {
		this.ele.startTime.innerHTML = getTimeStringHHMM(this.model.get_startTime());
	},

	update_playedTime : function() {
		var playedTimeMS = this.model.get_playedTimeMS();
		this.ele.playedTime.style.color = playedTimeMS > OVER_TIME_MS ? 'red' : 'black';
		this.ele.playedTime.innerText =  MS_To_HHMM(playedTimeMS);
	},

	update_total : function() {
		var total = this.model.get_totalConsumptions();	
		this.ele.totalConsumptions.innerHTML = total;
	},

	display_consumptions : function() {
		if (!isDisplayed(this.ele.totalConsumptions)) {
			displayElement(this.ele.totalConsumptions, 'flex');
		}
	},

	displayConsumptionBox : function(id) {
		this.consumptionBox = _$(id);
		var btn_yes = $$(this.consumptionBox, "btn-yes");
		btn_yes.onclick = function() {
			this.consumptionsBoxConfirmClicked.notify(id);
		}.bind(this);
		var btn_no = $$(this.consumptionBox, "btn-no");
		btn_no.onclick = function() {
			Layer.close(this.consumptionBox);
			clearBox(id);
		}.bind(this);
		Layer.open(this.consumptionBox);
	},

	closeConsumptionBox : function() {
		if (this.consumptionBox) {
			Layer.close(this.consumptionBox);
			clearBox(this.consumptionBox.id);
			this.consumptionBox = null;
		}
	},

	handle_startTiming : function() {
		displayElement(this.ele.startTime, 'flex');
		displayElement(this.ele.playedTime, 'flex');
		displayElement(this.ele.totalConsumptions, 'flex');
	},

	handle_startTimeChanged : function() {
		this.update_startTime();
		this.update_playedTime();
		if (isDisplayed(this.ele.timePicker)) {
			Layer.close(this.ele.timePicker);
		}
	},

	handle_consumptionAdded : function() {
		if (!isDisplayed(this.ele.totalConsumptions)) {
			displayElement(this.ele.totalConsumptions, 'flex');
		}
		this.update_total();
	},

	handle_statusChanged : function() {
		switch (this.model.status) {
			case 'empty':
				this.empty();
				break;
			case 'taken':
				this.taken();
				break;
			case 'reserved':
				//
				break;
		}
		this.hide_statusSelectors();
		this.update();
	},

	handleTouchTimer : function(event) {
		if (event.targetTouches.length == 1) {
			var touch = event.targetTouches[0];
			//只能往右滑动
			if (touch.pageX  > (this.ele.timer.rect.left + this.ele.timer.rect.halfWidth)) {
				this.ele.timer.style.left = touch.pageX - this.ele.timer.rect.left - this.ele.timer.rect.halfWidth + 'px';
				//滑动到位后
				if(this.ele.timer.offsetLeft > (this.ele.timer.rect.left + this.SLIDE_DISTANCE)) {
					this.swipeInPos.notify();

				}
			}
		}
	},

};
