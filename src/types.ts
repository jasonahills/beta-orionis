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
