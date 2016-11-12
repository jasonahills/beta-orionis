import { Schema } from 'jsonschema'

//////////////////////
/// String Aliases ///
//////////////////////

export type ID = string
export type Path = string

export interface Map<T> {
    [key:string]:T
}

export interface Coordinate {
    x: number
    y: number
}

export type Polygon = Coordinate[]

export type Segment = {
    p1: Coordinate
    p2: Coordinate
}

export interface HasId {
    id: ID
}

export interface BaseGameState<Ship extends BaseShip> {
    // commands: Map<ShipCommand<any>>
    ships: Map<Ship>
}

export interface ShipCommand<Payload> extends HasId {
    shipId?: ID
    type: string
    payload: Payload
}

export interface BaseShip extends HasId {

}

export type ShipCommandResult<Ship extends BaseShip> = {
    ship: Ship,
    success: boolean
    err?: string
}

export type ShipCommandSuccessFunc<Ship extends BaseShip> = (ship:Ship) => ShipCommandResult<Ship>
export type ShipCommandFailFunc<Ship extends BaseShip> = (err:string) => ShipCommandResult<Ship>

export type ShipCommandEval<Ship extends BaseShip, State extends BaseGameState<Ship>> = (
    ship:Ship,
    command:ShipCommand<any>,
    state:State,
    success: ShipCommandSuccessFunc<Ship>,
    fail: ShipCommandFailFunc<Ship>
) => ShipCommandResult<Ship>

export type StateUpdateFunc<State extends BaseGameState<BaseShip>> = (s:State) => State

export type HTTPVerb = 'GET' | 'PUT' | 'POST' | 'DELETE'

export interface RouteInfo {
    methods: HTTPVerb[],
    schemas: Schema[]
}
