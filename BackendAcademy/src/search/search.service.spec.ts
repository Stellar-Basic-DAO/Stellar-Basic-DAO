import { CourseEntity } from '../courses/course.entity';
import { CourseLevel } from '../courses';
import { CourseService } from '../courses/course.service';
import { CourseRevisionEntity } from '../courses/course-revision.entity';
import { SearchService } from './search.service';

class MockRewardsService {
  recordActivity(userId: string, _date: Date, xp: number) {
    return { userId, xpAwarded: xp, level: 1, xpToNextLevel: 0 };
  }
}

class InMemoryRepo<T extends { id: string }> {
  protected readonly rows = new Map<string, T>();
  create(partial: Partial<T> = {}): T { return partial as T; }
  async save(entity: T): Promise<T> { this.rows.set(entity.id, entity); return entity; }
  async findOne(opts: { where: Partial<T> }): Promise<T | null> {
    return Array.from(this.rows.values()).find(r =>
      Object.entries(opts.where).every(([k, v]) => (r as any)[k] === v)
    ) ?? null;
  }
  async find(): Promise<T[]> { return Array.from(this.rows.values()); }
}

describe('SearchService', () => {
  let courseService: CourseService;
  let searchService: SearchService;

  beforeEach(() => {
    const courseRepo = new InMemoryRepo<CourseEntity>() as unknown as import('typeorm').Repository<CourseEntity>;
    const revisionRepo = new InMemoryRepo<CourseRevisionEntity>() as unknown as import('typeorm').Repository<CourseRevisionEntity>;
    const rewardsService = new MockRewardsService() as any;
    courseService = new CourseService(courseRepo, revisionRepo, rewardsService);
    searchService = new SearchService(courseService);
  });

  async function addCourse(partial: Partial<CourseEntity>) {
    return courseService.create({
      title: partial.title ?? 'Rust Basics',
      description: partial.description ?? 'Learn Rust fundamentals',
      level: partial.level ?? CourseLevel.BEGINNER,
      order: partial.order ?? 1,
      learningPathId: partial.learningPathId ?? 'rust',
      duration: partial.duration ?? 60,
      category: partial.category,
      categories: partial.categories,
      tags: partial.tags,
      prerequisites: partial.prerequisites,
      skills: partial.skills,
      xpReward: partial.xpReward,
    });
  }

  it('finds active courses by tag or category', async () => {
    const ownership = await addCourse({
      title: 'Ownership',
      category: 'fundamentals',
      tags: ['rust', 'ownership'],
    });
    await addCourse({
      title: 'Web APIs',
      category: 'backend',
      tags: ['axum'],
    });

    await expect(
      searchService.searchCourses({
        tags: ['ownership'],
        categories: ['backend'],
      }),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ownership.id }),
        expect.objectContaining({ title: 'Web APIs' }),
      ]),
    );
  });

  it('supports requiring all tag and category filters', async () => {
    const matchingCourse = await addCourse({
      title: 'Async Rust',
      categories: ['backend', 'systems'],
      tags: ['rust', 'async'],
    });
    await addCourse({
      title: 'Intro Rust',
      category: 'fundamentals',
      tags: ['rust'],
    });

    await expect(
      searchService.searchCourses({
        tags: ['rust', 'async'],
        categories: ['backend'],
        match: 'all',
      }),
    ).resolves.toEqual([expect.objectContaining({ id: matchingCourse.id })]);
  });
});
