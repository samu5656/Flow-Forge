import supertest from 'supertest';
import app from '../src/app.js';
import redis from '../src/config/redis.js';

const api = supertest(app);

describe('Team API (CRUD)', () => {
    let token, organizationId, teamId;
    const unique = Date.now() + Math.random().toString(36).substring(7);

    beforeAll(async () => {
        // 1. Setup Auth and Organization
        await api.post('/api/v1/auth/register').send({
            email: `team_tester_${unique}@flowforge.com`,
            password: 'password123',
            name: 'Team Tester'
        });
        const login = await api.post('/api/v1/auth/login').send({
            email: `team_tester_${unique}@flowforge.com`,
            password: 'password123'
        });
        token = login.body.data.accessToken;

        const org = await api.post('/api/v1/organizations')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Team Org', slug: `team-org-${unique}` });
        
        organizationId = org.body.data.organization.id;
    });

    it('should create a new Team', async () => {
        const response = await api.post(`/api/v1/organizations/${organizationId}/teams`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Backend Team', description: 'API Devs' });
        
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id');
        teamId = response.body.data.id;
    });

    it('should get all Teams for an Organization', async () => {
        const response = await api.get(`/api/v1/organizations/${organizationId}/teams`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should update a Team', async () => {
        const response = await api.patch(`/api/v1/organizations/${organizationId}/teams/${teamId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Fullstack Team' });
        
        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe('Fullstack Team');
    });

    it('should delete a Team', async () => {
        const response = await api.delete(`/api/v1/organizations/${organizationId}/teams/${teamId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
    });

    afterAll(async () => {
        await redis.quit();
    });
});
