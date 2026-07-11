import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectDeploymentsToPrune, summarizePrune } from '../lib/prune-deployments-logic.mjs';

const mk = (id, environment, created_at) => ({ id, environment, created_at });

describe('selectDeploymentsToPrune', () => {
  it('keeps the N newest per environment and prunes the rest', () => {
    const deployments = [
      mk(1, 'Production', '2026-01-01T00:00:00Z'),
      mk(2, 'Production', '2026-01-03T00:00:00Z'),
      mk(3, 'Production', '2026-01-02T00:00:00Z'),
      mk(4, 'Production', '2026-01-04T00:00:00Z'),
      mk(5, 'Preview', '2026-01-01T00:00:00Z'),
      mk(6, 'Preview', '2026-01-02T00:00:00Z'),
    ];
    const prune = selectDeploymentsToPrune(deployments, 2).map((d) => d.id).sort((a, b) => a - b);
    // Production keeps 4 & 2 (newest two) → prunes 1 & 3; Preview has only 2 → keeps both.
    assert.deepEqual(prune, [1, 3]);
  });

  it('does not prune when an environment has <= keep deployments', () => {
    const prune = selectDeploymentsToPrune([mk(1, 'x', 'a'), mk(2, 'x', 'b')], 3);
    assert.equal(prune.length, 0);
  });

  it('keep=0 prunes everything', () => {
    const prune = selectDeploymentsToPrune([mk(1, 'x', '2026-01-01T00:00:00Z')], 0);
    assert.equal(prune.length, 1);
  });

  it('breaks created_at ties by id (keeps the higher id)', () => {
    const same = '2026-01-01T00:00:00Z';
    const prune = selectDeploymentsToPrune([mk(1, 'x', same), mk(2, 'x', same)], 1);
    assert.deepEqual(prune.map((d) => d.id), [1]); // keeps id 2, prunes id 1
  });

  it('scopes per environment independently', () => {
    const deployments = [
      mk(1, 'A', '2026-01-01T00:00:00Z'),
      mk(2, 'A', '2026-01-02T00:00:00Z'),
      mk(3, 'B', '2026-01-01T00:00:00Z'),
    ];
    const prune = selectDeploymentsToPrune(deployments, 1).map((d) => d.id).sort((a, b) => a - b);
    assert.deepEqual(prune, [1]); // A keeps 2 prunes 1; B keeps its only one
  });
});

describe('summarizePrune', () => {
  it('reports total and prune counts per environment', () => {
    const scoped = [mk(1, 'A', 'a'), mk(2, 'A', 'b'), mk(3, 'B', 'c')];
    const toPrune = [mk(1, 'A', 'a')];
    assert.deepEqual(summarizePrune(scoped, toPrune), {
      A: { total: 2, prune: 1 },
      B: { total: 1, prune: 0 },
    });
  });
});
