'use strict'

import { applyMiddleware, createStore } from 'redux'
import * as thunk from 'redux-thunk'

import * as diffNotifier from './lib/diff-notifier'

console.log('diffNotifier', !!diffNotifier)


const reducer = (s, action) => s
const initialState = {}

export function main():void {

    const store = createStore(reducer, initialState, applyMiddleware(thunk.default))

    store.subscribe(() => console.log(store.getState()))
}

console.log('I work!!')

main()

