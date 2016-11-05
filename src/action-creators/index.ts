import { filter } from 'lodash'

import { randomFromArray } from '../lib/modash'
import { BodyPart, Body } from '../types'
import { upsertPart } from '../state/currentBody'
import { setCurrentBodyPart } from '../state/currentBodyPart'


export function finishAndDraw(bodyPart:BodyPart, body:Body) {
    return (dispatch) => {
        dispatch(upsertPart(bodyPart))
        return dispatch(getRandomPart(body))
    }
}

export function getRandomPart(body:Body) {
    return (dispatch) => {
        const part = randomFromArray(filter(body.parts, (p) => !p.completed))  // TODO: do this better; I don't like passing this body in
        dispatch(setCurrentBodyPart(part))
    }
}
