// The exposed fingertips are a handle: movement follows the pointer one-to-one.
export function installEdgeReturns(buttons,onComplete){
 for(const button of buttons){
  let drag=null,suppressClick=false,timer=null;
  const reset=()=>{button.classList.remove('is-dragging');button.style.setProperty('--pull','0px');};
  button.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   event.stopPropagation();
   if(timer)clearTimeout(timer);
   suppressClick=false;
   const reveal=Math.min(120,Math.max(70,innerWidth*.11));
   drag={id:event.pointerId,x:event.clientX,pull:0,moved:false,max:Math.max(1,button.getBoundingClientRect().width-reveal),right:button.classList.contains('right-edge')};
   button.classList.add('is-dragging');
   button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   event.stopPropagation();
   const delta=(event.clientX-drag.x)*(drag.right?-1:1);
   drag.pull=Math.min(drag.max,Math.max(0,delta));
   if(Math.abs(event.clientX-drag.x)>8)drag.moved=true;
   button.style.setProperty('--pull',`${drag.pull}px`);
  });
  button.addEventListener('pointerup',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   event.stopPropagation();
   const complete=drag.moved&&drag.pull>=drag.max*.9;
   if(drag.moved){suppressClick=true;timer=setTimeout(()=>{suppressClick=false;},500);}
   drag=null;
   if(complete)onComplete();
   reset();
  });
  button.addEventListener('pointercancel',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   event.stopPropagation();drag=null;reset();
  });
  button.addEventListener('click',event=>{
   if(suppressClick&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick=false;}
  });
 }
}
