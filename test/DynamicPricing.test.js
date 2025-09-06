const assert = require('assert');
const DynamicPricing = require('../src/DynamicPricing.js');

// A simple test runner
function runTest(name, testFunction) {
    try {
        testFunction();
        console.log(`✔ ${name}`);
    } catch (error) {
        console.error(`✖ ${name}`);
        console.error(error);
        process.exit(1); // Exit with error code if a test fails
    }
}

console.log('Running tests for DynamicPricing...');

const pricing = new DynamicPricing();

runTest('should calculate the correct base price for a simple bug', () => {
    const analysis = { problemType: 'simple_bug' };
    const price = pricing.calculateFairPrice(analysis);
    // Base: 75, Complexity: 0.6 => 45. Rounded to 50.
    assert.strictEqual(price, 50, 'Expected price for a simple bug should be 50');
});

runTest('should apply the urgency multiplier correctly', () => {
    const analysis = { problemType: 'feature_request', isUrgent: true };
    const price = pricing.calculateFairPrice(analysis);
    // Base: 150, Urgency: 1.5, Complexity: 0.6 => 150 * 1.5 * 0.6 = 135. Rounded to 125.
    assert.strictEqual(price, 125, 'Expected price for an urgent feature request should be 125');
});

runTest('should apply a multiplier for a niche tech stack', () => {
    const analysis = { problemType: 'performance_issue', popularTechStack: false };
    const price = pricing.calculateFairPrice(analysis);
    // Base: 200, Tech: 1.2, Complexity: 0.6 => 200 * 1.2 * 0.6 = 144. Rounded to 150.
    assert.strictEqual(price, 150, 'Expected price for a niche tech performance issue should be 150');
});

runTest('should handle a complex integration with multiple multipliers', () => {
    const analysis = {
        problemType: 'complex_integration',
        isUrgent: true,
        isLargeProject: true,
        complexityScore: 8 // 8/5 = 1.6
    };
    const price = pricing.calculateFairPrice(analysis);
    // Base: 500, Urgency: 1.5, Complexity: 1.6, Size: 1.3 => 500 * 1.5 * 1.6 * 1.3 = 1560. Rounded to 1550.
    assert.strictEqual(price, 1550, 'Expected price for a complex integration should be 1550');
});

console.log('All DynamicPricing tests passed successfully!');
