import supertest from 'supertest';
import app from '../src/app.js';
import redis from '../src/config/redis.js';

const api = supertest(app);

describe('Authentication API - /api/v1/auth', () => {

    // 1. ARRANGE FOR ALL TESTS: Define our user credentials up here
    // so both the Register and Login tests can share them!
    const dynamicEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = "strongpassword123";

    // THE UNHAPPY PATH
    it('should return 400 Bad Request if the email is missing', async () => {
        const response = await api.post('/api/v1/auth/register').send({
            password: testPassword,
            name: "Test User"
        });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    // THE HAPPY PATH (REGISTER)
    it('should successfully register a new user (NO TOKEN)', async () => {
        const response = await api.post('/api/v1/auth/register').send({
            email: dynamicEmail,
            password: testPassword,
            name: "Automated Tester"
        });

        // We updated the assertion to match your business logic!
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        
        // Let's verify the database actually saved the correct email
        expect(response.body.data.email).toBe(dynamicEmail); 
    });

    // THE HAPPY PATH (LOGIN)
    it('should successfully login and return a JWT', async () => {
        // ACT: We use the exact email/password we just registered!
        const response = await api.post('/api/v1/auth/login').send({
            email: dynamicEmail,
            password: testPassword
        });

        // ASSERT: Now we expect the token!
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // (Note: Change 'accessToken' if your API calls it 'token' or something else!)
        expect(response.body.data).toHaveProperty('accessToken'); 
    });

    // TEARDOWN
    afterAll(async () => {
        await redis.quit();
    });
});