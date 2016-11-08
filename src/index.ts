'use strict'

import { Map } from './types'
import { GameStateAPI } from './api'

import { mapValues } from 'lodash'
import { vAdd } from './lib/math'


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


export function main():void {

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

    const updateWith = (s:ExampleGameState):ExampleGameState => {
        return {
            ships: mapValues(s.ships, (ship, id, ships) => {
                return (Object as any).assign({}, ship, {
                    position: vAdd(ship.position, ship.velocity)
                })
            })
        }
    }

    const commandEval = (ship:ExampleShip, c:any, s:ExampleGameState) => {
        return { ship: ship, command: c }
    }

    const stateTransformation = (s:ExampleGameState):ExampleGameState => s

    const api = new GameStateAPI(initialState, updateWith, commandEval, stateTransformation, { port: 1338, updateInterval: 250 })

    api.start()
}


main()

