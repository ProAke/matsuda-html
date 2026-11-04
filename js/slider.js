var number_stack={};
var mg_slider = Class.create({
				initialize:function(base,options){
					this.base=base;
					this.setOptions(options);
					var _this=this;
					var length=0;
			
					number_stack[this.base]=Math.floor((Math.random() * 10000) );
					this.options.stack=number_stack[this.base];
					$$('#'+this.base+' .gs-prev').each(function(t){
						$(t).setStyle({top:(_this.options.height/2-27)+'px'});
					});
					$$('#'+this.base+' .gs-next').each(function(t){
						$(t).setStyle({top:(_this.options.height/2-27)+'px'});
					});
					$$('#'+this.base+' .div_gallery').each(function(t){
						$(t).setStyle({display:'block',visibility:'visible'});
					});
					$$('#'+this.base+' .div_gallery_inner').each(function(t){
						$(t).setStyle({'left':0,'top':0,display:'block',visibility:'visible'});
					});
					$$('#'+this.base+' .div_gallery_inner .item-list').each(function(t){
						length++;
						$(t).setStyle({'width':_this.options.width+'px','height':_this.options.height+'px','padding':_this.options.padding+'px','margin':_this.options.margin+'px','border-width':_this.options.border+'px'});
					},length);
					this.options.width=this.options.width+this.options.padding*2+this.options.border*2+this.options.margin*2;
					this.options.height=this.options.height+this.options.padding*2+this.options.border*2+this.options.margin*2;
					
					$$('#'+this.base+' .div_gallery_inner').each(function(t){
						$(t).setStyle({'width':(length*_this.options.width)+'px'});
					});

					$(this.base).setStyle({'width':(this.options.size*this.options.width)+'px'});

					//var content =$(this.base).select('div.bb_content');
					this.options.num=Math.ceil(length/this.options.size);
					if(this.options.num>0){
				
						this.timeout =window.setTimeout(this.after.bind(this),this.options.before_delay);
					}
					//this.options.sec.length=length;
				},
				setOptions:function(options){
					this.options = {
						width:100,
						height:100,
						padding:0,
						margin:2,
						border:1,
						size:1,
						num:0,
						start:0,
						delay:5000,
						before_delay:0,
						stack:0,
						moved:true,
						axis:'x'
					};
					Object.extend(this.options, options || {});
					//this.options.width=this.options.width+this.options.padding*2;
					//this.options.height=this.options.height+this.options.padding*2;
					
				},
				next:function(){
					var no=this.options.start+1;
					if(no>=this.options.num) no= no%-this.options.num;
				
					this.set(no);	
				},
				prev:function(){
					var no=this.options.start-1;
					if(no<0) no=this.options.num-1;

					this.set(no);	
				},
				number:function(no){

					if(no>this.options.num){
						no= no%-this.options.num;
					}else if(no<0){
						no=this.options.num-1;
					}else{
						--no;
					}		
					this.set(no);	

				},
				set:function(no){
					
					if(this.options.moved && this.options.num>0 ){
						this._clearTimeout();
						var move=0;
						move= no-this.options.start;
						this.options.start=no;
						var multi=0;
						if(this.options.axis=='y'){
							multi=this.options.height;
						}else{
							multi=this.options.width*this.options.size;
						}
						
						this.slide(-move*multi);
					}
				},
				slide:function(move){
					var inner =$(this.base).select('div.div_gallery_inner')[0];
					
					this.options.moved=false;
					if(this.options.axis=='y'){
						x=0;
						y=move;
					}else{
						x=move;
						y=0;
					}
					
					if(number_stack[this.base]==this.options.stack){
						//	$('testxx').innerHTML+='<br>'+x+','+this.options.width;
					new Effect.Move(inner, { x: x, y: y ,duration:0.5,
						afterFinish:this.after.bind(this)
					});
					}
					
				},
				after:function(){
					
					this.options.moved=true;

					this.timeout = window.setTimeout(this.next.bind(this),this.options.delay);			
				},
				_clearTimeout: function() {
					var timer=this.timeout ;
					clearTimeout(timer);
					clearInterval(timer);
					this.timeout =null;
					return null;
				}
			});
var bb_slider_zoom = Class.create({
	initialize:function(options){
		
		this.setOptions(options);
		var inner =$(this.options.id).select('div.bb_slider_inner')[0];
		
		$(this.options.id).setStyle({
			width:this.options.width+'px',
			height:this.options.height+"px",
			display:"block"
		});

		if(typeof inner!='undefined'){
			var content =inner.select('div.bb_content');
			this.options.num=content.length;
			if(this.options.axis=='y'){
				width2=this.options.width;
				height2=this.options.height*this.options.num;		
			}else{
				width2=this.options.width*this.options.num;
				height2=this.options.height;
			}

			inner.setStyle({
				left:0,top:0,
				width:width2+"px",
				height:height2+'px'
			});
		
			for(var i=0; i<content.length;i++){
				content[i].setStyle({
						width:this.options.width+'px',
						height:this.options.height+'px'
					});
			}
			
			if(this.options.num>0){
				
				this.timeout =window.setTimeout(this.after.bind(this),this.options.before_delay);
			}
		}
		
		//this.updateEvent = this.update.bindAsEventListener(this);
		
	},
	
	setOptions:function(options){
		this.options = {
			id:'bb_slider',
			width:100,
			height:100,
			num:0,
			start:0,
			delay:5000,
			before_delay:0,
			moved:true,
			axis:'x'
		};
		Object.extend(this.options, options || {});
	},
	next:function(){	
		var no=this.options.start+1;
		if(no>=this.options.num) no= no%-this.options.num;
		this.set(no);	
	},
	prev:function(){
		var no=this.options.start-1;
		if(no<0) no=this.options.num-1;
		this.set(no);	
	},
	number:function(no){
		if(no>this.options.num){
			no= no%-this.options.num;
		}else if(no<0){
			no=this.options.num-1;
		}else{
			--no;
		}		
		this.set(no);	

	},
	set:function(no){
		var c =$(this.options.id).select('div.bb_content');
		
		if(!c[no].innerHTML.match(/img/)){
			
			var im =(c[no].getAttribute('alt'));
			var img=document.createElement('img');
			img.src=im;
			c[no].appendChild(img);
		}
	
	
		if(this.options.moved && this.options.num>0 ){
			this._clearTimeout(this.timeout );
			var move=0;
			move= no-this.options.start;
			this.options.start=no;
			var multi=0;
			if(this.options.axis=='y'){
				multi=this.options.height;
			}else{
				multi=this.options.width;
			}
			this.slide(-move*multi);
		}
	},
	slide:function(move){
		var inner =$(this.options.id).select('div.bb_slider_inner')[0];
		this.options.moved=false;
		if(this.options.axis=='y'){
			x=0;
			y=move;
		}else{
			x=move;
			y=0;
		}
		new Effect.Move(inner, { x: x, y: y ,duration:0.5,
			afterFinish:this.after.bind(this)
		});
		
	},
	after:function(){
		this.options.moved=true;
		this.timeout = window.setTimeout(this.next.bind(this),this.options.delay);			
	},
	_clearTimeout: function(timer) {
		clearTimeout(timer);
		clearInterval(timer);
		return null;
	}
});