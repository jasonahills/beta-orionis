import { compact } from 'lodash'

import { Path } from '../types'


export function parsePath(path:Path):string[] {
    return compact(path.split('/'))
}

export function parseBoolean(boolString:string | null):boolean {
    if (boolString == null) return false
    return boolString === "true"
}
