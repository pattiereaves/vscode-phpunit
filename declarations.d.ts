import * as mocha from 'mocha';

declare module '@jest/types/build/Global' {
    interface DescribeBase extends mocha.SuiteFunction {}
    interface ItBase extends mocha.TestFunction {}
}
