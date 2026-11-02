import test from 'node:test';
import assert from 'node:assert/strict';
import {installEdgeReturns} from '../src/edge-return.js';

test('both hands track the pointer and return only after being pulled out',()=>{
 globalThis.innerWidth=1000;
 for(const right of [false,true]){
  const handlers={},classes=new Set(right?['right-edge']:[]),style={};let completed=0;
  const button={addEventListener:(name,fn)=>handlers[name]=fn,setPointerCapture(){},getBoundingClientRect:()=>({width:500}),
   classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)},style:{setProperty:(k,v)=>style[k]=v}};
  installEdgeReturns([button],()=>completed++);
  const event=(x)=>({button:0,pointerId:1,clientX:x,stopPropagation(){}});
  const direction=right?-1:1;
  handlers.pointerdown(event(500));handlers.pointermove(event(500+direction*100));
  assert.equal(style['--pull'],'100px');assert.ok(classes.has('is-dragging'));
  handlers.pointerup(event(500+direction*100));assert.equal(completed,0);assert.equal(style['--pull'],'0px');
  handlers.pointerdown(event(500));handlers.pointermove(event(500-direction*200));assert.equal(style['--pull'],'0px');handlers.pointerup(event(500-direction*200));assert.equal(completed,0);
  handlers.pointerdown(event(500));handlers.pointermove(event(500+direction*400));handlers.pointerup(event(500+direction*400));assert.equal(completed,1);
  handlers.pointerdown(event(500));handlers.pointermove(event(500+direction*250));handlers.pointercancel(event(500+direction*250));assert.equal(completed,1);assert.equal(style['--pull'],'0px');
 }
});
