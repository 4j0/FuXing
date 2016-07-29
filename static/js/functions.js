var STYLE = {};
STYLE.DISPLAY = ["none", "inline", "block", "inline-block", "contents", "list-item", "inline-list-item", "table", "inline-table", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row", "table-row-group", "table-caption", "flex", "inline-flex", "grid", "inline-grid", "ruby", "ruby-base", "ruby-text", "ruby-base-container", "ruby-text-container", "run-in", "inherit", "initial", "unset"];
var _toString = Object.prototype.toString;

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
	return ele;
}

var $ = function(elementID) {
	return document.getElementById(elementID);
};

var $$ = function(ele, _class) {
	return ele.getElementsByClassName(_class)[0];
};

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
	var type = getType(date);
	if (type != "Date") {
		throw TypeError("date is not a Date! It is a " + type + ".");
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
	var minutes = Math.floor((ms/(1000*60)))%60;
	var hours = Math.floor((ms/(1000*60*60)))%24;

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;

	return hours + ":" + minutes;
}

function hourAdd() {
	var hour = parseInt($("time-picker-time-hour").innerHTML);
	hour = (hour >= 24) ? 0 : hour + 1;
	$("time-picker-time-hour").innerHTML = hour;
}

function hourSub() {
	var hour = parseInt($("time-picker-time-hour").innerHTML);
	hour = (hour <= 0) ? 24 : hour - 1;
	$("time-picker-time-hour").innerHTML = hour;
}

function minAdd() {
	var min = parseInt($("time-picker-time-min").innerHTML);
	min = (min >= 60) ? 0 : (min + 10) - (min % 10);
	$("time-picker-time-min").innerHTML = min;
}

function minSub() {
	var min = parseInt($("time-picker-time-min").innerHTML);
	if (min === 0) {
		min = 60;
	} else {
		min = (min % 10 === 0) ? min -= 10 : min - (min % 10);
	}
	$("time-picker-time-min").innerHTML = min;
}

function setNow() {
	$("time-picker-time-hour").innerHTML = new Date().getHours();
	$("time-picker-time-min").innerHTML = new Date().getMinutes();
}

Layer = {

	open: function(ele, level) {
		if (level) {
			var modal_background = document.createElement('div');
			modal_background.setAttribute('class', 'modal-background');
			modal_background.setAttribute('id', 'modal-background-level-' + level);
			modal_background.style.zIndex = level - 1;
			document.getElementsByTagName('body')[0].appendChild(modal_background);
			displayElement(modal_background, "block");

			ele.style.zIndex = level;
			displayElement(ele, "block");
		}
	},

	close: function(ele, level) {
		var body = document.getElementsByTagName('body')[0];
		hideElement(ele);
		body.removeChild($('modal-background-level-' + level));
	},

	confirm: function(content, fnYes, fnNo) {
		//console.log(this);
		var div = $("confirm-modal-A");
		$$(div, "confirm-box-content-div-p").innerHTML = content;
		$$(div, "btn-yes").onclick = function() {
			if (fnYes) {
				fnYes();
			}
			Layer.close($("confirm-modal-A"), 999);
		};
		$$(div, "btn-no").onclick = function() {
			if (fnNo) {
				fnNo();
			}
			Layer.close($("confirm-modal-A"), 999);
		};
		Layer.open($("confirm-modal-A"), 999);
	},

	showBox: function(ele, fnYes, fnNo, level) {
		level = typeof level !== 'undefined' ?  level : 1;
		$$(ele, "btn-yes").onclick = function() {
			fnYes();
			Layer.close(ele, level);
		};
		$$(ele, "btn-no").onclick = function() {
			fnNo();
			Layer.close(ele, level);
		};
		Layer.open(ele, level);
	},

	time: function(fnYes, fnNo) {
		Layer.open($("time-picker-A"), 1);
		$("time-picker-btn-yes").onclick = function() {
			fnYes();
			Layer.close($("time-picker-A"), 1);
		};
		$("time-picker-btn-no").onclick = function() {
			fnNo();
			Layer.close($("time-picker-A"), 1);
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
