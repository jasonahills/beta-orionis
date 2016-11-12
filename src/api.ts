import * as express from 'express'
import { json as jsonParser, urlencoded } from 'body-parser'
import { Schema } from 'jsonschema'
import { map, has } from 'lodash'
import * as path from 'path'

import { BaseGameState, BaseShip, ShipCommand, Map, RouteInfo, ShipCommandEval, ShipCommandResult } from './types'
import { Store } from './lib/redux-sync'
import { DiffNotifier } from './lib/diff-notifier'
import { JSONResourceGetter } from './lib/json-resource-getter'
import { RouteInformer } from './lib/route-informer'
import { GameStateUpdate, reducerBuilder, updateAction, stateReplaceAction, shipReplaceAction } from './reducer'

import { middleware as validatorMiddleware, validateCommand, validateWith } from './validators'

export type GameStateTransformation<Ship extends BaseShip, GameState extends BaseGameState<Ship>, DisplayGameState> = (gs:GameState) => DisplayGameState
// export type CommandEval< Ship extends BaseShip, GameState extends BaseGameState<Ship>> = (s:Ship, c:ShipCommand<any>, gameState:GameState) => any  // TODO: finish typing this

export interface Config {
    port: number
    updateInterval: number // in SECONDS  (not milliseconds)
}

export class GameStateAPI< Ship extends BaseShip, GameState extends BaseGameState<Ship>, DisplayGameState> {

    private app: express.Application

    private stateNotifier: DiffNotifier<GameState>
    private displayNotifier: DiffNotifier<DisplayGameState>
    private routeInformer: RouteInformer<DisplayGameState>
    private jsonRouter: JSONResourceGetter<DisplayGameState>
    private store: Store<GameState>
    private updateInterval: any //TODO: type correctly
    private commandMap: Map<Schema>

    constructor(
        private initialState: GameState,
        private updateWith: GameStateUpdate<Ship, GameState>,
        private commandEval: ShipCommandEval<Ship, GameState>,
        private stateTransformation: GameStateTransformation<Ship, GameState, DisplayGameState>,
        private displayStateSchema: Schema,
        private commandPayloadMap: Map<Schema>,
        private config: Config
    ) {

        // Check that our schema accurately represents the initial displayState
        const displayState = stateTransformation(initialState)
        validateWith(displayState, displayStateSchema)

        // Set up our data store.
        const reducer = reducerBuilder(updateWith)
        this.store = new Store(reducer, initialState)

        // Set up our router
        this.app = express()

        this.commandMap = this.commandPayloadMap  //TODO: actually perform the transformation
        this.routeInformer = new RouteInformer(displayState, displayStateSchema)
        this.jsonRouter = new JSONResourceGetter(displayState)

        this.app.use(jsonParser())
        this.app.use(urlencoded({ extended: false }))
        this.app.get('/gravity-example', (req, res) => res.sendFile(path.join(__dirname, '../../examples/gravity-example.html')))
        this.app.post('/ships/:shipId/commands', validatorMiddleware(validateCommand(this.commandMap)), this.commandPostHandler.bind(this))
        this.app.get('/ships/:shipId/commands', this.commandGetInfoHandler.bind(this))
        this.app.get('*', this.routeInformer.middleware())
        this.app.get('*', this.jsonRouter.middleware())
        this.app.get('*', (req, res) => res.sendStatus(404))


        // Set up our updates.
        this.stateNotifier = new DiffNotifier(initialState)
        this.displayNotifier = new DiffNotifier(displayState)

        this.store.subscribe((newState:GameState) => {
            const newDisplayState:DisplayGameState = stateTransformation(newState)
            this.stateNotifier.update(newState)
            this.displayNotifier.update(newDisplayState)
            this.jsonRouter.update(newDisplayState)
            this.routeInformer.update(newDisplayState)
        })
    }

    start():GameStateAPI<Ship, GameState, DisplayGameState> {
        this.app.listen(this.config.port, () => console.log('Listening on port', this.config.port))
        this.updateInterval = setInterval(() => this.store.dispatch(updateAction(this.config.updateInterval)), 1000 * this.config.updateInterval )
        return this
    }

    loadState(state:GameState) {
        this.store.dispatch(stateReplaceAction(state))
    }

    private commandGetInfoHandler(req, res, next) {
        if (!has(req.query, 'info')) return next()
        const info: RouteInfo = {
            methods: ['POST'],
            schemas: map(this.commandMap, (s) => s)
        }
        res.send(info)
    }

    private commandPostHandler(req, res) {
        // this.store.dispatch()
        const command = req.body
        command.shipId = req.params.shipId
        const state = this.store.getState()
        const result = dryRunCommand(state, command, this.commandEval.bind(this))
        if (result.success) {
            this.store.dispatch(shipReplaceAction(result.ship))
            res.sendStatus(200)
        }
        else {
            res.status(400).send(result.err)
        }

    }
}

function dryRunCommand<Ship extends BaseShip, GameState extends BaseGameState<Ship>>(state:GameState, command, commandEval):ShipCommandResult<Ship> {
    const shipId = command.shipId
    const ship = state.ships[shipId]
    const successFunc = (s:Ship) => {
        return {
            ship: s,
            success: true
        }
    }
    const failFunc = (err:string) => {
        return {
            ship: ship,
            success: false,
            err: err
        }
    }
    return commandEval(ship, command, state, successFunc, failFunc)
}

