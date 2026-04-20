import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and verifies a password', async () => {
    const hash = await service.hash('correct-horse-battery-staple');
    expect(hash).toEqual(expect.any(String));
    expect(hash).not.toBe('correct-horse-battery-staple');

    await expect(service.verify(hash, 'correct-horse-battery-staple')).resolves.toBe(true);
    await expect(service.verify(hash, 'wrong password')).resolves.toBe(false);
  });

  it('returns false for a malformed hash without throwing', async () => {
    await expect(service.verify('not-a-real-hash', 'anything')).resolves.toBe(false);
  });
});
