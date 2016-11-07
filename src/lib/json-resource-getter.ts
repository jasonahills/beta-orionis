import * as express from 'express'
import { isObjectLike } from 'lodash'

import { parsePath } from './modash'

export class JSONResourceGetter<T> {

    private currentItem:T
    constructor(item:T) {
        this.currentItem = item

        this.middleware = this.middleware.bind(this)
        this.update = this.update.bind(this)
    }

    update(item:T) {
        this.currentItem = item
    }


    middleware():express.RequestHandler {
        return (req:express.Request, res:express.Response, next:express.NextFunction) => {
            const pathParts = parsePath(req.path)
            let remainingTree = this.currentItem

            for (let i = 0; i < pathParts.length; i++) {
                if (!isObjectLike(remainingTree)) return next()  // this middleware doesn't send 404s; we leave that to the next guy.
                const pathPart = pathParts[i]
                if (!(pathPart in remainingTree)) return next()
                remainingTree = remainingTree[pathPart]
            }

            return (res as any).send(remainingTree)  //TODO: fix typing
        }
    }
}
