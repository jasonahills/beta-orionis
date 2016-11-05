export type Id = string
export interface Coordinate {
    x: number
    y: number
}

export type Path = Coordinate[]
export type Polygon = Coordinate[]

export type Segment = {
    p1: Coordinate
    p2: Coordinate
}

export interface HasId {
    id: Id
}
