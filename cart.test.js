import {test} from 'node:test';
import assert from 'node:assert/strict';
import {total} from './cart.js';
test('empty cart', () => assert.equal(total([]), 0));
test('one item', () => assert.equal(total([{price:15,quantity:1}]),15));
test('quantity is included', () => assert.equal(total([{price:15,quantity:2}]),30));
test('multiple items', () => assert.equal(total([{price:10,quantity:3},{price:5,quantity:2}]),40));
