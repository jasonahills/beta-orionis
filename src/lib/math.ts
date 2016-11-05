import { max, min } from 'lodash'

import { Bbox, Polygon, Coordinate } from '../types'


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


// Geometry

export function polygonBbox(p:Polygon):Bbox {
    const xs:number[] = p.map((c)=>c.x)
    const ys:number[] = p.map((c)=>c.y)
    const minX = min(xs)
    const maxX = max(xs)
    const minY = min(ys)
    const maxY = max(ys)

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        cx: (maxX + minX) / 2,
        cy: (maxY + minY) / 2
    }
}
