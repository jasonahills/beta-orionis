'use strict'

import { mapValues, reduce } from 'lodash'
import { Schema } from 'jsonschema'  // TODO: actually import from our type definitions (that is, we need to expose Schema there too. )

import { Map, ShipCommand, ShipCommandResult, ShipCommandSuccessFunc, ShipCommandFailFunc } from '../src/types'
import { GameStateAPI } from '../src/api'
import { vAdd, vSubtract, vScalarMult, distance } from '../src/lib/math'


interface Vector {
    x: number
    y: number
}

interface ExampleShip {
    id: string
    position: Vector
    mass: number
    velocity: Vector
}

interface ExampleGameState {
    ships: Map<ExampleShip>
}

const initialState:ExampleGameState = {
    ships: {
        voyager: {
            id: 'voyager',
            position: { x: 0,  y: 0 },
            velocity: { x: 10, y: 10 },
            mass: 100
        },
        odyssey: {
            id: 'odyssey',
            position: { x: 10,  y: 0 },
            velocity: { x: -10, y: -10 },
            mass: 150
        }
    }
}

const updateWith = (s:ExampleGameState, secondsElapsed:number):ExampleGameState => {
    return {
        ships: mapValues(s.ships, (ship, id) => {
            return (Object as any).assign({}, ship, {
                position: vAdd(ship.position, vScalarMult(secondsElapsed, ship.velocity)),
                velocity: vAdd(ship.velocity, gravityAcceleration(ship, s.ships, secondsElapsed))
            })
        })
    }
}

function commandEval(ship:ExampleShip, c:ShipCommand<any>, s:ExampleGameState, success:ShipCommandSuccessFunc<ExampleShip>, fail:ShipCommandFailFunc<ExampleShip>):ShipCommandResult<ExampleShip> {
    if (c.payload.foo === 'bar') {
        const newShip = (Object as any).assign({}, ship, {
            mass: ship.mass + 1000
        })
        return success(newShip)
    }
    return fail('not a bar')
}

// const commandEvals = {
//     test: commandEval
// }

const stateTransformation = (s:ExampleGameState):ExampleGameState => s

const coordinateSchema:Schema = {
    type: 'object',
    properties: {
        x: { type: 'number' },
        y: { type: 'number' }
    }
}

const displaySchema:Schema = {
    type:'object',
    properties: {
        ships: {
            type: 'object',
            additionalProperties: {
                type:'object',
                properties: {
                    id: { type: 'string' },
                    position: coordinateSchema,
                    velocity: coordinateSchema,
                    mass: {type: 'number' }
                }
            }
        }
    }
}

const commandSchemas: Map<Schema> = {  // TODO: switch this out
    test: {
        type: 'object',
        properties: {
            type: { type: 'string'},
            payload: {
                type: 'object',
                properties: {
                    foo: {type: 'string' }
                },
                required: ['foo']
            }
        },
        required: ['payload', 'type']
    }
}

const config = {
    port: 1338,
    updateInterval: 0.250
}


const api = new GameStateAPI(initialState, updateWith, commandEval, stateTransformation, displaySchema, commandSchemas, config)



export function main():void {
    api.start()
}

main()




function gravityAcceleration(ship:ExampleShip, ships:Map<ExampleShip>, secondsElapsed:number):Vector {
    const g = 0.01
    return reduce(ships, (acc, s) => {
        const dist = distance(ship.position, s.position)
        if (dist === 0) return acc
        const gravityMagnitude = (g * ship.mass * s.mass) / (dist * dist)
        const gravityAccel = vScalarMult(gravityMagnitude * secondsElapsed, vSubtract(s.position, ship.position))
        return vAdd(acc, gravityAccel)
    }, {x:0, y:0})
}


