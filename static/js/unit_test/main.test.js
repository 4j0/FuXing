var expect = chai.expect;

describe('main getClickedRoomId', function() {

	it('throw Error if ele is null', function() {
		expect(function(){
			getClickedRoomId(null);
		}).to.throw(TypeError, /Null/);
	});

	it('throw Error if ele have not a parentElement!', function() {
		expect(function(){
			var eles = document.getElementsByTagName('html');
			var ele = eles[0];
			getClickedRoomId(ele);
		}).to.throw(Error, /Null/);
	});

	it('throw Error if ele.parentElemet.className != room', function() {
		expect(function(){
			getClickedRoomId($('test'));
		}).to.throw(Error, /!= room/);
	});

	it('return ele.parentElement.id', function() {
		var ele = $('b-201');
		expect(getClickedRoomId(ele)).to.be.equal('201');
	});

});


