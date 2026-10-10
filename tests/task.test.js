import supertest from 'supertest';
import app from '../src/app.js';
import redis from '../src/config/redis.js';

const api = supertest(app);

describe('Task API (CRUD)', () => {
    let token, organizationId, projectId, issueId, taskId;
    const unique = Date.now() + Math.random().toString(36).substring(7);

    beforeAll(async () => {
        // Setup massive relational chain
        await api.post('/api/v1/auth/register').send({ email: `task_${unique}@flowforge.com`, password: 'pwd', name: 'Tester' });
        const login = await api.post('/api/v1/auth/login').send({ email: `task_${unique}@flowforge.com`, password: 'pwd' });
        token = login.body.data.accessToken;

        const org = await api.post('/api/v1/organizations').set('Authorization', `Bearer ${token}`)
            .send({ name: 'Task Org', slug: `task-org-${unique}` });
        organizationId = org.body.data.organization.id;

        const proj = await api.post(`/api/v1/organizations/${organizationId}/projects`).set('Authorization', `Bearer ${token}`)
            .send({ name: 'Task Proj', slug: `task-proj-${unique}` });
        projectId = proj.body.data.id;

        const issue = await api.post(`/api/v1/organizations/${organizationId}/projects/${projectId}/issues`).set('Authorization', `Bearer ${token}`)
            .send({ title: 'Task Issue' });
        issueId = issue.body.data.id;
    });

    it('should create a new Task', async () => {
        const response = await api.post(`/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}/tasks`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Fix the testing pipeline' });
        
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id');
        taskId = response.body.data.id;
    });

    it('should update a Task to completed', async () => {
        const response = await api.patch(`/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ completed: true });
        
        expect(response.status).toBe(200);
        expect(response.body.data.completed).toBe(true);
    });

    it('should get all Tasks for an Issue', async () => {
        const response = await api.get(`/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}/tasks`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should delete a Task', async () => {
        const response = await api.delete(`/api/v1/organizations/${organizationId}/projects/${projectId}/issues/${issueId}/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
    });

    afterAll(async () => {
        await redis.quit();
    });
});
