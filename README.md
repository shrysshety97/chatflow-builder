# ChatForge - AI Chatbot Platform

A modern AI-powered chatbot platform built with React, TypeScript, and Supabase.

## 🏗️ Project Architecture

This project follows a **feature-based modular architecture** for scalability and maintainability.

```
├── src/
│   ├── features/           # Feature modules (domain-driven)
│   │   ├── auth/           # Authentication feature
│   │   ├── chat/           # Chat & messaging feature
│   │   ├── layout/         # Layout components
│   │   └── projects/       # Project management feature
│   ├── shared/             # Shared/common code
│   │   └── components/ui/  # Reusable UI components (shadcn/ui)
│   ├── hooks/              # Global custom hooks
│   ├── integrations/       # Third-party integrations
│   ├── lib/                # Utility libraries
│   ├── pages/              # Route pages
│   └── types/              # Global type definitions
│
├── supabase/
│   └── functions/          # Edge Functions (Backend)
│       ├── _shared/        # Shared backend utilities
│       │   ├── config.ts   # Configuration constants
│       │   ├── cors.ts     # CORS handling
│       │   ├── logger.ts   # Logging utilities
│       │   ├── types.ts    # Shared types
│       │   └── validation.ts # Request validation
│       └── chat/           # Chat completion function
│           └── index.ts
```

---

## 📁 Frontend Structure

### Feature Modules (`src/features/`)

Each feature module is self-contained with its own:
- **components/** - Feature-specific UI components
- **context/** - React context providers
- **hooks/** - Custom hooks
- **pages/** - Feature pages
- **services/** - API/business logic
- **types/** - TypeScript types
- **index.ts** - Barrel export

#### Auth Feature (`src/features/auth/`)
```
auth/
├── components/
│   └── AuthForm.tsx        # Login/Register form
├── context/
│   └── AuthContext.tsx     # Auth state management
├── pages/
│   └── AuthPage.tsx        # Auth page layout
├── services/
│   └── auth.service.ts     # Supabase auth operations
├── types/
│   └── auth.types.ts       # User, AuthState types
└── index.ts                # Exports
```

#### Chat Feature (`src/features/chat/`)
```
chat/
├── components/
│   ├── ChatInput.tsx       # Message input with file upload
│   ├── ChatMessage.tsx     # Message bubble component
│   └── FilePreview.tsx     # File attachment preview
├── hooks/
│   ├── useChat.ts          # Chat streaming logic
│   └── useFileUpload.ts    # File upload handling
├── services/
│   ├── ai.service.ts       # AI API integration
│   ├── file.service.ts     # File storage operations
│   └── message.service.ts  # Message CRUD operations
├── types/
│   └── chat.types.ts       # Message, FileAttachment types
└── index.ts
```

#### Projects Feature (`src/features/projects/`)
```
projects/
├── components/
│   ├── CreateProjectModal.tsx   # New project dialog
│   └── ProjectSettingsModal.tsx # Project settings
├── context/
│   └── ProjectContext.tsx       # Project state management
├── services/
│   └── project.service.ts       # Project CRUD operations
├── types/
│   └── project.types.ts         # Project types
└── index.ts
```

---

## ⚙️ Backend Structure (Edge Functions)

### Shared Utilities (`supabase/functions/_shared/`)

| File | Purpose |
|------|---------|
| `types.ts` | Shared TypeScript interfaces |
| `cors.ts` | CORS headers and response helpers |
| `config.ts` | Configuration constants |
| `validation.ts` | Request validation utilities |
| `logger.ts` | Structured logging |

### Chat Function (`supabase/functions/chat/`)

The chat function follows a **controller-service-gateway pattern**:

```typescript
// Controller: Request routing
handleRequest(req) → processChat(body)

// Service: Business logic
processChat(body) → callAIGateway(...)

// Gateway: External API calls
callAIGateway(apiKey, messages) → Response
```

---

## 🔐 Authentication

- **Provider**: Supabase Auth
- **Methods**: Email/Password
- **Auto-confirm**: Enabled for development

## 💾 Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `projects` | AI chatbot projects |
| `chat_sessions` | Conversation sessions |
| `messages` | Chat messages with attachments |

## 🛡️ Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- JWT validation in edge functions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Supabase | Backend (Auth, DB, Storage) |
| TanStack Query | Data fetching |
| React Router | Routing |
| Sonner | Toast notifications |
| Lucide React | Icons |

---

## 🎨 Design System

### Colors (HSL-based)
- `--primary`: Teal accent
- `--secondary`: Dark blue
- `--background`: Deep dark blue
- `--chat-user`: User message color
- `--chat-assistant`: AI message color

### Components
All UI components use semantic design tokens from `index.css` and `tailwind.config.ts`.

---

## 📝 API Reference

### Chat Endpoint
```
POST /functions/v1/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "systemPrompt": "You are a helpful assistant."
}

Response: Server-Sent Events (streaming)
```

---

## 🤝 Contributing

1. Follow the feature-based architecture
2. Use TypeScript strictly
3. Export via barrel files (index.ts)
4. Keep components focused and small
5. Use semantic color tokens

---

## 📄 License

MIT License
