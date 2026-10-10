import supertest from "supertest";
import app from "../src/app.js";
import redis from "../src/config/redis.js";

//describe groups related tests together
describe("Health API Endpoint", () => {
    //it represents single or specific test case
    //string should describe what exactly the code should do
    it("should return 200 OK and confirm Redis is connected", async () => {
        // 1. ARRANGE
        // We wrap our Express app in Supertest. 
        // 'api' is now a fake browser that can send requests to our app in memory
        const api = supertest(app);
        // 2. ACT
        // We simulate a GET request to the /health route
        const response = await api.get("/health");
        // 3. ASSERT
        // We verify that the API behaved exactly as expected
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok'); // The JSON body must have status: 'ok'
        expect(response.body).toHaveProperty('redis');
    });
    // --- TEARDOWN ---
    // When the test finishes, the Redis connection is technically still open in the background.
    // Jest will refuse to exit if database connections are left open.
    // 'afterAll' runs once after all tests in this file are completely finished.
    afterAll(async () => {
        await redis.quit();  // Gracefully close the Redis connection
    })
})