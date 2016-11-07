/*
    A DiffNotifier accepts path-like subscriptions for callbacks to be called in the
    event that a comparison has a (reference) difference.  This is only for use
    with immutable data.

    E.g.:

        const obj1 = {ships: {foo: 'bar'}}
        const obj2 = Object.assign({}, obj1, {things: 'things'})
        const obj3 = Object.assign({}, obj2, {ships: {foo: 'baz'}})

        export const notifier = (new DiffNotifier(obj1))

        notifier.subscribe('/ships/foo', ((newI, oldI) => console.log('new', newI, 'old', oldI)))

        notifier.update(obj2)  // no callback, because ships.foo hasn't changed

        notifier.update(obj3)  // callback fired!

*/

import { mergeWith, forEach, isObjectLike } from 'lodash'

import { Path, Map } from '../types'
import { parsePath } from './modash'

export type Subscription<T> = (newItem:(T | null), oldItem:(T | null)) => any

interface SubscriptionTree {
    subscriptions: Subscription<any>[]
    keys: Map<SubscriptionTree>
}

export class DiffNotifier<Item> {

    private currentItem:Item
    private subscriptionTree:SubscriptionTree

    constructor(item:Item) {
        this.currentItem = item
        this.subscriptionTree = {
            subscriptions:[],
            keys:{}
        }
    }

    subscribe<SubItem>(path:Path, callback:Subscription<SubItem>):DiffNotifier<Item> {
        //we don't really have type guarantees that S will be what we want; be careful that you subscribe to the right place.
        this.subscriptionTree = mergeSubscriptionTrees(this.subscriptionTree, singletonSubscriptionTree(parsePath(path), callback))

        return this
    }

    update(item:Item):DiffNotifier<Item> {
        const previousItem = this.currentItem
        this.currentItem = item

        notify(this.subscriptionTree, previousItem, this.currentItem)
        return this
    }
}

function singletonSubscriptionTree<T>(parsedPath:string[], callback:Subscription<T>):SubscriptionTree {
    if (parsedPath.length < 1) return {
        subscriptions: [callback],
        keys: {}
    }

    let keys = {}
    const key:string = parsedPath[0]
    const remainingKeys = parsedPath.slice(1)
    keys[key] = singletonSubscriptionTree(remainingKeys, callback)

    return {
        subscriptions: [],
        keys: keys
    }
}

function mergeSubscriptionTrees(tree1:SubscriptionTree, tree2:SubscriptionTree):SubscriptionTree {
    return {
        subscriptions: tree1.subscriptions.concat(tree2.subscriptions),
        keys: mergeWith(tree1.keys, tree2.keys, (subtree1, subtree2) => {
            if (!!subtree1 && !!subtree2) return mergeSubscriptionTrees(subtree1, subtree2)
            return subtree1 || subtree2
        })
    }
}

function notify<T>(tree:SubscriptionTree, prevItem:T, currentItem:T):void {
    if (prevItem !== currentItem) {
        tree.subscriptions.forEach((sub) => sub(currentItem, prevItem))
        forEach(tree.keys, (subTree, key) => {
            const pItem = (isObjectLike(prevItem) && key in prevItem) ? prevItem[key] : undefined
            const cItem = (isObjectLike(currentItem) && key in currentItem) ? currentItem[key] : undefined
            notify(subTree, pItem, cItem)
        })
    }
}

