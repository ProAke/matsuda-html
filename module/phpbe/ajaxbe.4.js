 /*
ajax be version 4.11
By xbeginner01  (b_beginner@hotmail.com )
Requirement  prototype.js ,scriptaculous.effects ,php
Last update 2015-06-27
*/

// fixed show() -> display:block

Element.addMethods({show:function(e){e=$(e);e.style.display='block';return e;}});

var ajaxbevalue= null;
function ajaxbe(base,options){
	this.initialize(base,options);
}
ajaxbe.prototype=  {
	check:{},
	bak:[],
	initialize:function(base,options){
		
		if( typeof(options )!="object" ) options={};
		if(!this.isExist(base)){return false;}else{options.base=base}
		
		this.set(options);
		if( this.isExist($(this.options.form_id)) ){
			this.options.iframe =this.options.form_id+'_iframe';
			if(!this.isExist($(this.options.form_id+'_already'))){
				this.createElement({element:'div',id:this.options.form_id+'_warning',object:this.options.form_id,className:'ajaxbe_warning'});
				this.createElement({element:'input',id:this.options.form_id+'_already',value:'1',object:this.options.form_id});
				
				this.createElement({element:'input',name:'ajaxbe_isjson',value:this.b2n(this.options.json),object:this.options.form_id});
				this.options.parameters.ajaxbe_isjson=this.b2n(this.options.json);
				if(!this.options.json){
					this.createElement({element:'input',name:'ajaxbe_split',value:this.options.split,object:this.options.form_id});
					this.options.parameters.ajaxbe_split=this.options.split;
				}
				if(this.isExist(options.action)){this.options.action=options.action;}else{this.options.action =$(this.options.form_id).readAttribute('action');}

				this.createElement({element:'input',name:'ajaxbe_action',id:this.options.form_id+'_action',value:this.options.action,object:this.options.form_id});
				this.options.parameters.ajaxbe_action=this.options.action;
			
				if(this.options.type=='file'){
					if(!this.isExist($(this.options.form_id).readAttribute('enctype')) || $(this.options.form_id).readAttribute('enctype')!='multipart/form-data'){$(this.options.form_id).setAttribute('enctype','multipart/form-data');}
					
					this.createElement({element:'input',name:'ajaxbe_type',value:'file',object:this.options.form_id});
					this.createElement({element:'iframe',name:this.options.iframe,id:this.options.iframe,object:this.options.form_id});
					$(this.options.form_id).setAttribute('target',this.options.iframe);
				}
			}
			if(this.options.type=='file' && this.options.backup){
				var str='';
				var i=0;
				$$('#'+this.options.form_id+' input[type="file"]').each(function(e){
					if(i>0) str+='&';
					str+=e.getAttribute('name')+'='+encodeURIComponent(e.value);
					i++;
				},str);
				var obj=str.toQueryParams();
				var h=new Hash(this.options.parameters);
				var h2 = h.merge(obj);
				this.options.parameters =h2.toObject();
			}
		}
		ajaxbevalue =this.options;
	},
	b2n:function(t){
		if(t){ return '1';}else{ return '0'; }
	},
	createElement:function(obj){
		var p =document.createElement(obj.element);
		if(this.isExist(obj.name)){ p.setAttribute("name",obj.name); }
		if(this.isExist(obj.value)){ p.value=obj.value; }
		if(this.isExist(obj.id)){p.setAttribute("id",obj.id);}
		if(this.isExist(obj.className)){p.addClassName(obj.className)}
		$(obj.object).insert({top:p});
		if(this.options.status==''){
			p.hide();
		}
	},
	set:function(options){
		if( this.isExist(options.parameters)  && typeof(options.parameters )!="object" ){options.parameters=options.parameters.toQueryParams();}
		this.options = {
			base:'',text:'',iframe:'',action:'',parameters:{},loading:null,loaded:null,F:null,T:null,
			method:"post",form_id:"frm_check",error_id:'msg_error',success_id:'msg_success',load_id:'phpbeload',error_class:'msg_error',error_type:'all',heighlight:false,heighlight_class:['hl-1','hl-2'],backup:true,error_prefix:'',warning_text:'ข้อมูลยังไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งครับ',status:'',split:'|',json:true
		}
		Object.extend(this.options, options || {});
		if(!this.isExist(options.error_prefix)){this.options.error_prefix=this.options.form_id+'_';}
	},
	isExist:function(obj){
		if(typeof(obj) =='undefined' || obj==null){return false;}else{return true;}
	},
	setBak:function(obj){
		var s =obj.code.split(/-/);
		this.bak[s[0]]=[];
		this.bak[s[0]][0]=obj;
	},
	addCont:function(s,s2,t){
		
		if(!this.isExist(this.check[this.options.form_id][s.name[0]][s2])){
			this.check[this.options.form_id][s.name[0]][s2]=s;
			if(t==1){
				this.check[this.options.form_id][s.name[0]][s2].cont=s.cont;	
			}else{
				this.check[this.options.form_id][s.name[0]][s2].cont[0]=s.cont[0];	
			}
			
		}else{
			var obj=this.check[this.options.form_id][s.name[0]][s2];
			var chk=false;
			if(t==1){
				for(var i=0;i<s.cont.length;i++){
					this.check[this.options.form_id][s.name[0]][s2].cont[obj.cont.length]=s.cont[i];
				}
			}else{
				for(var i=0;i<obj.cont.length;i++){
					if(obj.cont[i]==s.cont[0]){chk=true;break;}
				}
				if(!chk){
					this.check[this.options.form_id][s.name[0]][s2].cont[obj.cont.length]=s.cont[0];
				}
			}
		}
	},
	addCheck:function(t){
		var obj =this.check[this.options.form_id];
		if(!this.isExist(obj)){
			this.check[this.options.form_id]={};
		}
		
		for(var i=0;i<t.length;i++){
			if(this.isExist(t[i][0])){
				if(t[i][0].name[0]!='secure'){
					if(!this.isExist(this.check[this.options.form_id][t[i][0].name[0]])){
						this.check[this.options.form_id][t[i][0].name[0]]=[];
					}
					var a= t[i][0].code.split(/-/);
					if(t[i][0].state=='match' ){
						this.addCont(t[i][0],a[1],0);
					}else if(t[i][0].state=='exist' ){
						this.addCont(t[i][0],a[1],1);
					}else if(t[i][0].state=='file_size'  || t[i][0].state=='file_width_height'   ){
						var c=[]
						for(var j=0;j <t[i][0].name.length;j++){
							c[j]=this.options.parameters[t[i][0].name[i]];
						}
						t[i][0].cont=c;
						this.addCont(t[i][0],a[1],0);
					}else{
						this.check[this.options.form_id][t[i][0].name[0]][a[1]]=t[i][0];
					}
				}
			}
		}
	},
	condition:function(){
		var c=this.check[this.options.form_id];
		if(this.isExist(c)){
			this.bak=[];
			for(var n in c){
				for(i=0;i<c[n].length;i++){
					if(this.isExist(c[n][i])){
						if(checkbe.set(c[n][i],this.options.parameters,this.options.form_id)){this.setBak(c[n][i]);break;} 
					}
				}
			}
		}
	},
	heighlight:function(d){
		if(this.options.isHeighlight){
			if(this.isExist(d)){
				var d2=d.up('.'+this.options.heighlight_class[0]);
				if(this.isExist(d2)){
					d2.addClassName(this.options.heighlight_class[1]);
				}
			}else{
				var _h= this.options.heighlight_class;
				$$('#'+this.options.form_id+' .'+this.options.heighlight_class[1]).each(function(e){
					e.removeClassName(_h[1]);
					e.addClassName(_h[0]);
				});
			
			}
		}
	},
	request:function(){
		if(this.options.loading == null){this.loading();}else{this.options.loading();}
		this.heighlight();
		if(this.options.backup && this.options.json){this.condition();}
		
		if(this.bak.length<1){	
			if(this.options.type=='file'){
				el=$(this.options.form_id);
				el.setAttribute("action",this.options.base);
				el.submit();
				setTimeout(function(){el.setAttribute("action",this.options.action);}.bind(this),100);
			}else{
				new  Ajax.Request( this.options.base,{
					method:this.options.method,
					parameters:this.options.parameters,
					onSuccess:function(t){
						
						if(this.options.loaded == null){this.loaded();}else{this.options.loaded();}
						this.options.text=t.responseText;
						
						if(this.options.success == null){this.success();}else{this.options.success();}
					}.bind(this)
				});	
			}
		}else{
			setTimeout(function(){
				if(this.options.loaded == null){this.loaded();}else{this.options.loaded();}
				if(this.options.F == null){this.F();}else{this.options.F();}
			}.bind(this),200);
		}
	},
	loading:function(){
		if(this.options.error_type=='one'){
			$$('#'+this.options.form_id+' .'+this.options.error_class ).each(function(t){t.innerHTML='';t.hide();});
		}else{
			if(this.isExist($(this.options.error_id))){$(this.options.error_id).innerHTML='';$(this.options.error_id).hide();}
		}
		if(this.isExist($(this.options.form_id+'_warning'))){$(this.options.form_id+'_warning').hide();}
		if(this.isExist($(this.options.success_id))){$(this.options.success_id).hide();}
		if(this.isExist($(this.options.load_id))){$(this.options.load_id).show();}
	},
	loaded:function(){
		if(this.isExist($(this.options.load_id))){$(this.options.load_id).hide();}
		if(this.isExist($(this.options.form_id+'_warning'))){$(this.options.form_id+'_warning').hide();}
	},
	success:function(){	
		setTimeout(function(){
			var arr=this.options.text.split("|");
			if(arr[0].replace(/\s+/,'')!="success"){		
				if(this.options.F == null){this.F();}else{this.options.F();}
			}else{
				this.options.text='';
				if(this.isExist(arr[1]) && arr[1]!="" ){this.options.action=arr[1];}
				if(this.isExist(arr[2]) ){this.options.text=arr[2];}	
				if(this.options.T == null){this.T();}else{this.options.T();}
			}
		}.bind(this),200);
	},
	set_text:function(){
		var t=[];
		if(this.options.json){
			if(this.bak.length>0){
				t =this.bak;
				try{
					$(this.options.form_id+'_warning').innerHTML=this.options.warning_text;
					$(this.options.form_id+'_warning').show();
				}catch(e){}
			}else{
				try{
					t=this.options.text.evalJSON();
					if(this.options.backup){this.addCheck(t);}
				}catch(e){
					t=this.options.text;
					
				}
			}
		}else{
			
			var arr =this.options.text.split(this.options.split);
			for(var i=0;i<arr.length;i++){
				t[i]=[];
				t[i][0]={name:[],msg:arr[i]};
				t[i][0].name[0]=i;
			
			}
			
		
		}
		return t;
	},
	F:function(){
		var t=[];
		var scrollID=this.options.form_id+'_warning';
		t=this.set_text();
		if(this.options.error_type=='all' && this.isExist($(this.options.error_id))){
			
			if(this.isExist($(this.options.error_id))){$(this.options.error_id).show();}
			if( typeof(t)=='object' ){
				
				for(var i=0;i<t.length;i++){
					if(this.isExist(t[i]) && this.isExist(t[i][0])){
						$(this.options.error_id).innerHTML+="<div class='msg_error_inner'><span>*</span>"+t[i][0].msg+"</div>";
					}
				}
			}else{$(this.options.error_id).innerHTML=t;}
			$(this.options.error_id).show();
			if(this.bak.length<1){scrollID=this.options.error_id;}
			this.scroll(scrollID);
			
		}else if(this.options.error_type =='one'){

			if( typeof(t)=='object' ){
				var id='';

				$$('#'+this.options.form_id+' .'+this.options.error_class ).each(function(t){t.innerHTML='';t.hide();});
				for(var i=0;i<t.length;i++){
					if(this.isExist(t[i]) && this.isExist(t[i][0])){
						var d =$(this.options.error_prefix+t[i][0].name[0]);
						if(this.isExist(d)){
							d.innerHTML+="<div class='msg_error_inner'><span>*</span>"+t[i][0].msg+"</div>";
							d.show();
							this.heighlight(d);
							if(id==''){id=d;}
						}	
					}
				}
		
				if(this.bak.length<1){scrollID=id;}
				if(id!=''){this.scroll(scrollID);}
			}else{$(this.options.error_id).innerHTML=t;}
		}else{
			var txt='';
			if( typeof(t)=='object' ){
				
				for(var i=0;i<t.length;i++){
					if(this.isExist(t[i]) && this.isExist(t[i][0])){
						txt+=""+t[i][0].msg+"\n";
					}
				}
			}else{txt=t;}
			alert(txt);
		}
	},
	get_error:function(){
		var txt='';
		var t=[];
		t=this.set_text();
		if( typeof(t)=='object' ){
				
				for(var i=0;i<t.length;i++){
					if(this.isExist(t[i]) && this.isExist(t[i][0])){
						txt+=""+t[i][0].msg+"\n";
					}
				}
		}else{txt=t;}
		return txt;
	},
	scroll:function(id){

		Effect.ScrollTo(id, { duration:'0.2', offset:-20} );
	},
	show:function(id){
		$(id).setStyle({'display':'block'});
	},
	T:function(){

		if(this.options.text.replace(/^#|\s+|\s+$/g,'')!=""){
			if(this.options.error_type=='all' ){
				if(this.isExist($(this.options.error_id))){
					$(this.options.error_id).innerHTML='';
					$(this.options.error_id).hide();
				}
			}else{
				$$('#'+this.options.form_id+' .'+this.options.error_class ).each(function(t){t.innerHTML='';t.hide();});
			}
			if(this.isExist($(this.options.success_id))){
				$(this.options.success_id).innerHTML='✓'+this.options.text;
				$(this.options.success_id).show();
				this.scroll(this.options.success_id);
				
			}else{
				alert(this.options.text);
			}
		}else{
			if( this.isExist($(this.options.form_id)) ){$( this.options.form_id ).removeAttribute('target');}
			window.location.href=this.options.action ;
		}
	}

};
var checkbe={
	form_id:null,
	param:null,
	obj:null,
	set:function(obj,param,form_id){
		this.form_id=form_id;
		this.obj =obj;
		this.param=param;
	
		if(obj.state =='empty'){
			if(this.empty()){return true;}
		}else if(obj.state=='min_char'){
			if(this.min_char()){return true;}
		}else if(obj.state=='max_char'){
			if(this.max_char()){return true;}
		}else if(obj.state=='regular'){
			if(this.regular()){return true;}
		}else if(obj.state=='compare' ){
			if(this.compare()){return true;}
		}else if(obj.state=='condition' ){
			if(this.condition()){return true;}
		}else if(obj.state=='exist'){
			if(this.exist()){return true;}
		}else if(obj.state=='match'  || obj.state =='file_width_height'){
			if(this.match()){return true;}
		}else if(obj.state =='file_empty'){
			if(this.empty()){return true;}
		}else if(obj.state =='file_size'){
			if(this.file_size()){return true;}
		}else if(obj.state =='file_type'){
			if(this.file_type()){return true;}
		}else if(obj.state =='max_count'){
			if(this.count(1)){return true;}
		}else if(obj.state =='min_count'){
			if(this.count(0)){return true;}
		}
	},
	val:function(j){
		return this.param[this.obj.name[j]];
	},
	invert:function(error){
		if(this.obj.invert=='1'){error=!error;}
		if(error){return true;}
	},
	empty:function(){	
		var f=false;
		
		for(var j=0; j<this.obj.name.length ;j++){
			if(this.invert( this.val(j)=='' || this.val(j)=='0' )){
				f=true;break;
			}
		}
		if(f){return true;}
	},
	min_char:function(){
		var f=false;
		for(var j=0; j<this.obj.name.length ;j++){
			if(this.invert(this.val(j).length <parseInt(this.obj.cont) )){
				f=true;break;
			}
		}
		if(f){return true;}
	},
	max_char:function(){
		var f=false;
		for(var j=0; j<this.obj.name.length ;j++){
			if(this.invert(this.invert(this.val(j).length >parseInt(this.obj.cont) ))){
				f=true;break;
			}
		}
		if(f){return true;}
	},
	compare:function(){
		if(this.condition()){return true}
	},
	condition:function(){
		var s=this.decodeHTML(this.obj.cont);
		for(var j=0; j<this.obj.name.length ;j++){
			var r = new RegExp("#"+(j+1), "g");
			s=s.replace(r,this.encodeHTML(this.val(j)));
		}
		var f=eval(s);
		if(this.invert(f)){return true;}
	},
	count:function(n){
		var cont =this.decodeHTML(this.obj.cont[0]);
		var f=false;
		for(var j=0; j<this.obj.name.length ;j++){
			var count=0;
			var  name=(this.obj.name[j].replace(/(.*)\[.*\]/,'$1'));
			$$('#'+this.form_id+' [name^="'+name+'\["]').each(function(e){
				var v=false;
				var t=e.getAttribute('type');
				if(t=='checkbox'){v=e.checked ;}else{v=true;}
				if(v){if(eval(cont.replace(/##/,e.value))) count++;}
			},count);
			if(n==1){
				if( this.invert(count>parseInt(this.obj.cont[1]))){
					f=true;break;
				}
			}else{
				if( this.invert(count<parseInt(this.obj.cont[1]))){
					f=true;break;
				}
			}
		}
		if(f){return true;}
	},
	regular:function(){
		var cont =this.decodeHTML(this.obj.cont);
		var m=cont.replace(/(.*)\/([im]{0,2})/,'$2'); 
		var p=cont.replace(/\/(.*)\/[im]{0,2}/,'$1');
		var r = new RegExp(p,m);
		var f=false;
		for(var j=0; j<this.obj.name.length ;j++){
			if(this.invert(this.val(j).match(r))){
				f=true;break;
			}
		}
		if(f){return true;}
	},
	exist:function(){
		var f=false;
		var len =this.obj.cont.length;
		var len2=this.obj.name.length;
		var k=0;

		while(k<len){

			if(len2<2){
				f= this.obj.cont[k]==this.encodeHTML(this.val(0));
				k++;
			}else{
				f=true;
				for(var j=0; j<len2;j++){
					f=f && this.obj.cont[k]==this.encodeHTML(this.val(j));
					k++;
				}
			}
			if(f) break;
		}
		if(f){return true;}	
	},
	match:function(){
		var f=false;
		for(var j=0; j<this.obj.name.length ;j++){
			for(var k=0;k<this.obj.cont.length;k++){
				if( this.invert(this.obj.cont[k]==this.encodeHTML(this.val(j)))){
					f=true;break;
				}
				if(f){break;}
			}
		}
	
		if(f){return true;}	
	},
	file_size:function(){
		var f=false;
		for(var k=0;k<this.obj.cont.length;k++){
			for(var j=0; j<this.obj.name.length ;j++){
				var  v=this.val(j);
				if(v!=''){
					if(this.invert(this.obj.cont[k]==this.encodeHTML(v))){
						f=true;break;
					}
				}
			}
			if(f){break;}
		}
		if(f){return true;}	
	},
	file_type:function(){
		var f=false;
		var r = new RegExp('^.*('+this.obj.cont+')$','i');
		for(var j=0; j<this.obj.name.length ;j++){
		
			if(this.invert(this.val(j).match(r))){
				f=true;break;
			}
		}
		if(f){return true;}
	},
	decodeHTML:function(s){
		var pattern =[ /\&#91;/g,/&#93;/g ,/&#92;/g,/&quot;/g,/\&amp;/g,/&#39;/g];
		var str =['[',']','\\','"','&',"'"];
		for(var i=0;i<pattern.length;i++){
			s= s.replace(pattern[i],str[i]);
		}
		return s;
	},
	encodeHTML:function(s){
		if(typeof(s) =='undefined' || s==null){s='';}
		s=s.replace(/^\s+|\n|\r|\s+$/m,'');
		var pattern =[/&/g,/\[/g,/\]/g,/\//g,/"/g,/'/g];
		var str =['&amp;','&#91;','&#93;','&#92;','&quot;','&#39;'];
		for(var i=0;i<pattern.length;i++){
			s= s.replace(pattern[i],str[i]);
		}
		return s;
	}
}