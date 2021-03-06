var KEYS = ["room_id", "start_time", "end_time", "consumption_amount", "paid_in_amount", "remark"];
var date;

Layer = {

	zIndex: 1,

	open: function(ele) {
		var zIndex = this.zIndex;
		var modal_background = document.createElement('div');
		modal_background.setAttribute('class', 'modal-background');
		modal_background.setAttribute('id', 'modal-background-level-' + this.zIndex);
		document.getElementsByTagName('body')[0].appendChild(modal_background);
		displayElement(modal_background, "block");

		ele.style.zIndex = zIndex + 1;
		displayElement(ele, "block");
		this.zIndex += 2;
	},

	//open : function(ele) {
		//var _ele = $(ele);
		//var index = layer.open({
			//type: 1,
			//content: _ele,
			//closeBtn: 0
		//});
		//ele.layerIndex = index;
	//},

	close: function(ele) {
		var body = document.getElementsByTagName('body')[0];
		hideElement(ele);
		body.removeChild(_$('modal-background-level-' + (this.zIndex -2)));
		this.zIndex -= 2;
	},

	//close : function(ele) {
		//layer.close(ele.layerIndex);
		//ele.layerIndex = undefined;
	//},

};

window.addEventListener('load',function(){
	date = new Date();
	update();
});

function update() {
	var datetime_range = get_datetimeRange(date);
	var url = getUrlByDatetimeRange(datetime_range);
	clear_bills_div();
	Ajax.get(url, function(responseText) {
		var bills = JSON.parse(responseText);
		//console.log(bills);
		createBills(bills);
		_$('total_paid_in').innerHTML = "当日总收入=" + total_paid_in(bills);
		update_datetime_range_div(datetime_range);
	}, null);
}

function update_datetime_range_div(datetime_range) {
	//"2016-07-28 08:00:00"
	var start = datetime_range.start.slice(5,16);
	var end = datetime_range.end.slice(5,16);
	var innerHTML = start + " 至 " + end;
	_$('datetime_range').innerHTML = innerHTML;
}

function getUrlByDatetimeRange(datetime_range) {
	var start = encodeURIComponent(datetime_range.start);
	var end = encodeURIComponent(datetime_range.end);
	var url = URL + "/bills?datetime_range=" + start + '~' + end;
	return url;
}

function clear_bills_div () {
	var bills_div = document.getElementsByClassName('bills_div')[0];
	var divs = document.getElementsByClassName('bill_div');
	for (var i = divs.length - 1; i >= 0; i--) {
		bills_div.removeChild(divs[i]);
	}
}

function previous_date() {
	date = get_yesterday(date);
	update();
}

function next_date() {
	date = get_tomorrow(date);
	update();
}

function createBills(bills) {
	var bills_div = document.getElementsByClassName('bills_div')[0];
	for (var i = 0; i < bills.length; i++) {
		var bill = createBill(bills[i]);
		bills_div.appendChild(bill);
	}
}

function createBill(bill) {
	var bill_div = createElement('div', 'bill_div');
	var key;
	var bill_item;
	for (var i = 0; i < KEYS.length; i++) {
		key = KEYS[i];
		if (bill[key] !== null && key.split('_')[1] == 'time') {
			bill_item = createElement('div', 'bill_item bill_' + key, null, bill[key].split(' ')[1].slice(0,5));
		} else {
			bill_item = createElement('div', 'bill_item bill_' + key, null, bill[key]);
		}
		bill_item.bill_id = bill.bill_id;
		bill_item.addEventListener("click", show_bill_content, false);
		bill_div.appendChild(bill_item);
	}
	return bill_div;
}

function show_bill_content() {
	//console.log(this.bill_id);
	Ajax.get(URL + "/bills/" + this.bill_id, function(responseText) {
		clear_consumption_div();
		var bill_content = _$('bill_content');
		var consumptions = JSON.parse(responseText);
		var total = getTotal(consumptions);
		var consumptionsDiv = create_consumptionsDiv(consumptions);
		var totalDiv = createElement('div', 'consumption_div consumption_total', null, '总计 ' + total);
		bill_content.appendChild(consumptionsDiv);
		bill_content.appendChild(totalDiv);
		Layer.open(_$('bill_content'), 1);
		//console.log(consumptions);
	}, null);
}

function clear_consumption_div() {
	var bill_content = _$('bill_content');
	//var bill_content = document.getElementsByClassName('bills_div')[0];
	var divs = document.getElementsByClassName('consumption_div');
	for (var i = divs.length - 1; i >= 0; i--) {
		bill_content.removeChild(divs[i]);
	}
}

function getTotal(consumptions) {
	var i;
	var total = 0;
	var subTotal = 0;
	for ( i = 0; i < consumptions.length; i++) {
		subTotal = consumptions[i].consumption_price * consumptions[i].consumption_quantity;
		total += subTotal;
	}
	return total;
}

function create_consumptionsDiv(consumptions) {
	var consumptionsDiv = createElement('div', 'consumption_div');
	var consumptionDiv;
	for (var i = 0; i < consumptions.length; i++) {
		consumptionDiv = create_consumptionDiv(consumptions[i]);
		consumptionsDiv.appendChild(consumptionDiv);
	}
	return consumptionsDiv;
}

function create_consumptionDiv(consumption) {
	var eachConsumption = createElement('div', 'eachConsumption');
	var consumption_item;
	var keys = ["consumption_name", "consumption_price", "consumption_quantity"];
	for (var i = 0; i < keys.length; i++) {
		consumption_item = createElement('div', 'consumption_item ' + keys[i], null, consumption[keys[i]]);
		eachConsumption.appendChild(consumption_item);
	}
	var subTotal = consumption.consumption_quantity * consumption.consumption_price;
	var subTotalDiv = createElement('div', 'consumption_item consumption_subTotal', null, subTotal);
	eachConsumption.appendChild(subTotalDiv);
	return eachConsumption;
}
		

function total_paid_in(bills) {
	var total = 0;
	var paid_in;
	for (var i = 0; i < bills.length; i++) {
		paid_in = parseInt(bills[i].paid_in_amount);
		total += paid_in;
	}
	return total;
}

function get_yesterday(_date) {
	var date = new Date(_date);
	date.setDate(date.getDate() - 1);
	return date;
}

function get_tomorrow(_date) {
	var date = new Date(_date);
	date.setDate(date.getDate() + 1);
	return date;
}


function setTo8Clock(date) {
	date.setHours(8);
	date.setMinutes(0);
	date.setSeconds(0);
}

function get_datetimeRange(_date) {
	var date = new Date(_date);
	var start,end;
	if (date.getHours() < 8) {
		var yesterday = get_yesterday(date);
		setTo8Clock(yesterday);
		start = yesterday.toMysqlFormat();
		setTo8Clock(date);
		end = date.toMysqlFormat();
	} else {
		setTo8Clock(date);
		start = date.toMysqlFormat();
		var tomorrow = get_tomorrow(date);
		setTo8Clock(tomorrow);
		end = tomorrow.toMysqlFormat();
	}
	return { 'start' : start, 'end' : end};
}
