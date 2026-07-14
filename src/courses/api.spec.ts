import request from 'supertest';
import app from '../server';

describe('Courses API (integration)', () => {
  describe('GET /api/courses/learning-paths', () => {
    it('should return all 3 learning paths', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.count).toBe(3);

      // Verify correct order
      expect(res.body.data[0].track).toBe('beginner');
      expect(res.body.data[1].track).toBe('intermediate');
      expect(res.body.data[2].track).toBe('advanced');
    });

    it('should return paths with full metadata', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths')
        .expect(200);

      const path = res.body.data[0];
      expect(path).toHaveProperty('id');
      expect(path).toHaveProperty('title');
      expect(path).toHaveProperty('description');
      expect(path).toHaveProperty('difficulty');
      expect(path).toHaveProperty('skillsCovered');
      expect(path).toHaveProperty('prerequisites');
      expect(path).toHaveProperty('price');
      expect(path.estimatedTime).toHaveProperty('totalHours');
    });
  });

  describe('GET /api/courses/learning-paths/summary', () => {
    it('should return lightweight summaries', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/summary')
        .expect(200);

      expect(res.body.data).toHaveLength(3);
      const summary = res.body.data[0];

      // Should have lightweight fields
      expect(summary).toHaveProperty('id');
      expect(summary).toHaveProperty('estimatedHours');

      // Should NOT have heavy fields
      expect(summary).not.toHaveProperty('skillsCovered');
      expect(summary).not.toHaveProperty('prerequisites');
    });
  });

  describe('GET /api/courses/learning-paths/:id', () => {
    it('should return a specific path by ID', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/path-beginner')
        .expect(200);

      expect(res.body.data.id).toBe('path-beginner');
      expect(res.body.data.track).toBe('beginner');
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/non-existent')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Learning path not found');
    });
  });

  describe('GET /api/courses/learning-paths/track/:track', () => {
    it('should filter by track', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/track/intermediate')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].track).toBe('intermediate');
    });

    it('should return 400 for invalid track', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/track/invalid')
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/courses/learning-paths/recommendation/:currentLevel', () => {
    it('should recommend intermediate from beginner', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/recommendation/beginner')
        .expect(200);

      expect(res.body.data.track).toBe('intermediate');
      expect(res.body.currentLevel).toBe('beginner');
      expect(res.body.nextLevel).toBe('intermediate');
    });

    it('should return null when at advanced level', async () => {
      const res = await request(app)
        .get('/api/courses/learning-paths/recommendation/advanced')
        .expect(200);

      expect(res.body.data).toBeNull();
      expect(res.body.message).toContain('most advanced level');
    });
  });

  describe('Health check', () => {
    it('should return OK', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not Found');
    });
  });
});
