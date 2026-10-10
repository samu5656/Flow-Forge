export default {
    testEnvironment: 'node', // Tells Jest we are testing a Node backend, not a React frontend
    transform: {}, // Tells Jest to use standard ES Modules (import/export)
    verbose: true, // Prints out the name of every single test as it passes/fails
    clearMocks: true // Resets any mock data between tests to prevent tests bleeding into each other
};