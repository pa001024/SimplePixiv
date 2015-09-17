// ==UserScript==
// @name          Pixiv Helper
// @namespace     http://userscripts.org/scripts/show/145988
// @version       0.1
// @description   P站收图临时版本
// @include       http://www.pixiv.net/--anypage
// @match         http://www.pixiv.net/member_illust.php?id=*
// @copyright     2012, XpAhH
// @author        pa001024
// ==/UserScript==
(function($) {
	var styleRes = function() {
		/*
.layout-a .layout-column-3 {
	position: fixed;
	left: 274px;
	width: 746px;
}

.preview_holder {
	text-align: center;
	min-height: 400px;
	cursor: pointer;
	margin: 8px;
}

.download_stat {
	text-align: center;
	margin: 0 8px;
	height: 32px;
	border: 1px #D6DEE5 solid;
	border-radius: 4px;
	line-height: 32px;
	overflow: hidden;
	background-color: #F2F4F6;
	cursor: pointer;
  	color: #333;
}
.download_stat.mode_both{
	background-color: #0096DB;
	color: #fff;
	box-shadow: 0 0 3px rgba(9, 90, 237, 0.38);
}
#downloaded_count {
	margin: 0 4px;
}
		*/
	};
	var myCSS = $("#sp_style");
	if (!myCSS.length) 
		myCSS=$("<style id='sp_style'>").insertAfter($(document.body).find(":last"));
	var stylestr = styleRes.toString();
	myCSS.html(stylestr.substr(18,stylestr.length-23));

	function onResize() {
		console.log("onResize");
		// 1080p模式
		if (window.innerWidth >= 1920) {
			$("#wrapper").css("width", "1730px");
			$(".layout-a").css("width", "100%");
			var col3 = $(".layout-a .layout-column-3");
			if (!col3.length) // .layout-column-3>._unit.manage-unit>(.preview_holder>img#priview_img)(.download_stat>{已下载}(span#downloaded_count))
			{
				col3 = $('<div class="layout-column-3"><div class="_unit manage-unit"><div class="preview_holder"><img id="priview_img"></div><div class="download_stat">已下载<span id="downloaded_count">0/0</span></div></div></div>').insertBefore($(".layout-column-2"));
				col3.find("img")[0].onload = function () {
					this.height >= 600 ? this.style.width = "auto" : this.style.width = "100%";
				}
			}
			$(".preview_holder")[0].onclick = function() {
				getIllust($("#priview_img").attr("src"), downloadFileGM);
			};
			$(".download_stat")[0].onclick = function() {
				$(this).toggleClass("mode_both");
			};
		} else {
			// TODO: 720p模式
			$("#wrapper").css("width", "1230px");
			$(".layout-a").css("width", "100%");
			var col3 = $(".layout-a .layout-column-3");
			if (!col3.length) // .layout-column-3>._unit.manage-unit>(.preview_holder>img#priview_img)(.download_stat>{已下载}(span#downloaded_count))
				col3 = $('<div class="layout-column-3"><div class="_unit manage-unit"><div class="preview_holder"><img id="priview_img"></div><div class="download_stat">已下载<span id="downloaded_count">0/0</span></div></div></div>').insertBefore($(".layout-column-2"));
			col3.css({
				"width": "247px",
				"left": "524px"
			});
			$(".preview_holder")[0].onclick = function() {
				getIllust($("#priview_img").attr("src"), downloadFileGM);
			};
			$(".download_stat")[0].onclick = function() {
				$(this).toggleClass("mode_both");
			};
		}
	}
	function getIllust(u, callback) {
		var id = u.match(/\d+(?=_p0)/)[0];
		$.get("/member_illust.php?mode=medium&illust_id=" + id, function(d) {
			var ilist = d.match(/img-original\/img\/.+?(?=" class="original-image")/);
			console.log(ilist);
			if (!ilist) return;
			var res = ilist[0];
			var url = u.replace(/c\/.+/,res);
			callback(url, id + res.match(/\..+?$/)[0]);
		});
	}
	function getIllustPriview(u) {
		return u.replace("150x150","600x600");
	}
	window.addEventListener("resize", onResize);
	onResize();

	function onUpdate(){
		console.log("onUpdate");
		$("._layout-thumbnail").each(function() {
			this.onmouseenter = function() {
				var img = $(this).find("img");
				$("#priview_img").attr("src", getIllustPriview(img.attr("src")));
			};
			this.onclick = function() {
				if ($(".download_stat").hasClass("mode_both")) {
					getIllust($("#priview_img").attr("src"), downloadFileGM);
					return false;
				}
			}
		});
	}
	function downloadFile(url,filename) {
		var i = document.createElement("a"), o = document.createEvent("MouseEvent");
		i.href = url;
		i.download = filename;
		i.target = "_blank";
		o.initEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 0, null);
		i.dispatchEvent(o);
	}
	function downloadFileRAW(url,filename) {
		$.get(url, function(d) {
			var m = new Blob([d]);
			var l = URL.createObjectURL(m);
			var i = document.createElement("a"), o = document.createEvent("MouseEvent");
			i.href = l;
			i.download = filename;
			o.initEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 0, null);
			i.dispatchEvent(o);
		});
	}
	function downloadFileGM(url,filename) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			headers: { 'Referer': 'http://www.pixiv.net/' },
			overrideMimeType: "text/plain; charset=x-user-defined",
			onload: function(f) {
				d = f.response;
				var j = 0, t, n = new Uint8Array(d.length);
				for (var i in d) n[i] = d.charCodeAt(i) & 255;
				var m = new Blob([n.buffer]);
				var l = URL.createObjectURL(m);
				var i = document.createElement("a");
				i.download = filename;
				i.href = l;
				var o = document.createEvent("MouseEvent");
				o.initEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 0, null);
				i.dispatchEvent(o);
			}
		});
	}
	onUpdate();
}).call(unsafeWindow, unsafeWindow.$);