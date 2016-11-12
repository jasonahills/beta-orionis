import { Validator, ValidatorResult, Schema } from 'jsonschema'
import { isString } from 'lodash'
import * as express from 'express'

import { Map } from './types'

export type ValidatorFunc = (i:any) => ValidatorResult

const v = new Validator()


export function validateCommand(commandMap:Map<Schema>):ValidatorFunc {
    return (command:any):ValidatorResult => {
        if (!command || !command.type || !isString(command.type) || !commandMap[command.type]) {
            const result = new ValidatorResult(command, {}, {}, ({} as any))
            result.addError("Command must have a valid type string.")
            return result
        }
        return v.validate(command, (commandMap[command.type] as Schema))
    }
}

export function validateWith(obj:any, schema:Schema):ValidatorResult {
    return v.validate(obj, schema)
}

export function middleware(validatorFunc:ValidatorFunc, getItem:(req:express.Request)=>any = getBody):express.RequestHandler {
    return (req:express.Request, res:express.Response, next:express.NextFunction) => {
        const result = validatorFunc(getItem(req))
        if (result.valid) return next()
        return res.status(400).send(JSON.stringify(result))  //TODO: find out why typing thinks I need this to be a string.

    }
}

function getBody(req):any {
    return req.body
}
