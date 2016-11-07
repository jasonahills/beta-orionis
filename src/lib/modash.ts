import { compact } from 'lodash'

import { Path } from '../types'


export function parsePath(path:Path):string[] {
    return compact(path.split('/'))
}
