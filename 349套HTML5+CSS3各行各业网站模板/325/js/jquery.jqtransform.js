(function($){
	var defaultOptions={preloadImg:true};
	var jqTransformImgPreloaded=false;
	var jqTransformPreloadHoverFocusImg=function(strImgUrl){
		strImgUrl=strImgUrl.replace(/^url\((.*)\)/,'$1').replace(/^\"(.*)\"$/,'$1');
		var imgHover=new Image();
		imgHover.src=strImgUrl.replace(/\.([a-zA-Z]*)$/,'-hover.$1');
		var imgFocus=new Image();
		imgFocus.src=strImgUrl.replace(/\.([a-zA-Z]*)$/,'-focus.$1')};

	
	/***************************
	  Labels
	***************************/
	var jqTransformGetLabel=function(objfield){
		var selfForm=$(objfield.get(0).form);
		var oLabel=objfield.next();
		if(!oLabel.is('label')){
			oLabel=objfield.prev();
			if(oLabel.is('label')){
				var inputname=objfield.attr('id');
				if(inputname){
					oLabel=selfForm.find('label[for="'+inputname+'"]')} 
			}
		}
		if(oLabel.is('label')){return oLabel.css('cursor','pointer')}
		return false};
	var jqTransformHideSelect=function(oTarget){
		var ulVisible=$('.jqTransformSelectWrapper ul:visible');
		ulVisible.each(function(){
			var oSelect=$(this).parents(".jqTransformSelectWrapper:first").find("select").get(0);
			if( !(oTarget&&oSelect.oLabel&&oSelect.oLabel.get(0)== oTarget.get(0)) ){$(this).hide()}
		})};
	var jqTransformCheckExternalClick=function(event){
		if ($(event.target).parents('.jqTransformSelectWrapper').length=== 0){ jqTransformHideSelect($(event.target))}
	};
	var jqTransformAddDocumentListener=function (){
		$(document).mousedown(jqTransformCheckExternalClick)};
	var jqTransformReset=function(f){
		var sel;
		$('.jqTransformSelectWrapper select',f).each(function(){sel=(this.selectedIndex<0)?0:this.selectedIndex; $('ul',$(this).parent()).each(function(){$('a:eq('+sel+')',this).click()})});
		$('a.jqTransformCheckbox,a.jqTransformRadio',f).removeClass('jqTransformChecked');
		$('input:checkbox,input:radio',f).each(function(){if(this.checked){$('a',$(this).parent()).addClass('jqTransformChecked')}})};
	/***************************
	  Check Boxes 
	 ***************************/	
	$.fn.jqTransCheckBox=function(){
		return this.each(function(){
			if($(this).hasClass('jqTransformHidden')){return}
			var $input=$(this);
			var inputSelf=this;
			var oLabel=jqTransformGetLabel($input);
			oLabel&&oLabel.click(function(){aLink.trigger('click')});
			var aLink=$('<a href="#" class="jqTransformCheckbox"></a>');
			$input.addClass('jqTransformHidden').wrap('<span class="jqTransformCheckboxWrapper"></span>').parent().prepend(aLink);
			$input.change(function(){
				this.checked&&aLink.addClass('jqTransformChecked')||aLink.removeClass('jqTransformChecked');
				return true});
			aLink.click(function(){
				if($input.attr('disabled')){return false}
				$input.trigger('click').trigger("change");	
				return false});
			this.checked&&aLink.addClass('jqTransformChecked')})};
	/***************************
	  Radio Buttons 
	 ***************************/	
	$.fn.jqTransRadio=function(){
		return this.each(function(){
			if($(this).hasClass('jqTransformHidden')){return}
			var $input=$(this);
			var inputSelf=this;
			oLabel=jqTransformGetLabel($input);
			oLabel&&oLabel.click(function(){aLink.trigger('click')});
			var aLink=$('<a href="#" class="jqTransformRadio" rel="'+this.name+'"></a>');
			$input.addClass('jqTransformHidden').wrap('<span class="jqTransformRadioWrapper"></span>').parent().prepend(aLink);
			$input.change(function(){
				inputSelf.checked&&aLink.addClass('jqTransformChecked')||aLink.removeClass('jqTransformChecked');
				return true});
			aLink.click(function(){
				if($input.attr('disabled')){return false}
				$input.trigger('click').trigger('change');
				$('input[name="'+$input.attr('name')+'"]',inputSelf.form).not($input).each(function(){
					$(this).attr('type')=='radio'&&$(this).trigger('change')});return false});
			// set the default state
			inputSelf.checked&&aLink.addClass('jqTransformChecked')})};
	/***************************
	  Select 
	 ***************************/	
	$.fn.jqTransSelect=function(){
		return this.each(function(index){
			var $select=$(this);
			if($select.hasClass('jqTransformHidden')){return}
			if($select.attr('multiple')){return}
			var oLabel=jqTransformGetLabel($select);
			var $wrapper=$select
				.addClass('jqTransformHidden')
				.wrap('<div class="jqTransformSelectWrapper"></div>')
				.parent()
				.css({zIndex: 10-index});
			$wrapper.prepend('<div></div><a href="#" class="jqTransformSelectOpen"></a><ul></ul>');
			var $ul=$('ul',$wrapper).css('width',$select.width()).hide();
			$('option',this).each(function(i){
				var oLi=$('<li><a href="#" index="'+i+'">'+$(this).html()+'</a></li>');
				$ul.append(oLi)});
			$ul.find('a').click(function(){
					$('a.selected',$wrapper).removeClass('selected');
					$(this).addClass('selected');	
					/* Fire the onchange event */
					if ($select[0].selectedIndex != $(this).attr('index')&&$select[0].onchange){ $select[0].selectedIndex=$(this).attr('index'); $select[0].onchange()}
					$select[0].selectedIndex=$(this).attr('index');
					$('div:eq(0)',$wrapper).html($(this).html());
					$ul.hide();
					return false});
			$('a:eq('+this.selectedIndex+')',$ul).click();
			$('div:first',$wrapper).click(function(){$("a.jqTransformSelectOpen",$wrapper).trigger('click')});
			oLabel&&oLabel.click(function(){$("a.jqTransformSelectOpen",$wrapper).trigger('click')});
			this.oLabel=oLabel;
			var oLinkOpen=$('a.jqTransformSelectOpen',$wrapper)
				.click(function(){
					if( $ul.css('display')== 'none' ){jqTransformHideSelect()} 
					if($select.attr('disabled')){return false}
					$ul.slideToggle('fast',function(){					
						var offSet=($('a.selected',$ul).offset().top-$ul.offset().top);
						$ul.animate({scrollTop: offSet})});
					return false});
			var iSelectWidth=$select.outerWidth();
			var oSpan=$('div:first',$wrapper);
			var newWidth=$wrapper.width();
			$ul.css('width',newWidth);
			$ul.css({display:'block',visibility:'hidden'});
			var iSelectHeight=($('li',$ul).length)*($('li:first',$ul).height());
			(iSelectHeight<$ul.height())&&$ul.css({height:iSelectHeight,'overflow':'hidden'});
			$ul.css({display:'none',visibility:'visible',top:$wrapper.height()+2})})};
	$.fn.jqTransform=function(options){
		var opt=$.extend({},defaultOptions,options);
		 return this.each(function(){
			var selfForm=$(this);
			if(selfForm.hasClass('jqtransformdone')){return}
			selfForm.addClass('jqtransformdone');
			$('input:checkbox',this).jqTransCheckBox();
			$('input:radio',this).jqTransRadio();
			if( $('select',this).jqTransSelect().length>0 ){jqTransformAddDocumentListener()}
			selfForm.bind('reset',function(){var action=function(){jqTransformReset(this)}; window.setTimeout(action,10)})})				
	};
})(jQuery);
$(function(){
	$('.jqTransform').jqTransform({imgPath:'../images/img/'})
});