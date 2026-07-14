# StadiumIQ 2026 — GenAI Stadium Operations & Fan Experience

StadiumIQ 2026 is a premium, AI-native stadium operations and tournament experience platform built for the **FIFA World Cup 2026 (USA · Canada · Mexico)**. It leverages generative AI, real-time data streaming, and automated decision-making layers to enhance the experience of fans, stadium staff, volunteers, and tournament organizers.

---

## 🏗️ System Architecture

The following diagram illustrates the relationship between the front-end persona dashboards, the underlying mock real-time data streams, and the **Google Gemini AI Orchestration Layer**:

```mermaid
graph TD
    %% User Personas
    subgraph Personas [User Interfaces]
        Fan[🎉 Fan Dashboard PWA]
        Staff[🛡️ Staff Portal]
        Vol[🤝 Volunteer App]
        Org[🎯 Organizer Hub]
    end

    %% GenAI Orchestration Layer
    subgraph AI [StadiumIQ AI Engine]
        Gemini[🤖 Gemini Client]
        RAG[📖 Venue & i18n Knowledge]
        Prompts[📝 Persona System Prompts]
        Gemini --> RAG
        Gemini --> Prompts
    end

    %% Data Streams
    subgraph Data [Real-Time Streams]
        WS[🔌 WebSocket Mock Stream]
        Crowd[👥 Crowd Density Feed]
        Transport[🚌 Transit Status Feed]
        Incidents[🚨 Incident Dispatch Logs]
        Sustain[🌱 Carbon & Energy Metrics]
        Match[⚽ Live Match stats]
        
        WS --> Crowd
        WS --> Transport
        WS --> Incidents
        WS --> Sustain
        WS --> Match
    end

    %% Interactions
    Fan <--> Gemini
    Staff <--> Gemini
    Vol <--> Gemini
    Org <--> Gemini

    Crowd --> Staff
    Crowd --> Org
    Transport --> Fan
    Transport --> Org
    Incidents --> Staff
    Incidents --> Vol
    Incidents --> Org
    Sustain --> Org
    Match --> Fan
    Match --> Org
```

---

## 🔄 User Workflow Sequences

### 1. Fan Navigation & Wayfinding Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Fan as Fan PWA User
    participant App as Fan Dashboard UI
    participant Nav as Navigation Module
    participant AI as Gemini AI Engine
    participant Crowd as Crowd Density Feed

    Fan->>App: Opens Wayfinding & enters Section 114
    App->>Nav: Query route to Section 114
    Nav->>Crowd: Request current congestion levels at Gate C & A
    Crowd-->>Nav: Gate A: CRITICAL (94%) | Gate C: LOW (45%)
    Nav->>AI: Draft directional query with Gate C route bypass
    AI-->>Nav: Returns natural language wayfinding & elevator tip
    Nav-->>App: Display crowd-aware paths & map route
    App-->>Fan: Show visual path avoiding Gate A + AI textual help
```

### 2. Organizer Situation Room & Decision Support Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Org as Tournament Organizer
    participant Hub as Organizer Hub
    participant Stream as Mock Incident Stream
    participant AI as Gemini AI Engine
    participant Staff as Staff Dispatch

    Stream->>Hub: Alert: Gate 7 crowd density critical (94%)
    Hub->>AI: Send prompt: "What should we do about Gate 7 congestion?"
    AI->>AI: Runs analysis & matches runsheet schedules
    AI-->>Hub: Returns Ranked Decision Options (Option 1: Open Gate 7B)
    Hub->>Org: Displays options with confidence levels (94%)
    Org->>Hub: Clicks "Approve Option 1"
    Hub->>Staff: Dispatches push notification to Gate 7 supervisors
```

---

## 🌟 Key Features

| Persona | AI Features | Live Metric Modules |
|---|---|---|
| **🎉 Fans** | • 50+ Language Voice Assistant<br>• Dynamic Match Commentary<br>• AI Departure Time Advisor | • Crowd-aware indoor mapping<br>• Transit arrivals & wait estimates<br>• Interactive Match Day Planner |
| **🛡️ Staff** | • Unstructured Accessibility Parser<br>• AI Incident Report Drafts<br>• Shift Briefing Generators | • Live Interactive Density Heatmaps<br>• Chart.js crowd trends<br>• Accessibility request queue |
| **🤝 Volunteers** | • Point-and-speak translation relay<br>• Structured Escalation logs<br>• Standard phrase translator | • Active Sector Crowd alerts<br>• Task management list |
| **🎯 Organizers** | • Situation Command Room<br>• Ranked Option Decision Engine<br>• Sustainability reports | • Carbon footprint status meters<br>• Real-time energy/water telemetry<br>• Runsheet audit gaps |

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5, CSS3, ES6+ Javascript
- **Visual styling**: Harmonious dark theme, glassmorphism card decks, responsive structural grids, CSS animations
- **PWA Capabilities**: Service worker caching (`sw.js`), configuration manifest (`manifest.json`), offline-first asset caching
- **AI Integrations**: Gemini completions & context wrappers (`gemini-client.js`)
- **Charting**: Chart.js library (density trends, carbon performance logs)
- **Data simulation**: WebSocket emulation script (`websocket-mock.js`)

---

## 🚀 How to Set Up Locally

Since the app is built on a vanilla, serverless PWA architecture, you can run it easily:

### Option 1: Quick Launch (Local Files)
1. Clone or download the directory.
2. Double-click [index.html](index.html) to open the dashboard interface in any browser.

### Option 2: Local HTTP Server (Recommended for PWA testing)
For service worker registration to activate, you need a local web host:
```bash
# If you have Python installed:
python -m http.server 8000

# If you have Node.js / NPM installed:
npx http-server -p 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 📦 Pushing to GitHub

To push all project codes to your own GitHub repository, follow these quick commands:

```bash
# 1. Initialize git in this folder
git init

# 2. Add all assets, styles, and scripts
git add .

# 3. Commit files
git commit -m "Initial commit of StadiumIQ 2026"

# 4. Create your repo on GitHub, then link and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stadiumiq.git
git push -u origin main
```
