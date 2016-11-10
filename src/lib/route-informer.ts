//TODO: consider combining with the json-resource-getter

import * as express from 'express'
import { isObjectLike, has } from 'lodash'
import { Schema } from 'jsonschema'

import { parsePath } from './modash'

export class RouteInformer<T> {

    constructor(
        private currentItem:T,
        private schema:Schema
    ) {
        this.middleware = this.middleware.bind(this)
        this.update = this.update.bind(this)
    }

    update(item:T) {
        this.currentItem = item
    }

    middleware():express.RequestHandler {
        return (req:express.Request, res:express.Response, next:express.NextFunction) => {
            if (!has(req.query, 'info')) return next()
            const pathParts = parsePath(req.path)
            let remainingTree = this.currentItem
            let remainingSchema = this.schema

            for (let i = 0; i < pathParts.length; i++) {
                const pathPart = pathParts[i]
                remainingTree = treeFromKey(remainingTree, pathPart)
                remainingSchema = schemaFromKey(remainingSchema, pathPart)
                if (remainingTree === undefined || remainingSchema === undefined) return res.sendStatus(404)
            }

            return (res as any).send({
                schema: remainingSchema
            })  //TODO: fix typing
        }
    }
}

function treeFromKey(tree:any, key:string):any {
    if (!isObjectLike(tree)) return undefined
    return tree[key]
}

function schemaFromKey(s:Schema, key:string ):Schema {
    if (s.type === 'object') {
        if (!!s.properties && s.properties[key]) return s.properties[key]
        if (!!s.additionalProperties) return s.additionalProperties
    }
    if (s.type === 'array') {
        if (!!s.items) return s.items  // TODO: do this one better; check that key is of right format
    }
    throw new Error('Could\'t find schema for key '+ key)
}
