import { Action as ReduxAction } from 'redux'

export interface Action<Payload> extends ReduxAction {
    payload: Payload
}

export type Reducer<State> = (state:State, action:Action<any>) => State

export function reducerReducer<State>(reducers:Reducer<State>[], defaultState:State):Reducer<State> {
    return (state:State = defaultState, action:Action<any>):State => reducers
    .reduce((acc:State, f:Reducer<State>) => f(acc, action), state)
}
