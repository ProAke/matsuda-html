function text_number(e)
{
	var keynum
	var keychar
	var numcheck

	if(window.event) // IE
	{
	keynum = e.keyCode
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
	keynum = e.which
	}
	
	if(keynum== 8 || keynum==43 || keynum== 45 || keynum== 46 || keynum== 9 ) return String.fromCharCode(keynum);
	
	keychar = String.fromCharCode(keynum)
	numcheck = /\d/
	return numcheck.test(keychar)
}

function fnc_choose(elm,clss){
	var p="."+clss;
	$$(p).each(function(t){
		t.checked=elm.checked ;
	});
}

var menu_hover  = Class.create();
menu_hover.prototype = {
	initialize: function(el, options) {
		this.el =el;// $(el);
			this.setOptions(options);
		
		//alert(el.getStyle("background") );
		this.showEvent = this.show.bindAsEventListener(this);
		this.hideEvent = this.hide.bindAsEventListener(this);

		Event.observe(this.el, "mouseover", this.showEvent );
		Event.observe(this.el, "mouseout", this.hideEvent );
		
	
	},
	setOptions:function(options){
		this.options={
			hover:'#FFFFCC',
			init:'#FFFFFF'
		};
		Object.extend(this.options, options || {});
	},
	show: function(e) {
		this.el.setStyle({"backgroundColor":this.options.hover});
	},
	hide: function(e) {
		this.el.setStyle({"backgroundColor":this.options.init});
	}
}

var  dd_text=Class.create();
dd_text.prototype = {
	initialize: function(el) {
		this.status=false;
		var n= $(el).children;
		
		for(var i=0;i<n.length; i++){
			if(typeof(n[i].tagName) != "undefined" ){
				tag= n[i].tagName.toLowerCase();
				if(tag=='input'){
					this.input =n[i];
					this.listEvent = this.list.bindAsEventListener(this);
					Event.observe(this.input, "click", this.listEvent );
				}
				if(tag=='ul'){
					this.ul=n[i];
					var n2= n[i].children;
					
					for(var j=0;j<n2.length; j++){
						tag2= n2[i].tagName.toLowerCase();
						if(tag2=='li'){
						
							this.checkEvent = this.check.bindAsEventListener(this);
							Event.observe(n2[j], "click", this.checkEvent );
							new menu_hover(n2[j],{hover:"#A9CDFA"});
						}
						
					}
					
				}
			}
		}
		

	},
	list:function(){
		if(this.status){
			this.hide();
		}else{
			this.show();
		}
		this.status=!this.status;
	},
	check:function(e){
		var el =e.element(0)
		
		this.input.value=el.innerHTML;
		
		this.hide();
		this.status=false;
	},
	show:function(){
		this.ul.setStyle({"display":"block"});
	},
	hide:function(){
		this.ul.setStyle({"display":"none"});
	}
	
}
var  bb_thickbox=Class.create( {
	initialize: function(options) {
		this.setOptions(options);
	
		var body =document.getElementsByTagName('body')[0]
		var inner_width=this.options.width;
		var inner_height=this.options.height;
		var inner_curve_width=inner_width-36;
		var inner_curve_height=inner_height-36;
		if( $("bb_thickbox_container") == null ){
			var div =document.createElement("div");
			div.setAttribute("id","bb_thickbox_container");
			var div2 =document.createElement("div");
			div2.setAttribute("id","bb_thickbox_bg");
			div.appendChild(div2);
			var div2 =document.createElement("div");
			div2.setAttribute("id","bb_thickbox_inner");
			
			div2.innerHTML="<div class='div_curve'>"
								+"	 <div class='inner_curve'>"
								+"		<div class='tc1'></div><div class='tc2' style='width:"+inner_curve_width+"px'></div><div class='tc3'></div>"
								+"	 </div>"
								+"	 <div class='inner_curve'>"
								+"		<div class='tc4 '>"
								+"			<div class='tc6'>"
								+"				<div class='tc5 '  style='width:"+inner_curve_width+"px;height:"+inner_curve_height+"px' id='thickbox_containner'>"
								+"					<div class='floatRight'><a href=\"javascript:void(0)\" class='xclose'>"+this.options.txt_close+"</a></div>"
								+"					<div id='thickbox_inner_text' class='thickbox_inner_text'></div>"
								+"				</div>"
								+"			</div>"
								+"		</div>"
								+"	 </div>"
								+"	 <div class='inner_curve'>"
								+"		<div class='tc7'></div><div class='tc8'  style='width:"+inner_curve_width+"px'></div><div class='tc9'></div>"
								+"	 </div>"
								+"	 <div class='clear'></div>"
								+"</div>";

			div.appendChild(div2);

			body.appendChild(div);


			

		}
		$$(".xclose").each(function(t){
					t.observe("click",function(){
						this.hide();	
					}.bind(this));

				}.bind(this));
		$('bb_thickbox_container').show()

		var viewport = document.viewport.getDimensions(); // Gets the viewport as an object literal
		var width = viewport.width; // Usable window width
		var height = viewport.height; // Usable window height
	
		$('bb_thickbox_bg').setStyle({
			"height":body.offsetHeight+"px",
			"width":screen.width+"px"	
		});
		
	
		$("thickbox_containner").setStyle({
			height:inner_curve_height+"px"
		});
		if(height>inner_width){
			inner_top=(height-inner_height)/2+	document.viewport.getScrollOffsets().top;
			
		}else{
			inner_top=document.viewport.getScrollOffsets().top;
		}
		
		inner_left=(width-inner_width)/2 ;
		

		$('bb_thickbox_inner').setStyle({
		
			"width":inner_width+"px",
			"top":inner_top+"px",
			"left":inner_left+"px",
			"display":"none"
		});
		
		Effect.SlideDown('bb_thickbox_inner',{duration:0.5,afterFinish:function(){
			
			//Effect.ScrollTo('bb_thickbox_inner', { duration:'0.2', offset:-150});
		}});
	},
	setOptions:function(options){
		this.options={width:300,height:300,
		inner_top:0,
		txt_close:'Close'}
		Object.extend(this.options, options || {});
		
	},
	hide:function(){
		$('bb_thickbox_container').hide()
	},
	hasData:function(t){
		if($("thickbox_inner_text").innerHTML!=""){
			return true;
		}else{
			return false;
		}
	},
	text:function(t){
		$("thickbox_inner_text").innerHTML=t;
	},
	setHeight:function(h){
		//$('thickbox_containner').setStyle({height:h+'px'});
		$$(".thickbox_inner_text").each(function(t){
	
			$('thickbox_containner').setStyle({height:(t.getHeight()+50)+'px'});
		
	
		}.bind(this))
	}
	
});

var myimages={
	box:function(){
		Effect.ScrollTo('tinymceeditor', { duration:'0.2', offset:-150,afterFinish:function(){
			var thickbox=new bb_thickbox({
				width:400,
				height:350
			});
			new Ajax.Updater('thickbox_inner_text',"/_ajax/myimages/ajax.images.html");
		}});
	},
	popup:function(){
		W=360;
		H=260;
		var winleft	=	(screen.width - W) / 2;
		var winup=(screen.height - H) / 2;
		winProp='width='+W+',height='+H+',left='+winleft+',top='+winup+',scrollbars='+'no'+',resizable' + ',status=no,toolbar=0,location=0,statusbar=0,menubar=0,resizable=1';
		Win=	window.open('/_ajax/myimages/upload.popup.html', 'myimages', winProp)
		if (parseInt(navigator.appVersion) >= 4) { Win.window.focus(); }
	},
	prev:function(img){
		$("myimages_img").innerHTML="<img src='"+img+"' >";
		$("myimages_url").value=img;
	},
	save:function(){
		ext='';
		if( $F('myimages_width')!='' && $F('myimages_height')!=''){
		 ext=" width='"+$F('myimages_width')+"' height='"+$F('myimages_height')+"' ";
		}
		tinyMCE.execCommand('mceInsertContent',false,"<img src='"+$F("myimages_url")+"' title=\""+$F("myimages_title")+"\" alt=\""+$F("myimages_title")+"\"  "+ext+">");
		bb_thickbox.prototype.hide();
	}
	
	
}