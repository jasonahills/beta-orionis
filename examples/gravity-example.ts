'use strict'

import { mapValues, reduce } from 'lodash'
import { Schema } from 'jsonschema'  // TODO: actually import from our type definitions (that is, we need to expose Schema there too. )

import { Map, ShipCommand, ShipCommandResult, ShipCommandSuccessFunc, ShipCommandFailFunc } from '../src/types'
import { GameStateAPI } from '../src/api'
import { vAdd, vSubtract, vScalarMult, distance } from '../src/lib/math'


const rotationalThrustStrength = 100
const thrustStrength = 100

interface Vector {
    x: number
    y: number
}

interface ExampleShip {
    id: string
    position: Vector
    mass: number
    velocity: Vector
    momentOfInertia: number
    angularVelocity: number
    orientation: number
    firingForwardThruster: boolean
    firingReverseThruster: boolean
    firingCounterclockwiseThruster: boolean
    firingClockwiseThruster: boolean
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
            mass: 100,
            momentOfInertia: 5,
            angularVelocity: 0,
            orientation: 30,
            firingForwardThruster: false,
            firingReverseThruster: false,
            firingCounterclockwiseThruster: false,
            firingClockwiseThruster: false
        },
        odyssey: {
            id: 'odyssey',
            position: { x: 10,  y: 0 },
            velocity: { x: -10, y: -10 },
            mass: 150,
            momentOfInertia: 5,
            angularVelocity: 10,
            orientation: 0,
            firingForwardThruster: false,
            firingReverseThruster: false,
            firingCounterclockwiseThruster: false,
            firingClockwiseThruster: false
        }
    }
}

const updateWith = (s:ExampleGameState, secondsElapsed:number):ExampleGameState => {
    return {
        ships: mapValues(s.ships, (ship, id) => {
            return (Object as any).assign({}, ship, {
                position: vAdd(ship.position, vScalarMult(secondsElapsed, ship.velocity)),
                velocity: newVelocity(ship, s.ships, secondsElapsed),
                orientation: ship.orientation + (ship.angularVelocity * secondsElapsed),
                angularVelocity: newAngularVelocity(ship, secondsElapsed)
            })
        })
    }
}

function commandEval(ship:ExampleShip, c:ShipCommand<any>, s:ExampleGameState, success:ShipCommandSuccessFunc<ExampleShip>, fail:ShipCommandFailFunc<ExampleShip>):ShipCommandResult<ExampleShip> {
    if (c.type === 'START_FORWARD_THRUSTERS') return success((Object as any).assign({}, ship, { firingForwardThruster: true }))
    if (c.type === 'STOP_FORWARD_THRUSTERS') return success((Object as any).assign({}, ship, { firingForwardThruster: false }))
    if (c.type === 'START_REVERSE_THRUSTERS') return success((Object as any).assign({}, ship, { firingReverseThruster: true }))
    if (c.type === 'STOP_REVERSE_THRUSTERS') return success((Object as any).assign({}, ship, { firingReverseThruster: false }))
    if (c.type === 'START_COUNTERCLOCKWISE_THRUSTERS') return success((Object as any).assign({}, ship, { firingCounterclockwiseThruster: true }))
    if (c.type === 'STOP_COUNTERCLOCKWISE_THRUSTERS') return success((Object as any).assign({}, ship, { firingCounterclockwiseThruster: false }))
    if (c.type === 'START_CLOCKWISE_THRUSTERS') return success((Object as any).assign({}, ship, { firingClockwiseThruster: true }))
    if (c.type === 'STOP_CLOCKWISE_THRUSTERS') return success((Object as any).assign({}, ship, { firingClockwiseThruster: false }))
    return fail('couldn\'t evaluate command.')
}

// const commandEvals = {
//     test: commandEval
// }

// const commandInfos = {
//     START_FORWARD_THRUSTERS: {
//         eval: (ship, c, s, success, fail) => {

//         },
//         payload: { type: 'object' }
//     },
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

const commandPayloadSchemas: Map<Schema> = {  // TODO: switch this out
    'START_FORWARD_THRUSTERS': { type: 'object' },
    'STOP_FORWARD_THRUSTERS': { type: 'object' },
    'START_REVERSE_THRUSTERS': { type: 'object' },
    'STOP_REVERSE_THRUSTERS': { type: 'object' },
    'START_COUNTERCLOCKWISE_THRUSTERS': { type: 'object' },
    'STOP_COUNTERCLOCKWISE_THRUSTERS': { type: 'object' },
    'START_CLOCKWISE_THRUSTERS': { type: 'object' },
    'STOP_CLOCKWISE_THRUSTERS': { type: 'object' }
}

const config = {
    port: 1338,
    updateInterval: 0.250
}


const api = new GameStateAPI(initialState, updateWith, commandEval, stateTransformation, displaySchema, commandPayloadSchemas, config)



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

function newAngularVelocity(ship:ExampleShip, secondsElapsed:number):number {
    const counterclockwise = (ship.firingCounterclockwiseThruster) ? rotationalThrustStrength * secondsElapsed / ship.momentOfInertia : 0
    const clockwise = (ship.firingClockwiseThruster) ? -1 * rotationalThrustStrength * secondsElapsed / ship.momentOfInertia : 0
    return ship.angularVelocity + counterclockwise + clockwise
}

function newVelocity(ship:ExampleShip, ships:Map<ExampleShip>, secondsElapsed:number):Vector {
    const tVelo = thrusterVelocityComponent(ship, secondsElapsed)
    const gVelo = gravityAcceleration(ship, ships, secondsElapsed)
    return vAdd(vAdd(tVelo, gVelo), ship.velocity)
}

function thrusterVelocityComponent(ship:ExampleShip, secondsElapsed:number):Vector {
    const directionVector = {
        x: Math.cos((ship.orientation + 90) * Math.PI / 180),  // we add 90 so that a rotation of 0 degrees has the ship pointing on the y axis
        y: Math.sin((ship.orientation + 90) * Math.PI / 180)
    }
    const dSpeedForward = (ship.firingForwardThruster) ? thrustStrength * secondsElapsed : 0
    const dSpeedReverse = (ship.firingReverseThruster) ? thrustStrength * secondsElapsed * -1 : 0
    return vScalarMult(dSpeedForward + dSpeedReverse, directionVector)
}




