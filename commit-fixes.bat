@echo off
echo Committing test fixes...
git add .
git commit -m "Fix CI/CD pipeline and test configuration

- Fix Python module import issues in tests
- Add proper pytest configuration
- Simplify GitHub Actions workflow
- Remove database dependency from basic tests
- Add proper environment variable mocking
- Fix npm cache configuration in CI"
git push
echo Done!
