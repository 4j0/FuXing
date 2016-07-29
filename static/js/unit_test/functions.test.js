//var displayElement = require('./functions.js');
//var expect = require('/usr/local/lib/node_modules/chai').expect;
var expect = chai.expect;

describe('hasProperties', function() {

	it('throw TypeError if propertiesList is not a Array!', function() {
		expect(function(){
			hasProperties('ss', new Date());
		}).to.throw(TypeError, /Array/);
	});

	it('return true if obj hasProperties', function() {
		var foo = {a : 1, b : 2};
		expect(hasProperties(['a', 'b'], foo)).to.be.true;
	});

	it('return false if obj not hasProperties', function() {
		var foo = {a : 1, b : 2};
		expect(hasProperties(['a', 'b', 'c'], foo)).to.be.false;
	});

});

describe('displayElement', function() {
	it('ele.style == flex', function() {
		var ele = $("test");
		displayElement(ele, 'flex');
		expect(ele.style.display).to.be.equal("flex");
	});

	it('throw TypeError Null!', function() {
		expect(function(){
			displayElement($('fsdfd'), 'flex');
		}).to.throw(TypeError, /Null/);
	});

	it('throw Error not a valid style!', function() {
		expect(function(){
			displayElement($('test'), 'ssss');
		}).to.throw(Error, /not a valid style!/);
	});

});

describe('hideElement', function() {
	it('ele.style == none', function() {
		var ele = $("test");
		hideElement(ele);
		expect(ele.style.display).to.be.equal("none");
	});

	it('throw TypeError Null!', function() {
		expect(function(){
			hideElement($('fsdfd'));
		}).to.throw(TypeError, /Null/);
	});

});

describe('button', function() {
	it('change style & text whitout color', function() {
		var ele = $('test');
		var text = "button";
		button(ele, text);
		expect(ele.style.background).to.be.equal(hexToRgb(COLORS.button));
		expect(ele.innerHTML).to.be.equal(text);
		expect(ele.style.border).to.be.equal(BORDERS.button);
	});

	it('change style & text whit color', function() {
		var ele = $('test');
		var color = hexToRgb("EEEEEE");
		var text = "button";
		button(ele, text, color);
		expect(ele.style.background).to.be.equal(color);
		expect(ele.innerHTML).to.be.equal(text);
		expect(ele.style.border).to.be.equal(BORDERS.button);
	});

	it('throw TypeError if ele == Null', function() {
		expect(function() {
			button($("fdsdf"), 'button');
		}).to.throw(TypeError, /Null/);
	});

});

describe('noButton', function() {
	it('change background & border style to noButton', function() {
		$('test').style.background = 'AAAAAA';
		$('test').style.border = '10px';
		noButton($('test'));
		expect($('test').style.background).to.be.equal(hexToRgb(COLORS.noButton));
		expect($('test').style.border).to.be.equal('0px');
	});

	it('throw TypeError Null ele', function() {
		expect(function() {
			noButton($("fdsdf"));
		}).to.throw(TypeError, /Null/);
	});

});

describe('getTimeStringHHMM', function() {
	it('return timeStringHHMM', function() {
		var time = new Date('Fri Apr 01 2016 15:45:08 GMT+0800 (CST)');
		expect(getTimeStringHHMM(time)).to.be.equal('15:45');
	});

	it('throw TypeError String', function() {
		expect(function() {
			getTimeStringHHMM('fdsf');
		}).to.throw(TypeError, /String/);
	});

});

describe('isVaildColor', function() {
	it('return true', function() {
		expect(isVaildColor("#3ef314")).to.be.true;
	});

	it('return false if color length is not 7', function() {
		expect(isVaildColor("#44444")).to.be.false;
		expect(isVaildColor("#4444444")).to.be.false;
	});

	it('return false if color[i] > F', function() {
		expect(isVaildColor("#FFFFFG")).to.be.false;
	});

	it('return false if color[i] is not a Number', function() {
		expect(isVaildColor("#FFFFF!")).to.be.false;
	});

});



