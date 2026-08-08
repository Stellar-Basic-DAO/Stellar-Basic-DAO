import { Injectable, Logger } from '@nestjs/common';
import { AntiCheatResult } from './interfaces/anti-cheat.interface';
import { CheckSubmissionDto } from './dto/check-submission.dto';

/** Maximum batch size for submissions analysis. */
const MAX_BATCH_SIZE = 100;

/** Suspicious content patterns to flag. */
const SUSPICIOUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(eval|Function)\s*\(/g, reason: 'Dynamic code execution detected' },
  { pattern: /\b(document\.write|innerHTML)\s*=/g, reason: 'DOM manipulation in submission' },
  { pattern: /\/\/\s*(auto-generated|chatgpt|copilot)/i, reason: 'AI-generated code marker detected' },
  { pattern: /^(.)\1{500,}$/m, reason: 'Excessive repeated characters (potential spam)' },
];

/** Known solution hashes for common cheating patterns. */
const KNOWN_SOLUTION_HASHES = new Set<string>([
  'e3b0c44298fc1c149afbf4c8996fb924',
]);

/** Simple hash function for content comparison. */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * AntiCheatService
 *
 * Production-ready anti-cheat analysis service with content similarity
 * detection, pattern-based flagging, and batch processing.
 */
@Injectable()
export class AntiCheatService {
  private readonly logger = new Logger(AntiCheatService.name);
  private readonly submissionCache = new Map<string, string[]>();

  /**
   * Analyse a single submission for signs of cheating.
   *
   * Checks:
   * 1. Suspicious content patterns (eval, innerHTML, AI markers)
   * 2. Known solution hash matching
   * 3. Content similarity against cached submissions
   */
  async analyzeSubmission(dto: CheckSubmissionDto): Promise<AntiCheatResult> {
    this.logger.log(
      `Analysing submission for learnerId=${dto.learnerId}, taskId=${dto.taskId}`,
    );

    const content = dto.content || '';
    const contentHash = hashContent(content);
    const flags: string[] = [];

    // Check 1: Suspicious patterns
    for (const { pattern, reason } of SUSPICIOUS_PATTERNS) {
      const matches = (content.match(pattern) || []).length;
      if (matches > 0) {
        flags.push(`${reason} (${matches} match(es))`);
      }
    }

    // Check 2: Known solution hashes
    if (KNOWN_SOLUTION_HASHES.has(contentHash)) {
      flags.push('Submission matches a known flagged solution hash');
    }

    // Check 3: Content similarity
    const taskKey = `${dto.learnerId}:${dto.taskId}`;
    const previousSubmissions = this.submissionCache.get(taskKey) || [];
    for (const prev of previousSubmissions) {
      const similarity = this.computeSimilarity(content, prev);
      if (similarity > 0.85) {
        flags.push(`Content is ${(similarity * 100).toFixed(0)}% similar to a previous submission`);
        break;
      }
    }

    // Cache this submission for future comparisons
    previousSubmissions.push(content);
    if (previousSubmissions.length > 10) {
      previousSubmissions.shift();
    }
    this.submissionCache.set(taskKey, previousSubmissions);

    // Determine risk level
    let riskLevel: AntiCheatResult['riskLevel'] = 'low';
    if (flags.length >= 3) {
      riskLevel = 'high';
    } else if (flags.length >= 1) {
      riskLevel = 'medium';
    }

    const flagged = flags.length > 0;

    return {
      flagged,
      confidence: flagged ? Math.min(0.5 + flags.length * 0.2, 1.0) : 0.05,
      riskLevel,
      reason: flagged ? flags.join('; ') : 'No suspicious patterns detected.',
      recommendedAction: flagged
        ? riskLevel === 'high'
          ? 'manual_review'
          : 'flag_for_review'
        : 'none',
    };
  }

  /**
   * Batch-analyse multiple submissions with concurrency limit.
   */
  async analyzeSubmissions(dtos: CheckSubmissionDto[]): Promise<AntiCheatResult[]> {
    if (dtos.length > MAX_BATCH_SIZE) {
      this.logger.warn(`Batch size ${dtos.length} exceeds limit ${MAX_BATCH_SIZE}, truncating`);
      dtos = dtos.slice(0, MAX_BATCH_SIZE);
    }

    this.logger.log(`Batch analysing ${dtos.length} submission(s)`);

    const results: AntiCheatResult[] = [];
    for (const dto of dtos) {
      results.push(await this.analyzeSubmission(dto));
    }
    return results;
  }

  /**
   * Compute Jaccard similarity between two strings using 3-gram shingling.
   * Returns a value between 0 (completely different) and 1 (identical).
   */
  private computeSimilarity(a: string, b: string): number {
    if (a === b) return 1.0;
    if (!a || !b) return 0.0;

    const shingleSize = 3;
    const aShingles = new Set<string>();
    const bShingles = new Set<string>();

    for (let i = 0; i <= a.length - shingleSize; i++) {
      aShingles.add(a.substring(i, i + shingleSize));
    }
    for (let i = 0; i <= b.length - shingleSize; i++) {
      bShingles.add(b.substring(i, i + shingleSize));
    }

    const intersection = new Set([...aShingles].filter((s) => bShingles.has(s)));
    const union = new Set([...aShingles, ...bShingles]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }
}
