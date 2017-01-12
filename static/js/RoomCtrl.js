var RoomCtrl = function(model, view) {
	this.model = model;
	this.view = view;

	this.view.ele.take.addEventListener('click', this.take.bind(this), false);
	this.view.ele.empty.addEventListener('click', this.empty.bind(this), false);
	this.view.ele.totalConsumptions.addEventListener('click', this.handleClickTotalConsumptions.bind(this), false);
	this.view.consumptionsBoxConfirmClicked.attach(this.handleClickConsumptionsBoxConfirm.bind(this));
	this.view.startTimeConfirmClicked.attach(this.handleClickStartTimeConfirm.bind(this));
	this.view.swipeInPos.attach(this.handle_swipeInPos.bind(this));
	this.model.postBill_done.attach(this.empty.bind(this));
	this.playedTimeUpdater = this.model.startTime ? window.setInterval(this.view.update_playedTime.bind(this.view), 30000) : null;
};

RoomCtrl.prototype = {

	empty : function() {
		this.model.empty();
		this.playedTimeUpdater = window.clearInterval(this.playedTimeUpdater);
	},

	take : function() {
		this.model.taken();
	},

	handle_swipeInPos : function() {
		hideElement(this.view.ele.timer);
		this.model.set_startTime(new Date());
		this.playedTimeUpdater = window.setInterval(this.view.update_playedTime.bind(this.view), 30000);
		if (this.model.type == 'majiang') {
			if (this.model.number == 201) {
				this.model.putConsumptions([{name:'台费', price:70, quantity:1}]);
			} else {
				this.model.putConsumptions([{name:'台费', price:60, quantity:1}]);
			}
		}
	},

	handleClickStartTimeConfirm : function(sender, args) {
		this.model.set_startTime(args);
	},

	handleClickTotalConsumptions: function() {
		var billBox = new BillBox(this);
	},

	handleClickConsumptionsBoxConfirm : function(sender, args) {
		var consumptions = this.view.getConsumptions(args);
		if (consumptions.length > 0) {
			this.model.putConsumptions(consumptions);
		} else {
			this.view.closeConsumptionBox();
		}
	},

	handleClickPayBoxConfirm : function(payBox) {
		var bill = { start_time : this.model.startTime ? this.model.startTime.toMysqlFormat() : null,
			end_time : new Date().toMysqlFormat(), 
			room_id : this.model.number, 
			consumption_amount : this.model.get_totalConsumptions(),
			paid_in_amount : payBox.get_paid_in_amount(),
			consumptions : this.model.consumptions,
			remark : payBox.get_remark(),
		};
		this.model.postBill(bill);
	},

};
