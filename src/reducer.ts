import { BaseGameState, BaseShip, StateUpdateFunc, ID } from './types'
import { Action as BaseAction } from './lib/redux-sync'

export type GameStateUpdate<Ship extends BaseShip, GameState extends BaseGameState<Ship>> = (gs:GameState, secondsElapsed:number) => GameState

export type ActionTypes = 'STATE_UPDATE' | 'STATE_REPLACE' | 'SHIP_REPLACE'

export interface Action<Payload> extends BaseAction<Payload> {
    type: ActionTypes
}



export type UpdateAction = {
    type: 'STATE_UPDATE'
    payload: { secondsElapsed: number }
}

export function updateAction(secondsElapsed:number):UpdateAction {
    return { type: 'STATE_UPDATE', payload: { secondsElapsed } }
}



export type StateReplaceAction<Ship extends BaseShip, GameState extends BaseGameState<Ship>> = {
    type: 'STATE_REPLACE'
    payload: { state: GameState }
}

export function stateReplaceAction<Ship extends BaseShip, GameState extends BaseGameState<Ship>>(state:GameState):StateReplaceAction<Ship, GameState> {
    return { type: 'STATE_REPLACE', payload: { state } }
}



export type ShipReplaceAction<Ship extends BaseShip> = {
    type: 'SHIP_REPLACE',
    payload: { ship: Ship }
}

export function shipReplaceAction<Ship extends BaseShip>(ship:Ship):ShipReplaceAction<Ship> {
    return { type: 'SHIP_REPLACE', payload: { ship } }
}

function shipReplace<Ship extends BaseShip, GameState extends BaseGameState<Ship>>(state:GameState, shipId:ID, ship:Ship): GameState {
    return assignKey(state, 'ships', assignKey(state.ships, shipId, ship))
}

function assignKey(obj, key, val) { //TODO: do this sort of stuff in a typesafe manner.
    const updates = {}
    updates[key] = val
    return (Object as any).assign({}, obj, updates)
}

export function reducerBuilder<Ship extends BaseShip, GameState extends BaseGameState<Ship>>(
    stateUpdateFunc:GameStateUpdate<Ship, GameState>
) {
    return (state:GameState, action:BaseAction<any>) => {
        if (action.type === 'STATE_UPDATE') return stateUpdateFunc(state, action.payload.secondsElapsed)
        if (action.type === 'STATE_REPLACE') return action.payload.state
        if (action.type === 'SHIP_REPLACE') return shipReplace(state, action.payload.ship.id, action.payload.ship)
        return state
    }
}

