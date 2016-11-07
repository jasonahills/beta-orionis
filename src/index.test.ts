import { runTests as runLibTests } from './lib/index.test.ts'

export function runTests() {
    describe('src >', () => {
        runLibTests()
    })
}
