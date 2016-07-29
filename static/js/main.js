var ROOM_COLOR = { empty: '#4caf50', taken: '#FF3030', reserved: '#6495ED'};
var COLORS = { background: { startTime : '#c0c0c0'}, button: '#c0c0c0', noButton: '#FFFFFF'};
var BORDERS = { button: '2px outset buttonface', };
var URL = "http://192.168.11.20:5000/";
//var URL = "http://192.168.1.30:5000/";
var rooms = {};
var PRICE = {'majiang':60};
var clickedRoom;
var SLIDE_DISTANCE = 250;
var playedTimeUpdater = setInterval(updatePlayedTime, 30000);
var MS_TO_X = { min : 60000, hour : 3600000};
var OVER_TIME_MS = 5 * 60 * 60 * 1000;
var CONSUMPTIONS = { overTime : {'30M' : '+30分', '1H' : '+1小时'},
};

//Ajax.get(URL + "rooms", function(responseText) {
	////console.log(getType(response));
	//var JSON_Obj = JSON.parse(responseText);
	//var JSON_Obj_rooms = JSON.parse(JSON_Obj.rooms);
	//for (var roomNum in JSON_Obj_rooms) {
		////console.log(JSON_Obj_rooms[roomNum]);
		//rooms[roomNum] = new Room(JSON_Obj_rooms[roomNum], $(roomNum));
	//}
//}, null);


window.addEventListener('load',function(){
	Ajax.get(URL + "rooms", function(responseText) {
		//console.log(getType(response));
		var JSON_Obj = JSON.parse(responseText);
		var JSON_Obj_rooms = JSON.parse(JSON_Obj.rooms);
		for (var roomNum in JSON_Obj_rooms) {
			//console.log(JSON_Obj_rooms[roomNum]);
			rooms[roomNum] = new Room(JSON_Obj_rooms[roomNum], $(roomNum));
		}
	}, null);
});

function getClickedRoomId(ele) {
	if (isHTMLElement(ele) === false) {
		throw TypeError('ele is not a HTMLElement,it is a ' + getType(ele) + '.');
	}
	if (isHTMLElement(ele.parentElement) === false) {
		throw Error('ele.parentElement is ' + getType(ele.parentElement) + '.');
	}
	if (ele.parentElement.className !== 'room') {
	   throw Error('ele\'parentElement.className != room');
	}
	return ele.parentElement.id;
}

function test() { console.log('test'); }

function getClickedRoom(roomId) {
	return rooms[roomId];
}

function startTimingYes() {
	clickedRoom.setStartTime(new Date(), true);
	displayElement(clickedRoom.ele.startTime, 'flex');
	noButton(clickedRoom.ele.playedTime);
	displayElement(clickedRoom.ele.playedTime, 'flex');
	clickedRoom.ele.playedTime.onclick = null;
	clickedRoom = null;
}

function startTimingNo() {
	if (clickedRoom.startTime === null) {
		//button(clickedRoom.ele.playedTime, '计时');
		displayElement(clickedRoom.ele.playedTime, 'flex');
	}
	clickedRoom = null;
}

function updatePlayedTime() {
	for (var room in rooms) {
		//room.updatePlayedTime;
		//console.log(typeof(room));
		rooms[room].updatePlayedTime();
	}
}

function timing(ele) {
	clickedRoom = getClickedRoom(getClickedRoomId(ele));
	Layer.confirm("是否开始计时?", startTimingYes, startTimingNo);
}

function adjustStartTime(ele) {
	//var dateTime = new Date();
	var roomID = getClickedRoomId(ele);
	var room = getClickedRoom(roomID);
	$("time-picker-time-hour").innerHTML = room.startTime.getHours();
	$("time-picker-time-min").innerHTML = room.startTime.getMinutes();
	Layer.time(function() { 
		room.startTime.setHours($("time-picker-time-hour").innerHTML);
		room.startTime.setMinutes($("time-picker-time-min").innerHTML);
		room.setStartTime(room.startTime, true);
	},
			function() { console.log("timeNo"); });
}
	
function statusSelector(ele) {
	var room = getClickedRoom(getClickedRoomId(ele));
	var div_taken = $$(room.ele, "statusSelector_taken");
	var div_empty = $$(room.ele, "statusSelector_empty");
	var div_reserved = $$(room.ele, "statusSelector_reserved");

	//if (div_taken.style.display != "none" || div_empty.style.display != 'none' || div_reserved.style.display != 'none') {
	if (div_taken.style.display == "block" || div_empty.style.display == 'block' || div_reserved.style.display == 'block') {
		hideElement(div_taken);
		hideElement(div_empty);
		hideElement(div_reserved);
		return;
	}
	switch (room.status) {
		case 'empty':
			displayElement($$(room.ele, "statusSelector_taken"), 'block');
			//displayElement($$(room.ele, "statusSelector_reserved"), 'block');
			break;
		case 'taken':
			displayElement($$(room.ele, "statusSelector_empty"), 'block');
			break;
	}
}

function emptyRoom(ele) {
	var room = getClickedRoom(getClickedRoomId(ele));
	room.empty(true);
	hideElement($$(room.ele, 'statusSelector_empty'));
}

function takenRoom(ele) {
	var room = getClickedRoom(getClickedRoomId(ele));
	//点击后隐藏元素
	hideElement($$(room.ele, 'statusSelector_taken'));
	hideElement($$(room.ele, 'statusSelector_reserved'));
	//这里需要先隐藏taken和reserved按钮，否则会造成Timer的rect的属性错误
	room.taken(true);
	//displayElement(room.ele.timer, 'flex');
	//displayElement(room.ele.consumptionsAdd, 'flex');
	////生成计时按钮位置信息
	//var rect = room.ele.timer.getBoundingClientRect();
	//var rectLeft = rect.left;
	//var rectWidth = rect.width;
	//var rectHalfWidth = rectLeft / 2;
	//var rectOffsetLeft = room.ele.timer.offsetLeft;
	//var SLIDE_DISTANCE = 250;
   /* room.ele.timer.addEventListener('touchmove', function(event) {*/
		//if (event.targetTouches.length == 1) {
			//var touch = event.targetTouches[0];
			////只能往右滑动
			//if (touch.pageX  > (rectLeft + rectHalfWidth)) {
				//room.ele.timer.style.left = touch.pageX - rectLeft - rectHalfWidth + 'px';
				//滑动到位后
				//if(room.ele.timer.offsetLeft > (rectOffsetLeft + SLIDE_DISTANCE)) {
					//room.ele.timer.style.display = 'none';
					//room.setStartTime(new Date(), true);
					//if (room.type == 'majiang') {
						//room.addConsumption('majiang', PRICE.majiang, 1);
					//}
					//displayElement(room.ele.startTime, 'flex');
					//displayElement(room.ele.playedTime, 'flex');
					//displayElement(room.ele.totalConsumptions, 'flex');
					////displayElement(room.ele.consumptionsAdd, 'flex');
				//}
			//}
		//}
	/*}, false);*/
	//room.ele.timer.addEventListener('touchend', function(event) {
		//room.ele.timer.style.left = '0px';
	//}, false);
}

function displayConsumptionItems(ele) {
	var room = getClickedRoom(getClickedRoomId(ele));
	if (room.ele.consumptionItemsDiv.style.display == 'flex') {
		hideElement(room.ele.consumptionItemsDiv);
		return;
	}
	displayElement(room.ele.consumptionItemsDiv, 'flex');
}

function showConsumptionBox(ele, id) {
	var room = getClickedRoom(getClickedRoomId(ele.parentElement));
	Layer.showBox($(id), function() {
		var consumptions = getConsumptions(id);
		if (consumptions.length > 0) {
			addConsumptions(room, consumptions);
			clearBox(id);
		}		
	}, function() {
		//清除teaBox内容
		clearBox(id);
	});
}

function create_billBox_items_div(consumption, roomNum) {
	var billBox_items_div = createElement('div', 'billBox-items-div');
	var itemNmae = createElement('div', 'billBox-item', null, consumption.name);
	var itemPrice = createElement('div', 'billBox-item', null, consumption.price);
	var itemQuantity = createElement('div', 'billBox-item', null, consumption.quantity);
	var del_div = createElement('div', 'billBox-item', null, null);
	var button_del = createElement('button', 'button-del', roomNum, "&#10006");
	button_del.itemName = consumption.name;
	button_del.itemQuantity = consumption.quantity;
	button_del.addEventListener("click", confirm_delConsumption, false);
	del_div.appendChild(button_del);

	billBox_items_div.appendChild(itemNmae);
	billBox_items_div.appendChild(itemPrice);
	billBox_items_div.appendChild(itemQuantity);
	billBox_items_div.appendChild(del_div);
	return billBox_items_div;
}

function create_billBox(room) {
	var billBox = $("billBox");
	var billBox_total_div = document.getElementsByClassName("billBox-total-div")[0];
	var insertBefore_div = document.getElementsByClassName("billBox-insertBefore-div")[0];
	var payBtn = document.getElementsByClassName("btn-pay")[0];
	payBtn.roomNum = room.num;
	for (var i = 0; i < room.consumptions.length; i++) {
		var billBox_items_div = create_billBox_items_div(room.consumptions[i], room.num);
		//billBox.insertBefore(billBox_items_div,  billBox_total_div);
		billBox.insertBefore(billBox_items_div,  insertBefore_div);
	}
	billBox_total_div.innerHTML = "总计 " + room.getTotalConsumptions();
	return billBox;
}

function showBillBox(ele) {
	var room = getClickedRoom(getClickedRoomId(ele));
	var consumptions_length = room.consumptions.length;
	if (room.consumptions.length > 0) {
		room.addOverTimeConsumption();
		var billBox = create_billBox(room);
		Layer.showBox(billBox, function() { //买单
		}, function() { //取消
			room.clearOverTimeConsumption();
			//这里需要优化成只有del了consumption才putData();
			if (consumptions_length !== room.consumptions.length) {
				room.putData();
			}
			//清除billBox内容
			clearBillBox();
		}, 2);
	}
}

function show_payBox(ele) {
	var room = rooms[ele.roomNum];
	var payBox = get_payBox(room);
	Layer.showBox(payBox, function() {//确认
		var bill = { start_time : room.startTime ? room.startTime.toMysqlFormat() : room.startTime,
			end_time : new Date().toMysqlFormat(), 
			room_id : room.num, 
			consumption_amount : room.getTotalConsumptions(),
			paid_in_amount : getPayBoxPaidIn(),
			consumptions : room.consumptions,
			remark : getPayBoxRemark(),
		};
		//console.log(bill);
		Ajax.post(URL + "bills", JSON.stringify(bill), function() {
			room.empty(true);
			clearBillBox();
		}, null);
		Layer.close($('billBox'), 2);
	}, function() {//取消

	}, 3);
}

function getPayBoxPaidIn() {
	var foo = document.getElementsByClassName('payBox-paid-in_amount-input')[0].value;
	return parseInt(foo);
}

function getPayBoxRemark() {
	var remark = document.getElementsByClassName('payBox-remark-input')[0].value;
	if (remark) {
		return remark;
	} else {
		return '';
	}
}

function get_payBox(room) {
	var payBox = document.getElementsByClassName('payBox')[0];
	$$(payBox, 'payBox-consumption_amount').innerHTML = "应收 " + room.getTotalConsumptions();
	$$(payBox, 'payBox-paid-in_amount-input').value = room.getTotalConsumptions();
	$$(payBox, 'payBox-remark-input').value = '';
	return payBox;
}

function confirm_delConsumption() {
	var content = "删除 " + this.itemName + " 数量 " + this.itemQuantity; 
	Layer.confirm.call(this, content, delConsumption.bind(this), null);
	//Layer.confirm(this, content, delConsumption.bind(this), null);
}

function delConsumption() {
	//console.log(this);
	var room = rooms[this.id];
	var billBox_item = this.parentElement;
	var billBox_items_div = billBox_item.parentElement;
	var biilBox = billBox_items_div.parentElement;
	var billBox_total_div = document.getElementsByClassName("billBox-total-div")[0];
	billBox.removeChild(billBox_items_div);
	room.delConsumption(this.itemName, false);
	billBox_total_div.innerHTML = "总计 " + room.getTotalConsumptions();
}


function clearBillBox() {
	var billBox = $("billBox");
	var billBoxItems = document.getElementsByClassName("billBox-items-div");
	//var length = billBoxItems.length;
	for (var i = billBoxItems.length - 1; i >= 0; i--) {
		billBox.removeChild(billBoxItems[i]);
	}
}

function addConsumptions(room, consumptions) {
	for (var i = 0; i < consumptions.length; i++) {
		room.addConsumption(consumptions[i].name, consumptions[i].price, consumptions[i].quantity);
	}
}

function getConsumptions(id) {
	var consumptions = [];
	var box = $(id);
	var names = box.getElementsByClassName('consumptionsBox-items-name');
	var price = box.getElementsByClassName('consumptionsBox-items-price');
	var quantities = box.getElementsByClassName('consumptionsBox-items-quantity');
	for (var i = 0; i < quantities.length; i++) {
		if (quantities[i].innerHTML > 0) {
			consumptions.push({'name' : names[i].innerHTML, 'price' : price[i].innerHTML, 'quantity' : quantities[i].innerHTML});
		}
	}
	return consumptions;
}


function clearBox(id) {
	var box = $(id);
	var quantities = box.getElementsByClassName('consumptionsBox-items-quantity');
	for (var i = 0; i < quantities.length; i++) {
		quantities[i].innerHTML = "0";
	}
}

function addQuantity(ele) {
	var ele_quantity = ele.previousElementSibling;
	ele_quantity.innerHTML = parseInt(ele_quantity.innerHTML) + 1;
}

function subQuantity(ele) {
	var ele_quantity = ele.previousElementSibling.previousElementSibling;
	var quantity = parseInt(ele_quantity.innerHTML);
	if (quantity >= 1) {
		ele_quantity.innerHTML = quantity - 1;
	}
}

