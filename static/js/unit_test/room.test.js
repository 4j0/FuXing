var expect = chai.expect;

describe('Room constructor', function() {
	var room_obj = { number: "201", status : 'empty', bill_id: null, startTime: null, consumptions: 0,};
	var ele = $('201');
	var room = new Room(room_obj, ele);
	var div_roomNum = ele.getElementsByClassName('roomNum')[0];
	var div_startTime = ele.getElementsByClassName('startTime')[0];
	var div_billing = ele.getElementsByClassName('btn-billing')[0];
	var div_playedTime = ele.getElementsByClassName('playedTime')[0];

	it('room.num == obj.number', function() {
		expect(room.num).to.be.equal(room_obj.number);
	});
	
	it('room.bill_id == obj.bill_id', function() {
		expect(room.bill_id).to.be.equal(room_obj.bill_id);
	});
	
	it('room.consumptions == obj.consumptions', function() {
		expect(room.consumptions).to.be.equal(room_obj.consumptions);
	});
	
	it('room.ele == ele', function() {
		expect(room.ele).to.be.equal(ele);
	});
	//});
	
	it('room.ele.roomNum == div_roomNum', function() {
		expect(room.ele.roomNum).to.be.equal(div_roomNum);
	});

	it('room.ele.startTime == div_startTime', function() {
		expect(room.ele.startTime).to.be.equal(div_startTime);
	});

	it('room.ele.billing == div_billing', function() {
		expect(room.ele.billing).to.be.equal(div_billing);
	});

	it('room.ele.playedTime == div_playedTime', function() {
		expect(room.ele.playedTime).to.be.equal(div_playedTime);
	});

	it('throw Error if ele is not a HTMLElement', function() {
		expect(function() {
			new Room(room_obj, new Date());
		}).to.throw(TypeError, /not a HTMLElement/);
	});

	it('throw Error if ele is not a room HTMLElement', function() {
		expect(function() {
			new Room(room_obj, $("mocha"));
		}).to.throw(Error, /not a room HTMLElement/);
	});

	it('throw Error if obj is not room_obj', function() {
		expect(function() {
			var room_obj = { numbr: "201", status : 'empty', bill_id: null, startTime: null, consumptions: 0,};
			new Room(room_obj, $("201"));
		}).to.throw(Error, /not a valid room_obj/);
	});

});

describe('Room setStatus', function() {
	var room_obj = { number: "201", status : 'empty', bill_id: null, startTime: null, consumptions: 0,};
	var ele = $('201');
	var room = new Room(room_obj, ele);

	it('set roomStatus to empty', function() {
		var color_empty = hexToRgb(ROOM_COLOR.empty);
		room.setStatus('empty');
		expect(room.status).to.be.equal('empty');
		expect(room.ele.roomNum.style.background).to.be.equal(color_empty);
	});

	it('set roomStatus to taken', function() {
		var color_taken = hexToRgb(ROOM_COLOR.taken);
		room.setStatus('taken');
		expect(room.status).to.be.equal('taken');
		expect(room.ele.roomNum.style.background).to.be.equal(color_taken);
	});

	it('set roomStatus to reserved', function() {
		var color_reserved = hexToRgb(ROOM_COLOR.reserved);
		room.setStatus('reserved');
		expect(room.status).to.be.equal('reserved');
		expect(room.ele.roomNum.style.background).to.be.equal(color_reserved);
	});

	it('throw Error if status is invalid', function() {
		expect(function() {
			room.setStatus('error');
		}).to.throw(Error, /invalid room status/);
	});

});

describe('Room setStartTime', function() {
	var room_obj = { number: "201", status : 'empty', bill_id: null, startTime: null, consumptions: 0,};
	var ele = $('201');
	var room = new Room(room_obj, ele);

	it('throw TypeError if time is not a Date', function() {
		expect(function() {
			room.setStartTime('error');
		}).to.throw(TypeError, /not a Date/);
	});

	it('setStartTime && ele.startTime.innerHTML', function() {
		var date = new Date();
		room.setStartTime(date);
		expect(room.startTime).to.be.equal(date);
		expect(room.ele.startTime.innerHTML).to.be.equal(getTimeStringHHMM(date));
	});

});

describe('Room changeRoomColor', function() {
	var room_obj = { number: "201", status : 'empty', bill_id: null, startTime: null, consumptions: 0,};
	var ele = $('201');
	var room = new Room(room_obj, ele);

	it('throw Error if color is invalid', function() {
		expect(function() {
			room.changeRoomColor('error');
		}).to.throw(Error, /invalid color/);
	});

	it('change ele.roomNum.style.background color', function() {
		var color = "#FFFFFF";
		room.changeRoomColor(color);
		expect(room.ele.roomNum.style.background).to.be.equal(hexToRgb(color));
	});

});

describe('Room getPlayedTime', function() {
	var room_obj = { number: "201", status : 'empty', bill_id: null, startTime: null, consumptions: 0,};
	var ele = $('201');
	var room = new Room(room_obj, ele);

	it('return null if room.startTime === null', function() {
		expect(room.getPlayedTime()).to.be.null;
	});


	it('test getPlayedTime', function() {
		time = 1461302943505;
		startTime = new Date(time);
		room.startTime = startTime;
		playedTime = room.getPlayedTime();
		now = new Date().getTime();	
		expect(now - (time + playedTime)).to.be.below(100);
	});

});




