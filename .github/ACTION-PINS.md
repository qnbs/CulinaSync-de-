# GitHub Actions — immutable SHA pins

Supply-chain policy: prefer full commit SHA with version comment (`# v7`).

| Action | SHA | Tag |
|--------|-----|-----|
| `actions/checkout` | `3d3c42e5aac5ba805825da76410c181273ba90b1` | v7 |
| `pnpm/action-setup` | `ea17c68df8912ef543352723c149a84f56e3d413` | v6.1.0 |
| `actions/setup-node` | `249970729cb0ef3589644e2896645e5dc5ba9c38` | v6 |
| `actions/upload-artifact` | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | v7 |
| `actions/cache` | `55cc8345863c7cc4c66a329aec7e433d2d1c52a9` | v6 |
| `actions/configure-pages` | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` | v6 |
| `actions/upload-pages-artifact` | `fc324d3547104276b827a68afc52ff2a11cc49c9` | v5 |
| `actions/deploy-pages` | `368f82528645a54fb793d4d04e342629a3f51346` | v5.0.1 |
| `github/codeql-action/init` | `2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2` | v4.38.2 |
| `github/codeql-action/analyze` | `2892aa5e19bbd11bc0cff5427e3b750a04d9e3c2` | v4.38.2 |
| `softprops/action-gh-release` | `efb35369e0ad2afab669f228072c1b0d510eae64` | v3.0.3 |
| `codecov/codecov-action` | `fb8b3582c8e4def4969c97caa2f19720cb33a72f` | v7.0.0 |
| `dtolnay/rust-toolchain` | `4cda84d5c5c54efe2404f9d843567869ab1699d4` | stable |
| `tauri-apps/tauri-action` | `1deb371b0cd8bd54025b384f1cd735e725c4060f` | v1 |

| `treosh/lighthouse-ci-action` | `3e7e23fb74242897f95c0ba9cabad3d0227b9b18` | v12 |

All listed actions are pinned in workflows. Update via `gh api repos/<owner>/<repo>/commits/<tag>`.

Update pins when bumping action versions; verify with `gh api repos/<owner>/<repo>/commits/<tag>`.
