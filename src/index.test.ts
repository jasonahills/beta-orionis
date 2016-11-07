import { runTests as runLibTests } from './lib/index.test'

export function runTests() {
    describe('src >', () => {
        runLibTests()
    })
}
