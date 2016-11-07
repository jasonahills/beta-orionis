import { runTests as runDiffNotifierTests } from './diff-notifier.test.ts'

export function runTests() {
    describe('lib >', () => {
        runDiffNotifierTests()
    })
}

runTests()
