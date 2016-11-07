import { runTests as runDiffNotifierTests } from './diff-notifier.test'

export function runTests() {
    describe('lib >', () => {
        runDiffNotifierTests()
    })
}

runTests()
