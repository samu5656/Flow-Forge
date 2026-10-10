import supertest from 'supertest';
import app from '../src/app.js';
import redis from '../src/config/redis.js';

const api = supertest(app);

describe('Notification API', () => {
    let token;
    const unique = Date.now() + Math.random().toString(36).substring(7);

    beforeAll(async () => {
        await api.post('/api/v1/auth/register').send({ email: `notif_${unique}@test.com`, password: 'pwd', name: 'Tester' });
        const login = await api.post('/api/v1/auth/login').send({ email: `notif_${unique}@test.com`, password: 'pwd' });
        token = login.body.data.accessToken;
    });

    it('should get all notifications for a user', async () => {
        const response = await api.get(`/api/v1/notifications`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    afterAll(async () => {
        await redis.quit();
    });
});
