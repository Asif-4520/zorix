# Contributing to Zorix 🚀

First off, thank you for considering contributing to Zorix! It's people like you that make Zorix such a great tool for the web community.

As a contributor, you are helping us build a more accessible and powerful way to work with IndexedDB. Whether you're fixing a bug, improving documentation, or suggesting new features, we value your input.

---

## 🧭 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/Asif-4520/zorix/issues) to see if the problem has already been reported. When creating a bug report, please include:

- **Clear Title**: A concise summary of the issue.
- **Reproduction Steps**: How can we see the bug ourselves?
- **Environment**: Browser version, OS, and any specific hardware.
- **Expected vs. Actual**: What did you think would happen vs. what actually happened.

### ✨ Suggesting Enhancements

We love new ideas! If you have a suggestion:

1. Check if the feature is already planned in the [Roadmap](README.md#roadmap).
2. Open a [Feature Request](https://github.com/Asif-4520/zorix/issues/new?template=feature_request.yml).
3. Explain the "Why" — how does this help developers?

### 🛠️ Pull Requests

1. **Fork** the repository.
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/zorix.git`
3. **Branch**: Create a branch for your work: `git checkout -b feat/my-cool-feature` or `fix/that-annoying-bug`.
4. **Develop**: Write your code (follow the style guidelines below).
5. **Test**: Ensure all tests pass: `npm test`.
6. **Commit**: Use descriptive commit messages (we follow [Conventional Commits](https://www.conventionalcommits.org/)).
7. **Push**: `git push origin feat/my-cool-feature`
8. **Open PR**: Describe your changes clearly in the PR template.

---

## 🏗️ Development Setup

Zorix is built with **TypeScript** and uses **Rollup** for bundling.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Development Mode** (Watches files and rebuilds):
   ```bash
   npm run dev
   ```
3. **Run Unit Tests**:
   ```bash
   npm run test:unit
   ```
4. **Run E2E Browser Tests** (Requires Playwright):
   ```bash
   npm run test:e2e
   ```

---

## 🎨 Style Guidelines

We use **Prettier** for formatting and **ESLint** for linting to maintain a consistent codebase.

- **Format Code**: Run `npm run format` before committing.
- **Lint Code**: Run `npm run lint` to check for issues.
- **TypeScript Everything**: We use strict typing to ensure reliability.
- **Clean Code**: Follow the [SOLID principles](https://en.wikipedia.org/wiki/SOLID).
- **Document Your Code**: Use TSDoc comments for public APIs.
- **One PR, One Concern**: Keep your PRs focused.

---

## 🚀 Publishing New Versions

This project uses GitHub Actions for automated publishing.

1. **Update Version**: Change the version in `package.json`.
2. **Update Changelog**: Add the new version and changes to `CHANGELOG.md`.
3. **Commit & Push**: Commit your changes and push to `main`.
4. **Create Release**: Create a new release on GitHub.
   - Tag it with `vX.Y.Z`.
   - The `Publish to NPM` workflow will automatically trigger, run tests, and publish the package.

_Note: Since this is a scoped package (`@asif_4520/zorix`), it is published with **public access** by default. We have configured `publishConfig` in `package.json` to handle this._

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 💬 Need Help?

Feel free to open a [discussion](https://github.com/Asif-4520/zorix/discussions) or reach out on GitHub!

---

_Happy Coding!_ 🎈
