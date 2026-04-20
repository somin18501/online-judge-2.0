import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info('Seeding database...');

  const passwordHash = await argon2.hash('Password1!', { type: argon2.argon2id });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@au.test' },
    update: {},
    create: {
      email: 'admin@au.test',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: 'demo@au.test' },
    update: {},
    create: {
      email: 'demo@au.test',
      username: 'demo',
      passwordHash,
      role: 'USER',
    },
  });

  const problems = [
    {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'EASY',
      statement:
        'Given an array of integers and a target, return indices of the two numbers such that they add up to target.',
      constraints:
        '2 <= n <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one solution exists.',
      examples: [
        {
          input: '4\n2 7 11 15\n9',
          output: '0 1',
          explanation: 'nums[0] + nums[1] = 2 + 7 = 9',
        },
      ],
      sample: [{ input: '4\n2 7 11 15\n9', expectedOutput: '0 1' }],
      hidden: [
        { input: '4\n3 2 4 6\n6', expectedOutput: '1 2' },
        { input: '2\n3 3\n6', expectedOutput: '0 1' },
      ],
      createdById: demo.id,
    },
    {
      slug: 'reverse-string',
      title: 'Reverse String',
      difficulty: 'EASY',
      statement: 'Read a single line from stdin and print it reversed.',
      constraints: '1 <= |s| <= 1000',
      examples: [{ input: 'hello', output: 'olleh' }],
      sample: [{ input: 'hello', expectedOutput: 'olleh' }],
      hidden: [
        { input: 'abc', expectedOutput: 'cba' },
        { input: 'level', expectedOutput: 'level' },
        { input: 'OpenAI', expectedOutput: 'IAnepO' },
      ],
      createdById: admin.id,
    },
    {
      slug: 'sum-of-n',
      title: 'Sum of First N Numbers',
      difficulty: 'MEDIUM',
      statement: 'Given N, print the sum of all integers from 1 to N.',
      constraints: '1 <= N <= 10^6',
      examples: [{ input: '5', output: '15' }],
      sample: [{ input: '5', expectedOutput: '15' }],
      hidden: [
        { input: '1', expectedOutput: '1' },
        { input: '100', expectedOutput: '5050' },
        { input: '1000', expectedOutput: '500500' },
      ],
      createdById: demo.id,
    },
  ] as const;

  for (const p of problems) {
    const existing = await prisma.problem.findUnique({ where: { slug: p.slug } });
    if (existing) continue;
    await prisma.problem.create({
      data: {
        slug: p.slug,
        title: p.title,
        statement: p.statement,
        constraints: p.constraints,
        examples: JSON.stringify(p.examples),
        difficulty: p.difficulty,
        visibility: 'PUBLISHED',
        createdById: p.createdById,
        testCases: {
          create: [
            ...p.sample.map((t, i) => ({
              input: t.input,
              expectedOutput: t.expectedOutput,
              isSample: true,
              order: i,
            })),
            ...p.hidden.map((t, i) => ({
              input: t.input,
              expectedOutput: t.expectedOutput,
              isSample: false,
              order: i,
            })),
          ],
        },
      },
    });
  }

  console.info('Seed complete.');
  console.info('  Admin: admin@au.test / Password1!');
  console.info('  Demo:  demo@au.test  / Password1!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
