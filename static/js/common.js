var HOST = window.location.host;
var APP = "";
var URL = "http://" + HOST + APP;
var STYLE = {};
var MS_TO_X = { min : 60000, hour : 3600000};
STYLE.DISPLAY = ["none", "inline", "block", "inline-block", "contents", "list-item", "inline-list-item", "table", "inline-table", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row", "table-row-group", "table-caption", "flex", "inline-flex", "grid", "inline-grid", "ruby", "ruby-base", "ruby-text", "ruby-base-container", "ruby-text-container", "run-in", "inherit", "initial", "unset"];
var _toString = Object.prototype.toString;

var _$ = function(elementID) {
	return document.getElementById(elementID);
};

var $$ = function(ele, _class) {
	return ele.getElementsByClassName(_class)[0];
};

function getType(obj) {
	return _toString.call(obj).split(" ")[1].slice(0, -1);
}

function hasProperties(propertiesList, obj) {
	if (getType(propertiesList) != "Array") {
		throw TypeError("propertiesList is not a Array!");
	}
	for(var i = 0, l = propertiesList.length; i < l; i++) {
		if (propertiesList[i] in obj === false) {
			return false;
		}
	}
	return true;
}

function isHTMLElement(obj) {
	return obj instanceof HTMLElement;
}
	
//return true if a in list,or return flase if a not in list.
function isInList(obj, list) {
	for (var i = 0, len = list.length; i < len; i++) {
		if (obj === list[i]) { return true;}
	}
	return false;
}

function isDisplayed(ele) {
	if (ele.style.display == 'none' || ele.style.display === "") {
		return false;
	}
	return true;
}

function createElement(tagName, _class, id, innerHTML) {
	var ele = document.createElement(tagName);
	if (_class) {
		ele.setAttribute('class', _class);
	}
	if (id) {
		ele.setAttribute('id', id);
	}
	if (innerHTML) {
		ele.innerHTML = innerHTML;
	}
	if (innerHTML === 0) {
		ele.innerHTML = innerHTML;
	}
	return ele;
}


function isVaildColor(color) {
	if (color.length != 7 || color[0] != '#') {
		return false;
	}
	for (var i = 1, l = color.length; i < l; i++) {
		if (isNaN(parseInt(color[i], 16))) {
			return false;
		}
	}
	return true;
}

function displayElement(ele, style) {
	var style = typeof style !== 'undefined' ? style : 'block';
	var eleIsHTMLElement = ele instanceof HTMLElement;
	if (!eleIsHTMLElement) {
		var objType = getType(ele);
		throw TypeError("ele is not a HTMLElement! It is a " + objType + ".");
	}
	if (!isInList(style, STYLE.DISPLAY)) {
		throw new Error("not a valid style!");
	}
	ele.style.display = style;
}

function hideElement(ele) {
	if (ele instanceof HTMLElement) {
		ele.style.display = 'none';
	} else {
		var objType = getType(ele);
		throw TypeError("ele is not a HTMLElement! It is a " + objType + ".");
	}
}

function button(ele, text) {
	if (ele instanceof HTMLElement) {
		var color = arguments[2] ? arguments[2] : COLORS.button;
		ele.style.background = color;
		ele.style.border = "2px outset buttonface";
		ele.innerText = text;
	} else {
		var objType = getType(ele);
		throw TypeError("ele is not a HTMLElement! It is a " + objType + ".");
	}
}

function noButton(ele) {
	var eleIsHTMLElement = ele instanceof HTMLElement;
	if (!eleIsHTMLElement) {
		var objType = getType(ele);
		throw TypeError("ele is not a HTMLElement! It is a " + objType + ".");
	}
	ele.style.background = COLORS.noButton;
	ele.style.border = "0px";
}

function getTimeStringHHMM(date) {
	//var type = getType(date);
	//if (type != "Date") {
		//throw TypeError("date is not a Date! It is a " + type + ".");
	//}
	if (date === null) {
		return "";
	}
	var HHMMSS = date.toTimeString().split(" ")[0];
	var HHMM = HHMMSS.slice(0, -3);
	return HHMM;
}

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};

function MS_To_HHMM(ms) {
	if (ms === null) {
		return "";
	}
	var minutes = Math.floor((ms/(1000*60)))%60;
	var hours = Math.floor((ms/(1000*60*60)))%24;

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;

	return hours + ":" + minutes;
}

function hourAdd() {
	var hour = parseInt(_$("time-picker-time-hour").innerHTML);
	hour = (hour >= 23) ? 0 : hour + 1;
	_$("time-picker-time-hour").innerHTML = hour;
}

function hourSub() {
	var hour = parseInt(_$("time-picker-time-hour").innerHTML);
	hour = (hour <= 0) ? 23 : hour - 1;
	_$("time-picker-time-hour").innerHTML = hour;
}

function minAdd() {
	var min = parseInt(_$("time-picker-time-min").innerHTML);
	min = (min >= 50) ? 0 : (min + 10) - (min % 10);
	_$("time-picker-time-min").innerHTML = min;
}

function minSub() {
	var min = parseInt(_$("time-picker-time-min").innerHTML);
	if (min === 0) {
		min = 50;
	} else {
		min = (min % 10 === 0) ? min -= 10 : min - (min % 10);
	}
	_$("time-picker-time-min").innerHTML = min;
}

function setNow() {
	_$("time-picker-time-hour").innerHTML = new Date().getHours();
	_$("time-picker-time-min").innerHTML = new Date().getMinutes();
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

function clearBox(id) {
	var box = _$(id);
	var quantities = box.getElementsByClassName('consumptionsBox-items-quantity');
	for (var i = 0; i < quantities.length; i++) {
		quantities[i].innerHTML = "0";
	}
}

Layer = {

	//zIndex: 1,

	/*open: function(ele) {
		var zIndex = this.zIndex;
		var modal_background = document.createElement('div');
		modal_background.setAttribute('class', 'modal-background');
		modal_background.setAttribute('id', 'modal-background-level-' + this.zIndex);
		document.getElementsByTagName('body')[0].appendChild(modal_background);
		displayElement(modal_background, "block");

		ele.style.zIndex = zIndex + 1;
		displayElement(ele, "block");
		this.zIndex += 2;
	},*/

	open : function(ele) {
		var _ele = $(ele);
		var index = layer.open({
			type: 1,
			content: _ele,
			closeBtn: 0
		});
		ele.layerIndex = index;
	},

	/*close: function(ele) {
		var body = document.getElementsByTagName('body')[0];
		hideElement(ele);
		body.removeChild(_$('modal-background-level-' + (this.zIndex -2)));
		this.zIndex -= 2;
	},*/

	close : function(ele) {
		layer.close(ele.layerIndex);
		ele.layerIndex = undefined;
	},

	confirm: function(content, fnYes, fnNo) {
		var div = _$("confirm-modal-A");
		$$(div, "confirm-box-content-div-p").innerHTML = content;
		$$(div, "btn-yes").onclick = function() {
			if (fnYes) {
				fnYes();
			}
			Layer.close(_$("confirm-modal-A"));
		};
		$$(div, "btn-no").onclick = function() {
			if (fnNo) {
				fnNo();
			}
			Layer.close(_$("confirm-modal-A"));
		};
		Layer.open(div);
	},

	showBox: function(ele, fnYes, fnNo) {
		$$(ele, "btn-yes").onclick = function() {
			if (fnYes) {
				fnYes();
			}
			Layer.close(ele);
		};
		$$(ele, "btn-no").onclick = function() {
			if (fnNo) {
				fnNo();
			}
			Layer.close(ele);
		};
		Layer.open(ele);
	},

	time: function(fnYes, fnNo) {
		Layer.open($("time-picker-A"), 1);
		_$("time-picker-btn-yes").onclick = function() {
			fnYes();
			Layer.close(_$("time-picker-A"), 1);
		};
		_$("time-picker-btn-no").onclick = function() {
			fnNo();
			Layer.close(_$("time-picker-A"), 1);
		};
	},

};

function Ajax() {}

/**
 * get请求
 * @param {String}   url     请求地址,文件名
 * @param {Function} fnSucc  请求成功时执行的函数
 * @param {Function} fnFaild 请求失败执行的函数
 */
Ajax.get = function(url, fnSucc, fnFaild) {
	var xmlHttpRequest = new XMLHttpRequest();
    //2.连接服务器
    //open(方法,url,是否异步)
    xmlHttpRequest.open("GET", url, true);
    //3.发送请求
    xmlHttpRequest.send();
    //4.接收返回
    //OnRedayStateChange事件
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 200) {
                //alert("成功" + xmlHttpRequest.responseText);
                fnSucc(xmlHttpRequest.responseText);
            } else {
                //alert("服务器响应失败!");
                if (fnFaild) {
                    fnFaild();
                }
            }
        }
    };
};

/**
 * post请求
 * @param {String}   url     请求地址,文件名
 * @param {Function} fnSucc  请求成功时执行的函数
 * @param {Function} fnFaild 请求失败执行的函数
 */
Ajax.post = function(url, str, fnSucc, fnFaild) {
	var xmlHttpRequest = new XMLHttpRequest();
    //2.连接服务器
    //open(方法,url,是否异步)
    xmlHttpRequest.open("POST", url, true);
    //xmlHttpRequest.open("XMLHttpRequestPOST", url, true);
	//设置相应头为json格式
	xmlHttpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    //3.发送请求
    xmlHttpRequest.send(str);
    //4.接收返回
    //OnRedayStateChange事件
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 200) {
				if (fnSucc) {
					fnSucc(xmlHttpRequest.responseText);
				}
            } else {
                if (fnFaild) {
                    fnFaild();
                }
            }
        }
    };
};

Ajax.put = function(url, str, fnSucc, fnFaild) {
	var xmlHttpRequest = new XMLHttpRequest();
    //2.连接服务器
    //open(方法,url,是否异步)
    xmlHttpRequest.open("PUT", url, true);
	//设置相应头为json格式
	xmlHttpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    //3.发送请求
    xmlHttpRequest.send(str);
    //4.接收返回
    //OnRedayStateChange事件
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 200) {
				//console.log(xmlHttpRequest.responseText);
				if (fnSucc) {
					fnSucc();
				}
            } else {
                if (fnFaild) {
                    fnFaild();
                }
            }
        }
    };
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	var red = parseInt(result[1], 16);
	var green = parseInt(result[2], 16);
	var blue = parseInt(result[3], 16);
    return result ? "rgb(" + red + ", " + green + ", " + blue + ")"
     : null;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
