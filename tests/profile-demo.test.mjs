import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {demoComments,demoLetters,demoMoments} from '../src/profile-demo.js';

test('profile demo has varied fictional comments and complete, distinct letters',()=>{
 assert.ok(demoComments.length>=8);
 assert.equal(new Set(demoComments.map(c=>c.topic)).size,demoComments.length);
 assert.ok(demoLetters.length>=4);
 assert.equal(new Set(demoLetters.map(p=>p.id)).size,demoLetters.length);
 for(const letter of demoLetters){assert.equal(letter.type,'letter');assert.equal(letter.author,'漂流中的你');assert.ok(letter.body.length>90);assert.deepEqual(letter.replies,[]);}
});
