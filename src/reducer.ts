import { BaseGameState, BaseShip, StateUpdateFunc } from './types'
import { Action as BaseAction } from './lib/redux-sync'

export type GameStateUpdate<Ship extends BaseShip, GameState extends BaseGameState<Ship>> = (gs:GameState, secondsElapsed:number) => GameState

export type ActionTypes = 'STATE_UPDATE' | 'STATE_REPLACE'

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



export function reducerBuilder<Ship extends BaseShip, GameState extends BaseGameState<Ship>>(
    stateUpdateFunc:GameStateUpdate<Ship, GameState>
) {
    return (state:GameState, action:BaseAction<any>) => {
        if (action.type === 'STATE_UPDATE') return stateUpdateFunc(state, action.payload.secondsElapsed)
        if (action.type === 'STATE_REPLACE') return action.payload.state
        return state
    }
}