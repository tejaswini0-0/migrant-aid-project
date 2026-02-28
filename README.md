# AWAAZ: Voice Legal Aid for Indian Migrant Workers

AWAAZ is a free, mobile-first web application designed to help Indian construction and migrant workers understand their legal rights, report workplace incidents, and access immediate legal guidance without needing a lawyer or legal knowledge.

## Core Features

### 1. Voice-Based Incident Reporting

Users can report workplace problems by speaking in their native language. The app uses the Web Speech API to capture and transcribe incidents in real time.

- **12 Supported Languages**: Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Odia, Gujarati, Marathi, Punjabi, Rajasthani, and Bhojpuri
- **Dual Input Methods**: Voice recording or manual text entry
- **Real-time Transcription**: Live feedback as you speak with interim and final transcripts
- **Continuous Recording**: Automatic accumulation of transcripts across multiple speech segments, preventing data loss on natural pauses
- **Manual Text Fallback**: Full text input option for users without microphone access or speech recognition support

### 2. Automatic Incident Classification

The app analyzes user input to automatically identify the type of workplace violation:

- **Wage Theft**: Non-payment or delayed payment of wages
- **Document Confiscation**: Illegal seizure of identity documents (Aadhaar, passport, etc.)
- **Unsafe Working Conditions**: Injury-related incidents, lack of safety equipment, hazardous environments
- **Physical Abuse**: Assault, violence, or harmful treatment
- **Default Classification**: Falls back to wage theft for unmatched incidents

Each classification includes keyword-based detection across multiple languages to ensure accurate categorization regardless of how the worker describes their situation.

### 3. Legal Rights Education

For each incident type, the app provides:

- **Relevant Laws**: Citations of specific Indian legislation with section numbers
  - Payment of Wages Act, 1936
  - Bonded Labour System (Abolition) Act, 1976
  - Building & Other Construction Workers (BOCW) Act, 1996
  - Contract Labour (Regulation & Abolition) Act, 1970
  - Employees' Compensation Act, 1923
  - And more

- **Plain-Language Summaries**: Each law is explained in simple terms without legal jargon

- **Detailed Explanations**: Full context showing how the law applies to the worker's situation

- **Multi-Language Translations**: All laws and explanations are translated into 8 Indian languages (Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Gujarati, Punjabi)

### 4. Evidence Checklist

The app provides incident-specific evidence collection guidance:

- **Customized Checklists**: Different evidence requirements for wage theft, unsafe conditions, document confiscation, and abuse
- **Audio Instructions**: Each checklist item can be played aloud using Text-to-Speech
- **Practical Steps**: Clear, actionable guidance (e.g., "Screenshot your UPI messages", "Photograph the site signboard", "Get witness voice notes")
- **Multi-Language Support**: All instructions available in 8 languages
- **Prevention Tips**: Guidance like "Do NOT sign anything" to prevent workers from unknowingly waiving rights

Additional default checklist items:
- Photographing the site signboard with contractor details
- Recording UPI/bank payment history
- Collecting witness statements via voice notes
- Preserving vehicle numbers and identifying information

### 5. Legal Document Generation

For each incident, the app generates:

- **Complaint Draft**: A pre-filled template that the worker can use to file a formal complaint with labor authorities
- **Customized Content**: The draft includes the worker's own words (from their transcript) integrated into the official format
- **Authority Information**: Name, address, phone number, and working hours of the relevant government body (Labor Commissioner, District Magistrate, Police, etc.)
- **Copy-Paste Ready**: Formatted for immediate submission or professional printing

Example complaint includes:
- Properly addressed header to the correct authority
- Detailed problem statement from the worker's transcript
- Relevant legal references
- Call-to-action for formal action under applicable laws

### 6. Emergency Contact Directory

The **Help Screen** provides immediate access to critical helplines:

- **Labour Helpline** (1800-11-2229): National labor grievance system, free, 24/7
- **Police Emergency** (100): For abuse, threats, or immediate danger
- **NHRC Helpline** (14433): National Human Rights Commission for severe violations
- **Women Helpline** (181): Specialized support for women workers facing harassment
- **Child Helpline** (1098): For child labor situations

### 7. AI-Powered Legal Chatbot

An interactive assistant powered by the Groq API (using Meta's Llama 3.1 model) that:

- **Answers Worker Questions**: Address any queries about labor rights, complaint procedures, or legal protections
- **Bilingual Responses**: Automatically responds in the user's preferred language (regional language first, then English)
- **Simple Language**: Explanations designed for workers without legal background
- **Step-by-Step Guidance**: Breaks down complex procedures into actionable steps
- **Offline FAQ Database**: 10 pre-built questions and answers accessible without internet (covering wages, documents, complaints, evidence, dismissal, injury compensation, BOCW Act, wage deductions, women's rights, and threat response)

Quick prompts for common questions:
- "My wages haven't been paid"
- "My documents were taken"
- "I was injured at work"
- "My employer is threatening me"
- "What is minimum wage?"
- "How to file a complaint?"

### 8. Frequently Asked Questions

Pre-compiled FAQ covering critical topics:

- Minimum wage entitlements and state variations
- Document confiscation (Aadhaar/passport) and bonded labor laws
- Filing complaints without a lawyer
- Evidence requirements and collection methods
- Employer threats and victimization
- Work injury compensation procedures
- BOCW Act scope and benefits
- Legal and illegal wage deductions
- Women worker-specific protections
- Wrongful dismissal procedures

### 9. Worker Rights Reference

A comprehensive list of fundamental worker rights:

- Minimum wage protection and legal enforceability
- Safe working conditions and free safety equipment
- Compensation for work-related injuries
- Free access to complaint procedures
- Protection of identity documents
- Freedom from abuse and harassment
- Equal pay for equal work
- Maternity benefits
- Right to unionize
- BOCW Welfare Board access

### 10. Text-to-Speech Accessibility

The entire app supports audio playback:

- **Multi-Language TTS**: Supports all 12+ supported languages including regional Indian languages
- **Intelligent Voice Selection**: Waits for Web Speech API voices to load asynchronously, then selects the best matching voice for each language
- **Sentence-by-Sentence Delivery**: Long text is automatically split on sentence boundaries to avoid truncation
- **Interactive Playback**: Click any text segment to hear it read aloud
- **Play/Pause Controls**: Stop playback and resume at any time
- **Speed Control**: Adjustable speech rate for clarity

Fallback mechanism for unsupported voices ensures the browser always attempts audio playback using the closest available voice.

### 11. Multi-Language Support

The app serves 12 languages with consistent experience across all features:

The app maintains language selection across sessions and applies it to:
- Voice recognition and transcription
- Text-to-speech output
- UI labels and navigation
- Legal translations
- Evidence checklists
- Chatbot responses

Language metadata includes both English and native script labels for user clarity.

### 12. Navigation & Session Management

The app uses a bottom navigation bar with four primary screens:

- **Home**: Landing page with language selection and quick access to core features
- **Record**: Voice/text incident input screen
- **My Case**: Rights and legal information screen showing analysis results
- **Help**: Emergency contacts, FAQ, rights education, and AI chatbot

Navigation state is independent of screen content, allowing users to switch between screens without losing their analysis.

### 13. Progressive Web App (PWA)

The app is built as a PWA for offline access and mobile installation:

- **Service Worker**: Registered at app load for offline functionality
- **Manifest File**: Includes app metadata, icons, colors, and display settings
  - App name: "AWAAZ Voice Legal Aid App"
  - Start URL: Application entry point for installed app
  - Display: Standalone app mode (full screen, no browser chrome)
  - Theme & Background Colors: Configured for dark theme
  - Orientation: Portrait mode for mobile-first design
  - Scope: Limited to app directory

- **Mobile Meta Tags**: Optimized for mobile browsers
  - Viewport configuration for responsive design
  - Full-screen and status bar styling for iOS
  - Apple mobile-web-app capability flags
  - Safe area inset support for notched devices

- **Install Prompts**: Compatible with browser install dialogs on Android and desktop

### 14. Design & Accessibility

**Visual Design**:
- Dark theme optimized for low-light environments (common in migrant worker settings)
- High-contrast color scheme (amber #F59E0B against dark background) for readability
- Large touch targets for mobile usability (minimum 44x44 pixels)
- Responsive layout scaling from phones to tablets

**Keyboard & Screen Reader Support**:
- Full keyboard navigation via semantic HTML
- ARIA labels for icon-only buttons
- TTS support for all text content

**Performance**:
- Vite-based build process for fast load times
- React 18 with optimized rendering
- Lucide React icons (lightweight, tree-shakeable)
- Tailwind CSS for minimal CSS bundle size

## Technical Architecture

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1 with PostCSS
- **Icons**: Lucide React 0.344.0
- **API Client**: Supabase JS 2.57.4 (for future backend integration)

### APIs & External Services
- **Speech Recognition**: Web Speech API (browser native)
- **Text-to-Speech**: Web Speech Synthesis API (browser native)
- **Legal AI**: Groq API with Llama 3.1 8B model for chatbot
- **Backend Ready**: Designed for FastAPI backend integration for advanced incident analysis

### Key Libraries & Components

**VoiceRecordScreen**:
- Manages continuous speech-to-text transcription
- Handles audio blob recording
- Supports dual input (voice and text)
- Accumulates transcript across speech pauses

**RightsScreen**:
- Displays classified incident analysis
- Shows legal information with interactive expansion
- Exports complaint draft as text
- Provides PDF download capability (future)
- Language switcher for law translations

**EvidenceScreen**:
- Customized checklist based on incident type
- Audio playback for each checklist item
- Multi-language instructions for evidence collection
- Visual completion tracking

**HelpScreen**:
- Emergency contact cards with direct call buttons
- Expandable FAQ sections
- Worker rights reference list
- Interactive chatbot with voice I/O
- Real-time AI responses with language awareness

**BottomNav & Navigation**:
- Fixed bottom navigation for mobile
- Screen state management
- Language persistence across navigation
- Analysis data passing between screens

## Data Flow

1. **User Language Selection**: Language selection on landing page is saved to localStorage
2. **Incident Input**: User speaks or types their problem
3. **Transcript Handling**: Input is captured as structured SubmissionPayload
4. **Analysis**: Keyword-based classification determines incident type
5. **Results Generation**: Relevant laws, checklists, and complaint draft are prepared
6. **Multi-Screen Workflow**: User moves through Evidence → Rights screens with persistent data
7. **Export Ready**: Complaint draft can be copied/downloaded for authority submission

## Configuration & Deployment

### Environment Variables
- `VITE_API_BASE_URL`: Backend API endpoint (defaults to dev server)
- `VITE_GROQ_API_KEY`: API key for Groq LLM service (required for chatbot)

### Build Commands
- `npm run dev`: Start development server with Vite
- `npm run build`: Production build with TypeScript checking
- `npm run preview`: Preview production build locally
- `npm run lint`: Code quality checks with ESLint
- `npm run typecheck`: TypeScript compilation check

### Deployment Ready
- Vercel-optimized (vercel.json configured)
- Environment variables support for Vercel deployment
- Service worker for offline functionality
- Manifest for PWA installation

## Accessibility & Language Considerations

The app is designed specifically for Indian migrant and construction workers:

- **No Reading Requirement**: Voice-first interface eliminates literacy barriers
- **Regional Languages**: 12 major Indian languages supported with native script labels
- **Cultural Context**: References Indian labor laws and procedures
- **No Cost**: Completely free (open source architecture)
- **Offline First**: Works without constant internet (PWA with service worker)
- **Mobile Only**: Designed for devices workers actually use

## Use Cases

1. **Wage Theft**: Worker documents unpaid wages and gets a complaint template ready to file with Labor Commissioner
2. **Document Seizure**: Worker discovers this is illegal bonded labour and gets contact for District Magistrate
3. **Workplace Injury**: Worker learns their compensation rights and collects proper evidence
4. **Threats & Harassment**: Worker escalates to police and labor authorities with prepared documentation
5. **General Rights**: Worker uses chatbot to understand minimum wage, maternity benefits, etc.

## Future Enhancements

The architecture supports:
- Backend incident analysis with NLP for higher accuracy
- Audio response generation via IndicTTS for full voice UI
- AI-generated PDF complaints with official formatting
- Automated FIR filing for severe incidents
- NGO partner referral system
- Case tracking and follow-up reminders
- Offline mode for complete internet independence
