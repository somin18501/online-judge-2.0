import { slugify, randomSuffix } from './slug';

describe('slugify', () => {
  it('converts titles into kebab-case slugs', () => {
    expect(slugify('Two Sum Problem')).toBe('two-sum-problem');
    expect(slugify('  Leading & trailing  ')).toBe('leading-trailing');
    expect(slugify('Álvaro Åström')).toBe('alvaro-astrom');
    expect(slugify('hello/world--again')).toBe('hello-world-again');
  });

  it('returns an empty string for non-slug-friendly input', () => {
    expect(slugify('***')).toBe('');
  });
});

describe('randomSuffix', () => {
  it('returns a string of the expected length', () => {
    expect(randomSuffix(6)).toHaveLength(6);
    expect(randomSuffix(10)).toHaveLength(10);
  });

  it('uses only alphanumeric characters', () => {
    expect(randomSuffix(32)).toMatch(/^[a-z0-9]+$/);
  });
});
