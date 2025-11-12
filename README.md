# CalicoCare

An AI-powered elder care management platform that provides comprehensive care coordination, intelligent monitoring, and proactive interventions for seniors with chronic conditions like CHF (Congestive Heart Failure) and COPD.

## Features

### 🧠 AI-Powered Patient Triage
Advanced machine learning algorithms that instantly prioritize patient needs, ensuring critical cases receive immediate attention while optimizing care workflows.

### 📞 Agentic AI Phone Calls
Automated intelligent phone systems that conduct natural conversations with patients, handle appointment scheduling, and provide 24/7 support using VAPI integration.

### 🛡️ Predictive Health Monitoring
Real-time analysis of patient vitals and behavior patterns to predict health events before they occur, enabling proactive interventions.

### 📊 Intelligent Care Analytics
Comprehensive insights into care quality metrics, patient outcomes, and operational efficiency powered by advanced data analytics.

### 👥 Patient Management
Complete patient enrollment with personal information, medical conditions, and contact details.

### 📋 Care Plan Editor
Visual care plan builder with customizable cards for different care activities, timelines, and monitoring schedules.

### 💬 AI Triage Assistant
Multiple AI modules including triage designer, health reminders, health companion, and AI reports for comprehensive patient interaction.

### 📈 Health Metrics Dashboard
Real-time display of patient health metrics including weight, blood pressure, heart rate, and oxygen saturation.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI Integration**: VAPI (voice AI platform)
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **State Management**: TanStack Query
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or bun
- Supabase account
- VAPI account (optional, for phone call functionality)

### Installation

1. **Clone the repository**
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```sh
npm i
```

3. **Environment Setup**

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# VAPI Configuration (optional)
VITE_VAPI_API_KEY=your_vapi_api_key
VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id
VITE_VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
```

4. **Setup Supabase Database**

```sh
# Apply database schema
supabase db push

# Seed sample data (optional)
npm run seed:supabase
```

5. **Start development server**
```sh
npm run dev
```

The application will be available at `http://localhost:5173`.

## Database Schema

The application uses the following main tables:

- **patients**: Patient information and demographics
- **health_metrics**: Vital signs and health measurements
- **vapi_prompts**: Custom AI call prompts per patient
- **vapi_call_schedules**: Scheduled call configurations
- **vapi_calls**: Call execution logs and transcripts

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run seed:supabase` - Seed database with sample data

## Deployment

This project is configured for GitHub Pages deployment with a GitHub Actions workflow. The deployment automatically builds and deploys on pushes to the main branch.

### Manual Deployment

1. Build the project:
```sh
npm run build
```

2. The `dist` folder contains the production build that can be deployed to any static hosting service.

## Architecture

The application follows a modern React architecture with:

- **Component-based UI**: Reusable components built with shadcn/ui
- **Type-safe development**: Full TypeScript integration
- **Repository pattern**: Clean data access layer with Supabase
- **Service layer**: Business logic separation for VAPI integration
- **Responsive design**: Mobile-first approach with Tailwind CSS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is part of a demonstration application and is not intended for production use without proper security and compliance reviews.
