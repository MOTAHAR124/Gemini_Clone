# Example Prompts

## Chat

- "Design a scalable NestJS module architecture for LLM-based assistants."
- "Refactor this TypeScript function to be safer and explain tradeoffs."
- "Create a launch checklist for AI SaaS MVP to production."

## PDF RAG

- "List all payment obligations in this contract."
- "What are termination conditions?"
- "Extract deadlines and responsible parties."
- "Summarize the risks section in bullet points."

## PDF Generator

- "Generate a one-page resume for a senior backend engineer with Node.js and AWS expertise."
- "Create an invoice for a branding project with line items, tax, and total."
- "Write a board-level quarterly report with KPI table and executive summary."

## Image Reader

- "Extract every visible text string from this scanned document."
- "Describe this architecture diagram and list components and data flow."
- "What trends does this chart show from Q1 to Q4?"
- "Read this receipt and provide merchant, date, subtotal, tax, and total."

## Safety Prompt Examples (System)

- RAG mode: "Answer only from supplied context. If missing, return exactly `Not found in document`."
- Vision mode: "Use only visible evidence. If uncertain, clearly state uncertainty."
- General mode: "Prefer concise, factual answers and avoid fabricated details."