import { max, min } from 'lodash'

import { Polygon, Coordinate } from '../types'


export function pythagorean(a:number, b:number):number {
    return Math.sqrt((a * a) + (b * b))
}



// Vectors

export function vLength(v:Coordinate):number {
    return pythagorean(v.x, v.y)
}

export function vAdd(v1:Coordinate, v2:Coordinate):Coordinate {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}

export function vSubtract(v1:Coordinate, v2:Coordinate):Coordinate {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
}

export function vScalarMult(s:number, v:Coordinate) {
    return {
        x: v.x * s,
        y: v.y * s
    }
}

export function distance(v1:Coordinate, v2:Coordinate):number {
    return pythagorean(v1.x - v2.x, v1.y - v2.y)
}
