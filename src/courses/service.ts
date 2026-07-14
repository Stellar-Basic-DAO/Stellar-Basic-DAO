import { learningPaths, type LearningPathMetadata } from './data/learningPaths';

export class LearningPathService {
  private paths: LearningPathMetadata[] = learningPaths;

  /**
   * Get all learning paths with full metadata
   */
  getAllLearningPaths(): LearningPathMetadata[] {
    return this.paths;
  }

  /**
   * Get a specific learning path by ID
   */
  getLearningPathById(id: string): LearningPathMetadata | undefined {
    return this.paths.find(path => path.id === id);
  }

  /**
   * Get learning paths by track (beginner, intermediate, advanced)
   */
  getLearningPathsByTrack(track: 'beginner' | 'intermediate' | 'advanced'): LearningPathMetadata[] {
    return this.paths.filter(path => path.track === track);
  }

  /**
   * Get lightweight summary of all learning paths
   */
  getLearningPathSummary(): Array<{
    id: string;
    track: string;
    title: string;
    difficulty: number;
    courseCount: number;
    estimatedHours: number;
    certificateAvailable: boolean;
  }> {
    return this.paths.map(path => ({
      id: path.id,
      track: path.track,
      title: path.title,
      difficulty: path.difficulty,
      courseCount: path.courseCount,
      estimatedHours: path.estimatedTime.totalHours,
      certificateAvailable: path.certificateAvailable,
    }));
  }

  /**
   * Get the next recommended learning path based on current level
   */
  getNextPathRecommendation(currentLevel: 'beginner' | 'intermediate' | 'advanced'): LearningPathMetadata | undefined {
    const levelOrder: Array<'beginner' | 'intermediate' | 'advanced'> = [
      'beginner',
      'intermediate',
      'advanced',
    ];

    const currentIndex = levelOrder.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex >= levelOrder.length - 1) {
      return undefined;
    }

    const nextLevel = levelOrder[currentIndex + 1];
    return this.paths.find(path => path.track === nextLevel);
  }
}

export const learningPathService = new LearningPathService();
