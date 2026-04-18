import Image from 'next/image';

const HIGH_LEVEL_DIAGRAM = `flowchart LR
  U[User Browser] --> FE[Next.js Frontend\\nApp Router UI]
  FE --> AV[/api/avatar proxy route/]
  AV --> GA[Google Avatar Hosts\\ngoogleusercontent.com]

  FE -->|REST JSON / FormData / SSE| BE[NestJS Backend API]

  subgraph BE_MOD[Backend Modules]
    AUTH[Auth Module\\nJWT + Google OAuth]
    CHAT[Chat Module\\nConversations + SSE stream]
    RAG[PDF RAG Module]
    PDF[PDF Generator Module]
    IMG[Image Reader Module]
    GEM[Gemini Service]
    EMB[Embedding Service\\nXenova MiniLM]
    VEC[Vector Service]
  end

  BE --> AUTH
  BE --> CHAT
  BE --> RAG
  BE --> PDF
  BE --> IMG
  RAG --> EMB
  RAG --> VEC
  CHAT --> GEM
  RAG --> GEM
  PDF --> GEM
  IMG --> GEM

  AUTH --> M[(MongoDB\\nusers)]
  CHAT --> M2[(MongoDB\\nconversations/messages)]
  RAG --> M3[(MongoDB\\ndocumentrecords)]
  VEC --> Q[(Qdrant\\nrag_chunks)]

  GEM --> GAI[Google Gemini API]
  AUTH --> GOOG[Google OAuth]

  FE -. token in local/session storage .-> FE`;

const CHAT_STREAM_DIAGRAM = `sequenceDiagram
  participant B as Browser Chat UI
  participant F as Frontend API Client
  participant A as Backend /chat/:id/stream
  participant G as Gemini Service
  participant DB as MongoDB

  B->>F: Send prompt
  F->>A: POST stream (JWT)
  A->>DB: Save user message
  A->>G: streamText(...)
  G-->>A: token chunks
  A-->>F: SSE chunk events
  F-->>B: Live message rendering
  G-->>A: done
  A->>DB: Save assistant message
  A-->>F: SSE done event`;

const DEPLOYMENT_DIAGRAM = `flowchart TB
  U[Users]
  DNS[Public Internet / DNS / TLS]

  subgraph VERCEL[Vercel]
    FE[Next.js Frontend\\napps/frontend]
    AV[/api/avatar route\\nproxy google avatars/]
  end

  subgraph RENDER[Render]
    BE[NestJS Backend\\napps/backend]
  end

  subgraph DATA[Managed Data Services]
    MA[(MongoDB Atlas\\nusers + chats + docs)]
    QC[(Qdrant Cloud\\nrag_chunks vectors)]
  end

  subgraph GOOGLE[Google Platform]
    OAuth[Google OAuth]
    GAI[Gemini API]
    GAV[Google avatar hosts]
  end

  U --> DNS --> FE
  FE --> AV --> GAV
  FE -->|NEXT_PUBLIC_API_URL| BE
  BE --> MA
  BE --> QC
  BE --> GAI
  FE --> OAuth
  OAuth --> BE

  FE -. FRONTEND_URL allowlist .-> BE
  FE -. JWT in browser storage .-> FE`;

const ARCHITECTURE_FACTS = [
  { label: 'Architecture', value: 'Next.js + NestJS monorepo with modular backend services' },
  { label: 'Primary Protocols', value: 'REST JSON, multipart form-data, and SSE for streaming chat' },
  { label: 'Core Storage', value: 'MongoDB for app data and Qdrant for semantic vectors' },
  { label: 'Model Layer', value: 'Gemini API with retry, fallback routing, and stream support' },
];

const SERVICE_BOUNDARIES = [
  {
    layer: 'Experience',
    technology: 'Next.js App Router',
    responsibility: 'Chat UI, auth screens, tools UI, and same-origin avatar proxy route.',
  },
  {
    layer: 'API Gateway',
    technology: 'NestJS controllers + DTO validation',
    responsibility: 'Endpoint contracts, auth guards, throttling, and error boundaries.',
  },
  {
    layer: 'Intelligence',
    technology: 'Gemini service + prompt contracts',
    responsibility: 'Text generation, multimodal analysis, streaming responses, model fallback.',
  },
  {
    layer: 'Knowledge',
    technology: 'Embedding + Qdrant vector search',
    responsibility: 'Chunk indexing, semantic retrieval, and context-scoped document answers.',
  },
  {
    layer: 'Persistence',
    technology: 'MongoDB collections',
    responsibility: 'Users, conversations, messages, and document processing metadata.',
  },
];

const CRITICAL_FLOWS = [
  'Chat completion flow stores the user turn, streams assistant chunks via SSE, then persists the final response.',
  'RAG flow extracts PDF text, chunks and embeds content, stores vectors, retrieves relevant chunks, and answers with citations.',
  'Attachment chat flow preprocesses files (PDF/image/text), injects attachment context, then runs a normal chat completion.',
  'OAuth flow redirects through Google callback and issues a backend JWT for frontend session hydration.',
];

const QUALITY_CONTROLS = [
  'JWT-protected routes and Google OAuth integration for identity and session access control.',
  'Global request validation with strict DTO whitelisting and non-whitelisted field rejection.',
  'Rate limiting guard (Nest Throttler), plus Gemini retry/fallback for quota or model unavailability.',
  'Scoped vector filtering by user/document boundaries to prevent cross-tenant retrieval leakage.',
];

function toMermaidImageUrl(diagram: string) {
  return `https://mermaid.ink/img/${Buffer.from(diagram, 'utf8').toString('base64')}`;
}

export function SystemDesignDiagram() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 text-gray-100">
      <div className="rounded-3xl border border-white/10 bg-linear-to-r from-[#1f2430] to-[#1a1e27] p-6 md:p-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">Architecture Blueprint</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Gemini Clone System Design</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
          End-to-end view of the application stack, runtime boundaries, production deployment, and critical data paths
          across chat, document RAG, image analysis, and PDF generation.
        </p>
      </div>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold">Visual Diagrams</h2>
        <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white p-3">
          <figcaption className="px-1 pb-3 text-sm font-medium text-[#1f2737]">1. High-Level Architecture</figcaption>
          <Image
            src={toMermaidImageUrl(HIGH_LEVEL_DIAGRAM)}
            alt="High-level system design diagram"
            width={1600}
            height={900}
            unoptimized
            className="h-auto w-full"
          />
        </figure>

        <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white p-3">
          <figcaption className="px-1 pb-3 text-sm font-medium text-[#1f2737]">2. Chat Streaming Sequence</figcaption>
          <Image
            src={toMermaidImageUrl(CHAT_STREAM_DIAGRAM)}
            alt="Chat streaming sequence diagram"
            width={1600}
            height={900}
            unoptimized
            className="h-auto w-full"
          />
        </figure>

        <figure className="overflow-hidden rounded-2xl border border-white/10 bg-white p-3">
          <figcaption className="px-1 pb-3 text-sm font-medium text-[#1f2737]">3. Production Deployment Topology</figcaption>
          <Image
            src={toMermaidImageUrl(DEPLOYMENT_DIAGRAM)}
            alt="Deployment topology diagram with Vercel, Render, MongoDB Atlas, and Qdrant Cloud"
            width={1600}
            height={900}
            unoptimized
            className="h-auto w-full"
          />
        </figure>
      </section>

      <section className="space-y-5 rounded-2xl border border-white/10 bg-[#171b23] p-5 md:p-6">
        <h2 className="text-xl font-semibold">Architecture</h2>
        <div className="space-y-5">
          {ARCHITECTURE_FACTS.map((fact) => (
            <article key={fact.label}>
              <h3 className="text-sm font-semibold text-gray-200">{fact.label}</h3>
              <p className="mt-1 text-sm leading-7 text-gray-300">{fact.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#171b23] p-5 md:p-6">
        <h2 className="text-xl font-semibold">Critical Runtime Flows</h2>
        <ul className="space-y-2 text-sm leading-7 text-gray-300">
          {CRITICAL_FLOWS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#171b23] p-5 md:p-6">
        <h2 className="text-xl font-semibold">Security and Reliability Controls</h2>
        <ul className="space-y-2 text-sm leading-7 text-gray-300">
          {QUALITY_CONTROLS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Layered Service Boundaries</h2>
          <p className="text-sm text-gray-300">
            Responsibility matrix for core platform layers and their principal ownership.
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#171b23]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/3 text-gray-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Layer</th>
                <th className="px-4 py-3 font-semibold">Technology</th>
                <th className="px-4 py-3 font-semibold">Responsibility</th>
              </tr>
            </thead>
            <tbody>
              {SERVICE_BOUNDARIES.map((row) => (
                <tr key={row.layer} className="border-b border-white/6 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-200">{row.layer}</td>
                  <td className="px-4 py-3 text-gray-300">{row.technology}</td>
                  <td className="px-4 py-3 leading-7 text-gray-300">{row.responsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
