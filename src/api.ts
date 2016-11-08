import * as express from 'express'

import { BaseGameState, BaseShip, ShipCommand, Map } from './types'
import { Store } from './lib/redux-sync'
import { DiffNotifier } from './lib/diff-notifier'
import { JSONResourceGetter } from './lib/json-resource-getter'
import { GameStateUpdate, reducerBuilder, updateAction, stateReplaceAction } from './reducer'

export type GameStateTransformation<Ship extends BaseShip, GameState extends BaseGameState<Ship>, DisplayGameState> = (gs:GameState) => DisplayGameState
export type CommandEval< Ship extends BaseShip, GameState extends BaseGameState<Ship>> = (s:Ship, c:ShipCommand<any>, gameState:GameState) => any  // TODO: finish typing this

export interface Config {
    port: number
    updateInterval: number // in seconds
}

export class GameStateAPI< Ship extends BaseShip, GameState extends BaseGameState<Ship>, DisplayGameState> {

    private app: express.Application

    private stateNotifier: DiffNotifier<GameState>
    private displayNotifier: DiffNotifier<DisplayGameState>
    private jsonRouter: JSONResourceGetter<DisplayGameState>
    private store: Store<GameState>
    private updateInterval: any //TODO: type correctly

    constructor(
        private initialState: GameState,
        private updateWith: GameStateUpdate<Ship, GameState>,
        private commandEval: CommandEval<Ship, GameState>,
        private stateTransformation: GameStateTransformation<Ship, GameState, DisplayGameState>,
        private config: Config
    ) {

        // Set up our data store.
        const reducer = reducerBuilder(updateWith)
        this.store = new Store(reducer, initialState)


        // Set up our router
        this.app = express()

        const displayState = stateTransformation(initialState)
        this.jsonRouter = new JSONResourceGetter(displayState)

        this.app.use('/', this.jsonRouter.middleware())
        this.app.get('*', (req, res) => res.sendStatus(404))


        // Set up our updates.
        this.stateNotifier = new DiffNotifier(initialState)
        this.displayNotifier = new DiffNotifier(displayState)

        this.store.subscribe((newState:GameState) => {
            const newDisplayState:DisplayGameState = stateTransformation(newState)
            this.stateNotifier.update(newState)
            this.displayNotifier.update(newDisplayState)
            this.jsonRouter.update(newDisplayState)
        })
    }

    start():GameStateAPI<Ship, GameState, DisplayGameState> {
        this.app.listen(this.config.port, () => console.log('Listening on port', this.config.port))
        this.updateInterval = setInterval(() => this.store.dispatch(updateAction(this.config.updateInterval)), this.config.updateInterval )
        return this
    }

    loadState(state:GameState) {
        this.store.dispatch(stateReplaceAction(state))
    }
}