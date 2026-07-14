import { LearningPathService } from './service';

describe('LearningPathService', () => {
  let service: LearningPathService;

  beforeEach(() => {
    service = new LearningPathService();
  });

  describe('getAllLearningPaths', () => {
    it('should return all 3 learning paths', () => {
      const paths = service.getAllLearningPaths();
      expect(paths).toHaveLength(3);
    });

    it('should return paths with correct structure', () => {
      const paths = service.getAllLearningPaths();
      for (const path of paths) {
        expect(path).toHaveProperty('id');
        expect(path).toHaveProperty('track');
        expect(path).toHaveProperty('title');
        expect(path).toHaveProperty('difficulty');
        expect(path).toHaveProperty('price');
        expect(path.estimatedTime).toHaveProperty('totalHours');
      }
    });

    it('should return paths in order: beginner, intermediate, advanced', () => {
      const paths = service.getAllLearningPaths();
      expect(paths[0].track).toBe('beginner');
      expect(paths[1].track).toBe('intermediate');
      expect(paths[2].track).toBe('advanced');
    });
  });

  describe('getLearningPathById', () => {
    it('should return the correct path for a valid ID', () => {
      const path = service.getLearningPathById('path-beginner');
      expect(path).toBeDefined();
      expect(path!.id).toBe('path-beginner');
      expect(path!.title).toContain('Rust');
    });

    it('should return the intermediate path', () => {
      const path = service.getLearningPathById('path-intermediate');
      expect(path).toBeDefined();
      expect(path!.track).toBe('intermediate');
      expect(path!.title).toContain('Soroban');
    });

    it('should return undefined for an unknown ID', () => {
      const path = service.getLearningPathById('non-existent-path');
      expect(path).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const path = service.getLearningPathById('PATH-BEGINNER');
      expect(path).toBeUndefined();
    });
  });

  describe('getLearningPathsByTrack', () => {
    it('should return only beginner tracks', () => {
      const paths = service.getLearningPathsByTrack('beginner');
      expect(paths).toHaveLength(1);
      expect(paths[0].track).toBe('beginner');
    });

    it('should return only intermediate tracks', () => {
      const paths = service.getLearningPathsByTrack('intermediate');
      expect(paths).toHaveLength(1);
      expect(paths[0].track).toBe('intermediate');
    });

    it('should return only advanced tracks', () => {
      const paths = service.getLearningPathsByTrack('advanced');
      expect(paths).toHaveLength(1);
      expect(paths[0].track).toBe('advanced');
    });
  });

  describe('getLearningPathSummary', () => {
    it('should return 3 summaries', () => {
      const summaries = service.getLearningPathSummary();
      expect(summaries).toHaveLength(3);
    });

    it('should include only lightweight fields', () => {
      const summaries = service.getLearningPathSummary();
      for (const summary of summaries) {
        expect(summary).toHaveProperty('id');
        expect(summary).toHaveProperty('track');
        expect(summary).toHaveProperty('title');
        expect(summary).toHaveProperty('difficulty');
        expect(summary).toHaveProperty('courseCount');
        expect(summary).toHaveProperty('estimatedHours');
        expect(summary).toHaveProperty('certificateAvailable');

        // Should NOT include heavy fields
        expect(summary).not.toHaveProperty('skillsCovered');
        expect(summary).not.toHaveProperty('prerequisites');
        expect(summary).not.toHaveProperty('learningOutcomes');
        expect(summary).not.toHaveProperty('price');
      }
    });

    it('should have correct estimated hours', () => {
      const summaries = service.getLearningPathSummary();
      expect(summaries[0].estimatedHours).toBe(80);  // beginner
      expect(summaries[1].estimatedHours).toBe(180); // intermediate
      expect(summaries[2].estimatedHours).toBe(320); // advanced
    });
  });

  describe('getNextPathRecommendation', () => {
    it('should recommend intermediate from beginner', () => {
      const next = service.getNextPathRecommendation('beginner');
      expect(next).toBeDefined();
      expect(next!.track).toBe('intermediate');
    });

    it('should recommend advanced from intermediate', () => {
      const next = service.getNextPathRecommendation('intermediate');
      expect(next).toBeDefined();
      expect(next!.track).toBe('advanced');
    });

    it('should return undefined when at advanced level', () => {
      const next = service.getNextPathRecommendation('advanced');
      expect(next).toBeUndefined();
    });

    it('should return undefined for unknown level', () => {
      // TypeScript prevents invalid levels, but test edge case via any cast
      const next = service.getNextPathRecommendation('unknown' as any);
      expect(next).toBeUndefined();
    });
  });
});
