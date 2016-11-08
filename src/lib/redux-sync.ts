export interface Action<Payload> {
    type: string
    payload: Payload
}

export type Reducer<State> = (s:State, action:Action<any>) => State

export type Subscription<State> = (s:State) => any



export class Store<State> {

    private state:State
    private subscriptions:Subscription<State>[]

    constructor(
        private reducer:Reducer<State>,
        private initialState:State
    ) {
        this.state = initialState
        this.subscriptions = []
    }

    getState() {
        return this.state
    }

    subscribe(subscription:Subscription<State>):Store<State> {
        this.subscriptions = this.subscriptions.concat([subscription])
        return this
    }

    dispatch<T extends Action<any>>(action:T):Store<State> {
        this.state = this.reducer(this.state, action)
        this.subscriptions.forEach((sub) => sub(this.state))
        return this
    }
}