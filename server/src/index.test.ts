import test from 'node:test';
import assert from 'node:assert';
import { store } from './db/store.js';
import {
  MockVerificationProvider,
  ManualVerificationProvider,
  AmazonKdpVerificationProvider,
} from './providers/verification/PurchaseVerificationProvider.js';

test('Database Store has 24 seeded participants across 3 volumes', () => {
  assert.strictEqual(store.volumes.length, 3, 'Should have exactly 3 volumes');
  assert.strictEqual(store.participants.length, 24, 'Should have exactly 24 participants');

  const vol1People = store.participants.filter((p) => p.primaryVolumeId === '01');
  const vol2People = store.participants.filter((p) => p.primaryVolumeId === '02');
  const vol3People = store.participants.filter((p) => p.primaryVolumeId === '03');

  assert.strictEqual(vol1People.length, 8, 'Volume 01 should have 8 participants');
  assert.strictEqual(vol2People.length, 8, 'Volume 02 should have 8 participants');
  assert.strictEqual(vol3People.length, 8, 'Volume 03 should have 8 participants');
});

test('MockVerificationProvider verifies valid demo code and rejects invalid in dev', async () => {
  const provider = new MockVerificationProvider();
  assert.strictEqual(provider.isAvailable(), true);

  const validResult = await provider.verifyPurchase({
    userId: 'test-user',
    volumeId: '01',
    orderReference: 'PB-DEMO-01',
  });
  assert.strictEqual(validResult.success, true);
  assert.strictEqual(validResult.status, 'active');

  const invalidResult = await provider.verifyPurchase({
    userId: 'test-user',
    volumeId: '01',
    orderReference: 'INVALID-CODE',
  });
  assert.strictEqual(invalidResult.success, false);
  assert.strictEqual(invalidResult.status, 'rejected');
});

test('ManualVerificationProvider generates pending review requests', async () => {
  const provider = new ManualVerificationProvider();
  assert.strictEqual(provider.isAvailable(), true);

  const result = await provider.verifyPurchase({
    userId: 'test-user',
    volumeId: '02',
    orderReference: 'RECEIPT-PHOTO-12345',
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.status, 'pending');
});

test('AmazonKdpVerificationProvider is safely disabled with informative error', async () => {
  const provider = new AmazonKdpVerificationProvider();
  assert.strictEqual(provider.isAvailable(), false, 'KDP provider must remain disabled');

  const result = await provider.verifyPurchase({
    userId: 'test-user',
    volumeId: '01',
    orderReference: '112-9876543-1234567',
  });
  assert.strictEqual(result.success, false);
  assert.match(result.message, /desabilitada/i);
});

