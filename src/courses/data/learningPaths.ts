export interface LearningPathMetadata {
  id: string;
  track: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  prerequisites: string[];
  estimatedTime: {
    weeks: number;
    hoursPerWeek: number;
    totalHours: number;
  };
  skillsCovered: string[];
  courseCount: number;
  projects: number;
  certificateAvailable: boolean;
  price: {
    amount: number;
    currency: string;
  };
  learningOutcomes: string[];
  targetAudience: string[];
  toolsAndTechnologies: string[];
}

export const learningPaths: LearningPathMetadata[] = [
  {
    id: 'path-beginner',
    track: 'beginner',
    title: 'Beginner Track — Rust Fundamentals',
    description: 'Start your Rust journey from absolute zero. Learn the fundamentals of systems programming, ownership, borrowing, and lifetimes — the concepts that make Rust unique. No prior Rust experience required.',
    difficulty: 1,
    prerequisites: [
      'No prior Rust programming experience required',
      'Basic computer literacy',
      'Familiarity with any programming language (helpful but not required)',
    ],
    estimatedTime: {
      weeks: 8,
      hoursPerWeek: 10,
      totalHours: 80,
    },
    skillsCovered: [
      'Rust syntax and semantics',
      'Variables, data types, and pattern matching',
      'Ownership, borrowing, and lifetimes',
      'Functions, closures, and error handling',
      'Structs, enums, and traits',
      'Basic data structures in Rust',
      'Cargo package manager and tooling',
      'Writing and running tests',
    ],
    courseCount: 6,
    projects: 4,
    certificateAvailable: true,
    price: {
      amount: 0,
      currency: 'USD',
    },
    learningOutcomes: [
      'Write safe, idiomatic Rust code',
      'Understand and apply ownership and borrowing rules',
      'Build CLI applications in Rust',
      'Use Cargo for project management and dependencies',
      'Write unit and integration tests',
    ],
    targetAudience: [
      'Complete beginners to Rust',
      'Developers from other languages (Python, JS, Java) learning Rust',
      'Systems programming newcomers',
    ],
    toolsAndTechnologies: [
      'Rust (rustc, cargo)',
      'rust-analyzer / VS Code',
      'Git',
      'Command line basics',
    ],
  },
  {
    id: 'path-intermediate',
    track: 'intermediate',
    title: 'Intermediate Track — Soroban Smart Contracts',
    description: 'Level up your Rust skills with Soroban smart contract development on Stellar. Build decentralized applications, work with the Soroban SDK, and deploy contracts to Stellar testnet. Perfect for Rust developers ready for Web3.',
    difficulty: 2,
    prerequisites: [
      'Solid understanding of Rust (ownership, traits, generics)',
      'Familiarity with blockchain basics',
      'Basic knowledge of Stellar network concepts',
    ],
    estimatedTime: {
      weeks: 12,
      hoursPerWeek: 15,
      totalHours: 180,
    },
    skillsCovered: [
      'Soroban SDK fundamentals',
      'WASM compilation and contract deployment',
      'Stellar network interactions (Horizon, RPC)',
      'Token contract development (SAC standard)',
      'Cross-contract calls and composability',
      'Event emission and indexing',
      'Contract testing and debugging',
      'Storage patterns and optimization',
    ],
    courseCount: 10,
    projects: 6,
    certificateAvailable: true,
    price: {
      amount: 199,
      currency: 'USD',
    },
    learningOutcomes: [
      'Develop and deploy Soroban smart contracts',
      'Build token contracts following the SAC standard',
      'Integrate contracts with Stellar Horizon and RPC',
      'Emit and consume on-chain events',
      'Write comprehensive contract tests',
    ],
    targetAudience: [
      'Rust developers moving into Web3',
      'Blockchain developers learning Soroban',
      'Stellar ecosystem developers',
    ],
    toolsAndTechnologies: [
      'Soroban SDK',
      'Stellar CLI',
      'Rust (no_std, wasm32-unknown-unknown)',
      'Freighter wallet',
      'Horizon API',
      'Stellar Laboratory',
    ],
  },
  {
    id: 'path-advanced',
    track: 'advanced',
    title: 'Advanced Track — DAO Architecture & DeFi Protocols',
    description: 'Master advanced concepts in decentralized governance, DeFi protocol design, and production-grade smart contract architecture. For experienced Soroban developers ready to build the next generation of on-chain applications.',
    difficulty: 3,
    prerequisites: [
      'Strong Rust and Soroban contract development skills',
      'Experience deploying contracts to testnet/mainnet',
      'Understanding of DeFi primitives and DAO governance',
      'Familiarity with financial invariants and security patterns',
    ],
    estimatedTime: {
      weeks: 16,
      hoursPerWeek: 20,
      totalHours: 320,
    },
    skillsCovered: [
      'M-of-N multisig governance design',
      'Escrow state machines and dispute resolution',
      'Fee routing and per-asset configuration',
      'Upgrade safety and migration patterns',
      'Event-driven architecture for indexers',
      'Security invariants and formal verification concepts',
      'Off-chain oracle integration patterns',
      'Multi-sig wallet administration',
      'Reentrancy protection and access control',
      'Production monitoring and incident response',
    ],
    courseCount: 14,
    projects: 8,
    certificateAvailable: true,
    price: {
      amount: 399,
      currency: 'USD',
    },
    learningOutcomes: [
      'Design and implement DAO governance systems',
      'Build production-grade DeFi protocols on Soroban',
      'Implement secure upgrade and migration patterns',
      'Architect event ingestion pipelines',
      'Conduct security audits of Soroban contracts',
    ],
    targetAudience: [
      'Senior Rust/Soroban developers',
      'DeFi protocol architects',
      'DAO governance designers',
      'Blockchain security researchers',
    ],
    toolsAndTechnologies: [
      'Soroban SDK 23',
      'Stellar CLI and Soroban RPC',
      'Multisig wallet infrastructure',
      'Horizon event stream',
      'Supabase / PostgreSQL',
      'Docker',
      'Prometheus / Grafana',
      'GitHub Actions CI/CD',
    ],
  },
];
