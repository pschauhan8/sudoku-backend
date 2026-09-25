# Sudoku Backend Engine (NestJS & AWS Lambda)

High-performance Sudoku generator, backtracking solver, validator, hint assistant, and deterministic daily challenge engine built with NestJS and TypeScript.

## 🚀 Features

- **Puzzle Generation**: Guaranteed unique single-solution puzzles across 4 difficulty tiers:
  - `Easy`: 38–44 initial clues
  - `Medium`: 30–35 initial clues
  - `Hard`: 26–29 initial clues
  - `Expert`: 22–25 initial clues
- **Deterministic Daily Challenges**: Uses Mulberry32 PRNG seeded with current date (`YYYY-MM-DD`) so all global players receive the exact same daily puzzle.
- **Rule Validator**: Detects duplicate conflict cells across rows, columns, and 3x3 blocks.
- **Logical Hint Engine**: Detects Naked Singles, Hidden Singles, and deductive next moves with explanations.
- **Swagger Documentation**: Interactive OpenAPI documentation at `/docs`.
- **Lowest AWS Cost Deployment**: Configured for **AWS Lambda + HTTP API Gateway** ($0 idle cost, within AWS 1M free requests/month forever) as well as Docker containerization.

---

## 🛠 Local Setup

```bash
npm install
npm run start:dev
```

- Server: `http://localhost:3000`
- Swagger OpenAPI: `http://localhost:3000/docs`

### Run Tests:
```bash
npm run test
```

---

## ☁ AWS Deployment ($0 Idle Cost)

### Option 1: AWS Lambda Serverless (Recommended)
```bash
npm run build
npm install -g serverless
serverless deploy
```

### Option 2: Docker / AWS App Runner / ECS
```bash
docker build -t sudoku-backend .
docker run -p 3000:3000 sudoku-backend
```
