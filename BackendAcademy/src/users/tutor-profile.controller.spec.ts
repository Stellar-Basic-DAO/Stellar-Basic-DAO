import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TutorProfileController } from './tutor-profile.controller';
import { TutorProfileService } from './tutor-profile.service';
import { TutorSpecialty } from './interfaces/tutor-specialty.enum';
import { VerificationStatus } from './interfaces/verification-status.enum';

describe('TutorProfileController (integration)', () => {
  let app: INestApplication;
  let service: TutorProfileService;
  let profileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TutorProfileController],
      providers: [TutorProfileService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    service = moduleFixture.get<TutorProfileService>(TutorProfileService);

    // Seed a tutor profile for verification flow tests
    const profile = await service.create({
      userId: 'test-user',
      bio: 'Integration test tutor',
      specialties: [TutorSpecialty.RUST_FUNDAMENTALS],
      hourlyRate: 50,
    });
    profileId = profile.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tutors - Create tutor', () => {
    it('should create a new tutor profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/tutors')
        .send({
          userId: 'new-user',
          bio: 'New tutor',
          specialties: [TutorSpecialty.WEB3_SOROBAN],
          hourlyRate: 75,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe('new-user');
      expect(res.body.status).toBe(VerificationStatus.UNVERIFIED);
      expect(res.body.isVerified).toBe(false);

      // Clean up
      await service.remove(res.body.id);
    });
  });

  describe('GET /tutors - List tutors', () => {
    it('should return all tutor profiles', async () => {
      const res = await request(app.getHttpServer())
        .get('/tutors')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /tutors/:id - Get tutor by ID', () => {
    it('should return a specific tutor profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tutors/${profileId}`)
        .expect(200);

      expect(res.body.id).toBe(profileId);
      expect(res.body.userId).toBe('test-user');
    });

    it('should return empty for non-existent tutor', async () => {
      const res = await request(app.getHttpServer())
        .get('/tutors/00000000-0000-0000-0000-000000000000')
        .expect(200);

      // NestJS serializes null returns as empty object
      expect(res.body).toStrictEqual({});
    });
  });

  describe('POST /tutors/:id/request-verification - Request verification', () => {
    it('should move tutor to PENDING status', async () => {
      const res = await request(app.getHttpServer())
        .post(`/tutors/${profileId}/request-verification`)
        .send({ note: 'Please verify my profile' })
        .expect(201);

      expect(res.body.status).toBe(VerificationStatus.PENDING);
      expect(res.body.verificationNote).toBe('Please verify my profile');
      expect(res.body.isVerified).toBe(false);
    });
  });

  describe('POST /tutors/:id/verify - Verify tutor', () => {
    it('should verify a tutor and record audit metadata', async () => {
      // Create a fresh profile for verify test
      const fresh = await service.create({
        userId: 'verify-test-user',
        bio: 'To be verified',
        specialties: [TutorSpecialty.ADVANCED_RUST],
        hourlyRate: 100,
      });

      // First request verification
      await service.requestVerification(fresh.id, { note: 'Ready for review' });

      const res = await request(app.getHttpServer())
        .post(`/tutors/${fresh.id}/verify`)
        .send({
          adminId: 'admin-001',
          note: 'All credentials verified',
        })
        .expect(201);

      expect(res.body.status).toBe(VerificationStatus.VERIFIED);
      expect(res.body.isVerified).toBe(true);
      expect(res.body.verifiedBy).toBe('admin-001');
      expect(res.body.verificationNote).toBe('All credentials verified');
      expect(res.body.verifiedAt).toBeDefined();

      // Clean up
      await service.remove(fresh.id);
    });
  });

  describe('POST /tutors/:id/unverify - Unverify tutor', () => {
    it('should clear verification status and audit metadata', async () => {
      // Create and verify a profile first
      const fresh = await service.create({
        userId: 'unverify-test-user',
        bio: 'To be unverified',
        specialties: [TutorSpecialty.RUST_FUNDAMENTALS],
      });
      await service.verify(fresh.id, { adminId: 'admin-1', note: 'Approved' });

      const res = await request(app.getHttpServer())
        .post(`/tutors/${fresh.id}/unverify`)
        .expect(201);

      expect(res.body.status).toBe(VerificationStatus.UNVERIFIED);
      expect(res.body.isVerified).toBe(false);
      expect(res.body.verifiedAt).toBeNull();
      expect(res.body.verifiedBy).toBeNull();
      expect(res.body.verificationNote).toBeNull();

      // Clean up
      await service.remove(fresh.id);
    });
  });

  describe('GET /tutors/:id/earnings - Earnings summary', () => {
    it('should return earnings summary for a tutor', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tutors/${profileId}/earnings`)
        .expect(200);

      expect(res.body).toHaveProperty('tutorId', profileId);
      expect(res.body).toHaveProperty('earnedXlm');
      expect(res.body).toHaveProperty('payouts');
    });
  });

  describe('GET /tutors/:id/reputation - Reputation details', () => {
    it('should return reputation details for a tutor', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tutors/${profileId}/reputation`)
        .expect(200);

      expect(res.body).toHaveProperty('tutorId', profileId);
      expect(res.body).toHaveProperty('reputationScore');
      expect(res.body).toHaveProperty('breakdown');
    });
  });

  describe('GET /tutors/verified - List verified tutors', () => {
    it('should return only verified tutors', async () => {
      // Create and verify a tutor
      const fresh = await service.create({
        userId: 'verified-list-user',
        bio: 'Verified',
        specialties: [TutorSpecialty.ASYNC_RUST],
      });
      await service.verify(fresh.id, { adminId: 'admin-1' });

      const res = await request(app.getHttpServer())
        .get('/tutors/verified')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some(t => t.id === fresh.id)).toBe(true);
      expect(res.body.every(t => t.status === VerificationStatus.VERIFIED)).toBe(true);

      // Clean up
      await service.remove(fresh.id);
    });
  });

  describe('GET /tutors/pending - List pending tutors', () => {
    it('should return only tutors awaiting verification', async () => {
      const res = await request(app.getHttpServer())
        .get('/tutors/pending')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every(t => t.status === VerificationStatus.PENDING)).toBe(true);
    });
  });
});
