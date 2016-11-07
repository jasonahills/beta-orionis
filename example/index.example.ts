import * as express from 'express'

import { JSONResourceGetter } from '../src/lib/json-resource-getter'

const app = express()

const ships = {ships: {voyager: 'cool', odyssey: 'even cooler'}, commands: ['hey', 'you']}
const getter = new JSONResourceGetter(ships)

app.use('/mounted', getter.middleware())

app.get('*', (req, res) => res.sendStatus(404))

app.listen(3006, () => {
    console.log('listening on 3006')
})
