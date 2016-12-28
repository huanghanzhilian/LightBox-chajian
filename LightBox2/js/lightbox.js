(function($) {
	var LightBox = function(settings) {
		var self = this;
		this.settings = {
			speed: 500,
			maxWH: 100,
			maskOpacity: 0.5
		};
		$.extend(this.settings, settings || {});
		//创建遮罩和弹出框
		this.popupMask = $('<div id="G-lightbox-mask">');
		this.popupWin = $('<div id="G-lightbox-popup">');

		//保存body
		this.bodyNode = $(document.body);

		//渲染剩余的dom，并且插入body
		this.renderDOM();

		this.picViewArea = this.popupWin.find("div.lightbox-pic-view"); //图片预览区域
		this.popupPic = this.popupWin.find("img.lightbox-image"); //图片
		this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption"); //图片描述区域
		this.nextBtn = this.popupWin.find("span.lightbox-next-btn");
		this.prevBtn = this.popupWin.find("span.lightbox-prev-btn");
		this.captionText = this.popupWin.find("p.lightbox-pic-desc"); //图片描述
		this.currentIndex = this.popupWin.find("span.lightbox-of-index"); //图片索引
		this.closeBtn = this.popupWin.find("span.lightbox-close-btn"); //关闭按钮

		//准备开发事件委托，获取组数据
		this.groupName = null;
		this.groupData = []; //放置同一组数据
		this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]", "click", function(e) {
				//阻止事件冒泡
				e.stopPropagation();
				var currentGroupName = $(this).attr("data-group");
				if (currentGroupName != self.groupName) {
					self.groupName = currentGroupName;
					//根据当前组名获取同一组数据
					self.getGroup();
				}
				//初始化弹出
				self.initPopup($(this));
			})
			//关闭弹出
		this.popupMask.click(function() {
			$(this).fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});
		this.closeBtn.click(function() {
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});
		//绑定上下切换按钮事件
		this.flag = true;
		this.nextBtn.hover(function() {
			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).addClass("lightbox-next-btn-show");
			}
		}, function() {
			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).removeClass("lightbox-next-btn-show");
			}
		}).click(function(e) {
			if (!$(this).hasClass("disabled") && self.flag) {
				self.flag = false;
				e.stopPropagation();
				self.goto("next");
			}
		});
		this.prevBtn.hover(function() {
			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).addClass("lightbox-prev-btn-show");
			}
		}, function() {
			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).removeClass("lightbox-prev-btn-show");
			}
		}).click(function(e) {
			if (!$(this).hasClass("disabled") && self.flag) {
				self.flag = false;
				e.stopPropagation();
				self.goto("prev");
			}
		});

		//绑定窗口调整事件
		var timer = null;
		this.clear = false;
		$(window).resize(function() {
			if (self.clear) {
				window.clearTimeout(timer);
				timer = window.setTimeout(function() {
					self.loadPicSize(self.groupData[self.index].sec);
				}, 500)
			}
		}).keyup(function(e) {
			var keyVel = e.which;
			if (self.clear) {
				if (keyVel == 38 || keyVel == 37) {
					self.prevBtn.click();
				} else if (keyVel == 39 || keyVel == 40) {
					self.nextBtn.click();
				}
			}

		});
	}



	LightBox.prototype.renderDOM = function() {
		var strDom = '<div class="lightbox-pic-view">' +
			'<span class="lightbox-btn lightbox-prev-btn"></span>' +
			'<img class="lightbox-image" src="images/1-1.jpg">' +
			'<span class="lightbox-btn lightbox-next-btn"></span>' +
			'</div>' +
			'<div class="lightbox-pic-caption">' +
			'<div class="lightbox-caption-area">' +
			'<p class="lightbox-pic-desc">d</p>' +
			'<span class="lightbox-of-index">当前索引:0 of 0</span>' +
			'</div>' +
			'<span class="lightbox-close-btn"></span>' +
			'</div>';
		//插入到popupWin
		this.popupWin.html(strDom);
		//把遮罩和弹出框插入到body
		this.bodyNode.append(this.popupMask, this.popupWin);
	};
	LightBox.prototype.getGroup = function() {
		var self = this;
		//根据当前组别名称获取页面中所有相同组别的对象
		var groupList = this.bodyNode.find("*[data-group=" + this.groupName + "]");

		//清空数组数据
		self.groupData.length = 0;
		groupList.each(function() {
			self.groupData.push({
				sec: $(this).attr("data-source"),
				id: $(this).attr("data-id"),
				caption: $(this).attr("data-caption")
			});
		});
		//console.log(self.groupData)
	}
	LightBox.prototype.initPopup = function(currentObj) {
		var self = this;
		var sourceSrc = currentObj.attr("data-source");
		var currentId = currentObj.attr("data-id");
		this.showMaskAndPopup(sourceSrc, currentId);
	}
	LightBox.prototype.showMaskAndPopup = function(sourceSrc, currentId) {
		var self = this;
		this.popupPic.hide();
		this.picCaptionArea.hide();
		this.popupMask.css({
			opacity: self.settings.maskOpacity
		}).fadeIn();
		var winWidth = $(window).width(),
			winHeight = $(window).height();
		this.picViewArea.css({
			width: winWidth / 2,
			height: winHeight / 2
		});
		this.popupWin.fadeIn();
		var viewHeight = winHeight / 2 + 10;
		this.popupWin.css({
			width: winWidth / 2 + 10,
			height: winHeight / 2 + 10,
			marginLeft: -(winWidth / 2 + 10) / 2,
			top: -viewHeight
		}).animate({
			top: (winHeight - viewHeight) / 2
		}, self.settings.speed, function() {
			//加载图片
			self.loadPicSize(sourceSrc);
		});
		//根据当前点击的元素id获取在当前组别里面的索引
		this.index = this.getIndexOf(currentId);
		var groupDataLength = this.groupData.length;
		if (groupDataLength > 1) {
			//this.nextBtn
			if (this.index === 0) {
				this.prevBtn.addClass("disabled");
				this.nextBtn.removeClass("disabled");
			} else if (this.index === groupDataLength - 1) {
				this.nextBtn.addClass("disabled");
				this.prevBtn.removeClass("disabled");
			} else {
				this.nextBtn.removeClass("disabled");
				this.prevBtn.removeClass("disabled");
			}
		}
	}
	LightBox.prototype.getIndexOf = function(currentId) {
		var index = 0;
		$(this.groupData).each(function(i) {
				index = i;
				if (this.id === currentId) {
					return false;
				}
			})
			//console.log($(this.groupData))
		return index;
	}
	LightBox.prototype.loadPicSize = function(sourceSrc) {
		var self = this;
		self.popupPic.css({
			width: "auto",
			height: "auto"
		}).hide();
		self.picCaptionArea.hide();
		this.preLoadImg(sourceSrc, function() {
			self.popupPic.attr("src", sourceSrc);
			var picWidth = self.popupPic.width(),
				picHeight = self.popupPic.height();
			self.changePic(picWidth, picHeight);
		})
	}
	LightBox.prototype.preLoadImg = function(src, callback) {
		var img = new Image();
		if (!!window.ActiveXObject) {
			img.onreadystatechage = function() {
				if (this.readState == "complete") {
					callback();
				}
			};
		} else {
			img.onload = function() {
				callback();
			}
		}
		img.src = src;
	}
	LightBox.prototype.changePic = function(picWidth, picHeight) {
		var self = this;
		var winWidth = $(window).width() / 100,
			winHeight = $(window).height() / 100;
		var _maxWH = self.settings.maxWH;

		//如果图片宽高大于浏览器视口，看下是否溢出
		var scale = Math.min(winWidth * _maxWH / (picWidth + 10), winHeight * _maxWH / (picHeight + 10), 1);
		picWidth = picWidth * scale;
		picHeight = picHeight * scale;

		this.picViewArea.animate({
			width: picWidth - 10,
			height: picHeight - 10
		}, self.settings.speed);
		this.popupWin.animate({
			width: picWidth,
			height: picHeight,
			marginLeft: -(picWidth / 2),
			top: (winHeight * 100 - picHeight) / 2
		}, self.settings.speed, function() {
			self.popupPic.css({
				width: picWidth - 10,
				height: picHeight - 10
			}).fadeIn();
			self.picCaptionArea.fadeIn();
			self.flag = true;
			self.clear = true;
		});
		//设置描述文字和当前索引
		this.captionText.text(this.groupData[this.index].caption);
		this.currentIndex.text("当前索引：" + (this.index + 1) + "of " + this.groupData.length);
	}
	LightBox.prototype.goto = function(dir) {
		if (dir === "next") {
			this.index++;
			if (this.index >= this.groupData.length - 1) {
				this.nextBtn.addClass("disabled").removeClass("lightbox-next-btn-show");
			}
			if (this.index != 0) {
				this.prevBtn.removeClass("disabled");
			}
			var src = this.groupData[this.index].sec;
			this.loadPicSize(src);

		} else if (dir === "prev") {
			this.index--;
			if (this.index <= 0) {
				this.prevBtn.addClass("disabled").removeClass("lightbox-prev-btn-show");
			}
			if (this.index != this.groupData.length - 1) {
				this.nextBtn.removeClass("disabled");
			}
			var src = this.groupData[this.index].sec;
			this.loadPicSize(src);
		}
	}


	window['LightBox'] = LightBox;
})(jQuery)