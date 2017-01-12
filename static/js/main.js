var ROOM_COLOR = { empty: '#4caf50', taken: '#FF3030', reserved: '#6495ED'};
var COLORS = { background: { startTime : '#c0c0c0'}, button: '#c0c0c0', noButton: '#FFFFFF'};
var OVER_TIME_MS = 5 * 60 * 60 * 1000;
var RoomCtrls = {};

function _Event(sender) {
    this._sender = sender;
    this._listeners = [];
}

_Event.prototype = {

    attach : function (listener, name) {
		listener._name = name;
        this._listeners.push(listener);
    },

    notify : function (args) {
        var i;

        for (i = this._listeners.length - 1; i >= 0; i--) {
            this._listeners[i](this._sender, args);
        }
    },
	
	dettach : function (name) {
		var i;
		//for (i = this._listeners.length; i--;) {
		for (i = this._listeners.length - 1; i >= 0; i--) {
			if (this._listeners[i]._name === name) {
				this._listeners.splice(i, 1);
			}
		}
	},
};

var BillBox = function(room) {
	var self = this;
	this.billBox = _$("billBox");
	this.billBox_total_div = document.getElementsByClassName("billBox-total-div")[0];
	this.insertBefore_div = document.getElementsByClassName("billBox-insertBefore-div")[0];
	this.payBtn = document.getElementsByClassName("btn-pay")[0];
	this.closeBtn = $$(this.billBox, 'btn-no');
	this.room = room;
	this.payBtn.onclick = this.displayPayBox.bind(this);
	this.room.model.postBill_done.attach(function(sender, args) {
		self.close();
	}, "BillBox");
	this.closeBtn.onclick = function() {
		self.close();
	};
	this.room.model.consumptionQuantityChanged.attach(function(sender, args) {
		if (isDisplayed(this.billBox)) {
			this.updateConsumption(args);
			this.updateTotal();
		}
	}.bind(this), name="BillBox");
	this.room.model.consumptionDeled.attach(function(sender, args) {
		this.delConsumption(args);
		this.updateTotal();
	}.bind(this), name="BillBox");
	this.open();
};

BillBox.prototype = {

	open : function() {
		this.room.model.addOverTimeConsumption();
		var consumptions = this.room.model.consumptions;
		for (var i = 0; i < consumptions.length; i++) {
			var billBox_items_div = this.create_billBox_items_div(consumptions[i], i);
			this.billBox.insertBefore(billBox_items_div,  this.insertBefore_div);
		}
		this.updateTotal();
		Layer.open(this.billBox);
	},

	close : function() {
		this.room.model.consumptionQuantityChanged.dettach("BillBox");
		this.room.model.consumptionDeled.dettach("BillBox");
		this.room.model.postBill_done.dettach("BillBox");
		this.room.model.removeOverTimeConsumption();
		this.clear();
		Layer.close(this.billBox);
	},

	create_billBox_items_div : function(consumption, i) {
		var billBox_items_div = createElement('div', 'billBox-items-div', 'billBox-items-div-' + consumption.name);
		var itemNmae = createElement('div', 'billBox-item', null, consumption.name);
		var itemPrice = createElement('div', 'billBox-item', null, consumption.price);
		var itemQuantity = this.createQuantityDiv(consumption);
		var subtotal = createElement('div', 'billBox-item subtotal', null, this.get_subtotal(consumption));
		var del_div = createElement('div', 'billBox-item', null, null);
		var button_del = createElement('button', 'button-del', null, "&#10006");
		button_del.onclick = function() {
			var content = "删除 " + consumption.name + " 数量 " + consumption.quantity; 
			Layer.confirm(content, function() {
				if (this.room.model.is_overTimeConsumption(consumption)) {
					this.room.model.delConsumption(consumption);
				} else {
					this.room.model.delConsumption_ajax(consumption);
				}
			}.bind(this), null);
		}.bind(this);
		del_div.appendChild(button_del);
		billBox_items_div.appendChild(itemNmae);
		billBox_items_div.appendChild(itemPrice);
		billBox_items_div.appendChild(itemQuantity);
		billBox_items_div.appendChild(subtotal);
		billBox_items_div.appendChild(del_div);
		return billBox_items_div;
	},

	createQuantityDiv : function(consumption) {
		var itemQuantity = createElement('div', 'billBox-item billBox-item-quantity-container', null, null);
		var quantity = createElement('div', 'billBox-item-quantity-items quantity', null, consumption.quantity);
		var div_plus = createElement('div', 'billBox-item-quantity-items quantityPlus', null, "+");
		div_plus.onclick = function() {
			if (this.room.model.is_overTimeConsumption(consumption)) {
				this.room.model.setConsumptionQuantity(consumption.name, consumption.quantity + 1);
			} else {
				this.room.model.setConsumptionQuantity_ajax(consumption.name, consumption.quantity + 1);
			}
		}.bind(this);
		var div_minus = createElement('div', 'billBox-item-quantity-items quantityMinus', null, "-");
		div_minus.onclick = function() {
			if (consumption.quantity >= 2) {
				if (this.room.model.is_overTimeConsumption(consumption)) {
					this.room.model.setConsumptionQuantity(consumption.name, consumption.quantity - 1);
				} else {
					this.room.model.setConsumptionQuantity_ajax(consumption.name, consumption.quantity - 1);
				}
			}
		}.bind(this);

		itemQuantity.appendChild(div_minus);
		itemQuantity.appendChild(quantity);
		itemQuantity.appendChild(div_plus);
		return itemQuantity;
	},

	getConsumptionDiv : function(name) {
		return _$("billBox-items-div-" + name);
	},

	updateConsumption : function(name) {
		var consumption = this.room.model.get_consumptionByName(name);
		var consumption_div = this.getConsumptionDiv(name);
		var quantity_div = $$(consumption_div, "billBox-item-quantity-container");
		var quantity = $$(quantity_div, "quantity");
		var subtotal = $$(consumption_div, "subtotal");

		quantity.innerHTML = consumption.quantity;
		subtotal.innerHTML = this.get_subtotal(consumption);
	},

	get_subtotal : function(consumption) {
		return consumption.price * consumption.quantity;
	},

	delConsumption : function(name) {
		var div = this.getConsumptionDiv(name);
		var del_div = $$(div, "button-del");
		try {
			this.billBox.removeChild(div);
		} catch(err) {
			console.log(err);
		}
	},

	clear : function() {
		var billBoxItems = document.getElementsByClassName("billBox-items-div");
		for (var i = billBoxItems.length - 1; i >= 0; i--) {
			this.billBox.removeChild(billBoxItems[i]);
		}
	},

	updateTotal : function() {
		this.billBox_total_div.innerHTML = "总计 " + this.room.model.get_totalConsumptions();
	},

	displayPayBox : function() {
		payBox = new PayBox(this.room.model);
		payBox.confirm.onclick = this.room.handleClickPayBoxConfirm.bind(this.room, payBox);
		payBox.open();
	}
};

function PayBox(RoomModel) {
	this.roomModel = RoomModel;
	this.div = document.getElementsByClassName('payBox')[0];
	this.amount = $$(this.div, 'payBox-consumption_amount');
	this.paidInAmount = $$(this.div, 'payBox-paid-in_amount-input');
	this.remark = $$(this.div, 'payBox-remark-input');
	this.confirm = $$(this.div, 'btn-yes');
	this.cancel = $$(this.div, 'btn-no');
	this.cancel.onclick = function() {
		this.close();
	}.bind(this);
	this.roomModel.postBill_done.attach(function() {
		this.close();
	}.bind(this), "PayBox");
}

PayBox.prototype = {
	
	open : function() {
		var total = this.roomModel.get_totalConsumptions();
		this.amount.innerHTML = "应收 " + total;
		this.paidInAmount.value = total;
		this.remark.value = '';
		Layer.open(this.div);
	},

	close : function() {
		Layer.close(this.div);
		this.roomModel.postBill_done.dettach("PayBox");
	},

	get_paid_in_amount : function() {
		return this.paidInAmount.value;
	},

	get_remark : function() {
		return this.remark.value;
	},

};

function initRooms(jsonData) {
	var rooms = JSON.parse(jsonData.rooms);
	for (var roomNum in rooms) {
		var model = new RoomModel(rooms[roomNum]);
		var view = new RoomView(model);
		RoomCtrls[roomNum] = new RoomCtrl(model, view);
	}
}

function getRoomData() {
	var def = $.Deferred();
	$.get(URL + "/rooms")
		.done(function(data) {
			def.resolve(data);
		})
		.fail(function() {
			def.reject();
		});
	return def.promise();
}
	
function verifyAccount(account) {
	var def = $.Deferred();
	if (account) {
		$.ajax({
			url: URL + "/login",
			method: 'POST',
			data: JSON.stringify(account),
			contentType: "application/json"
		})
		.done(function(data) {
			def.resolve(data);
		})
		.fail(function() {
			def.reject();
		});
	} else {
		def.reject();
	}
	return def.promise();
}

function login() {
	var def = $.Deferred();
	var login_btn = _$("login_btn");
	Layer.open(_$("login"));

	login_btn.onclick = function() {
		var userName = _$('login_user').value;
		var passwd = _$('login_passwd').value;
		var account = { 'userName' : userName, 'passwd' : passwd };
		verifyAccount(account)
			.done(function() {
				Layer.close(_$("login"));
				def.resolve();
			})
			.fail(function() {
				alert("用户名，密码错误！");
				_$('login_passwd').value = "";
			});
	};
	return def.promise();
}

$(function() {
	if (getCookie('token')) {
		getRoomData()
			.done(function(data) {
				initRooms(data);
			})
			//比如服务器重启等原因造成的token失效
			.fail(function() {
				login()
					.done(function() {
						getRoomData()
							.done(function(data) {
								initRooms(data);
							});
					});
			});
	} else {
		login()
			.done(function() {
				getRoomData()
					.done(function(data) {
						initRooms(data);
					});
			});
	}
});

