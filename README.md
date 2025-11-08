<div align="center">
  <img src="https://storage.googleapis.com/aai-cdn-files/icons/culina-sync-logo.png" alt="CulinaSync Logo" width="150">
  <h1 style="border-bottom: none;">CulinaSync: The Intelligent Kitchen OS</h1>
  <p>
    <strong>A Local-First, AI-Powered Progressive Web App for the Modern Household</strong>
    <br />
    <em>Mobile-First. Offline-Capable. Privacy-Centric. Seamlessly Integrated.</em>
  </p>
  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React">
    <img src="https://img.shields.io/badge/Powered%20by-Gemini%20API-purple.svg" alt="Gemini API">
  </p>
  <p>
    <em>This project was developed in an iterative dialogue with <a href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC">Google's AI Studio</a>.</em>
  </p>
</div>

---

## 🚀 Vision: Your Proactive Culinary Partner

CulinaSync transcends the traditional recipe app. It is architected to be a **proactive, intelligent kitchen operating system**—a central hub that streamlines the entire culinary lifecycle for your household. Our vision is to transform the daily question of "What should I cook?" into a confident "This is what I'm cooking," backed by intelligent, data-driven assistance.

From inspiration and meal planning to smart shopping and interactive cooking, CulinaSync is designed to be a seamless, intuitive partner in your kitchen.

## 🏛️ Core Architectural Philosophy

Our development is guided by three unwavering principles that define the user experience:

1.  **🔒 Local-First & Privacy by Design:** Your data is yours. Period. All your recipes, pantry items, and meal plans reside exclusively on your device, powered by IndexedDB. This guarantees maximum performance, true offline functionality, and uncompromising privacy. There is no cloud backend, no user tracking, and no data monetization.

2.  **📱 Mobile-First, Universally Accessible:** CulinaSync is engineered for the device you always have with you—your phone. Every feature is optimized for touch-based, on-the-go interaction. Through progressive enhancement, the interface elegantly scales to provide an equally powerful experience on tablets and desktops, ensuring functionality is never sacrificed for form factor.

3.  **🧠 Intelligent & Context-Aware Assistance:** We leverage the power of the Google Gemini API not as a gimmick, but as an integrated intelligence layer. The AI is context-aware, considering your pantry inventory, dietary preferences, and explicit cravings to provide genuinely useful, personalized culinary guidance.

---

## ✨ Feature Showcase

CulinaSync provides an integrated suite of tools covering the entire culinary workflow.

### Core Modules
- 🥫 **Intelligent Pantry Management:** A real-time inventory of your supplies. Add items, track quantities, and set expiry dates. The pantry is the foundational data source for all intelligent features.
- 📚 **Personal Recipe Book:** Your digital culinary library. Save AI-generated recipes, manually add your own, and build a personalized, searchable collection.
- 📅 **Dynamic Meal Planner:** Plan your meals with a fluid, drag-and-drop interface. Optimized for mobile weekly views and expansive desktop planning.
- 🛒 **Automated Shopping List:** The smartest shopping list you've ever used. It automatically populates based on your meal plan, cross-references your pantry, and eliminates redundant purchases.

### AI & Intelligence
- 🤖 **AI Chef (Gemini-Powered):** Transform abstract cravings into concrete, delicious recipes. The AI Chef considers your pantry, preferences, and desired modifiers (e.g., "quick," "healthy") to generate unique recipe ideas and full, detailed cooking instructions.
- 🔍 **Pantry-Aware Matching:** Every recipe in your cookbook is automatically scored against your current pantry inventory, showing you at a glance what you can cook *right now*. This matching is debounced and efficiently calculated on data changes.
- 🗣️ **Advanced Voice Control:** A comprehensive voice command system allows for hands-free operation. Navigate the app, add items to your pantry or shopping list, and control the Kochmodus without touching the screen.

### User Experience & Workflow
- 🍳 **Interactive Cook Mode:** A distraction-free, full-screen cooking interface that guides you step-by-step.
    - **Screen Wake Lock:** Your screen stays on, so you don't have to unlock your device with messy hands.
    - **Text-to-Speech:** Have instructions read aloud to you, with controls to repeat or pause.
    - **Full Voice Navigation:** Move between steps ("next step," "previous step") or exit the mode ("end cook mode") entirely hands-free.
- ⌨️ **Command Palette (`⌘K` / `Ctrl+K`):** A power-user feature for instant navigation and action execution. Search for recipes, pantry items, or commands from anywhere in the app.
- 🔄 **Data Portability:** Full import/export functionality for all your data in standard JSON format. You have complete ownership and control.
- 📱 **Full PWA Capabilities:** Installable on your home screen for a native-app feel, with complete offline access to all core features.

---

## 🛠️ Technical Deep Dive & Architecture

CulinaSync is built on a modern, robust, and performant technology stack chosen to support our core philosophy.

-   **Framework & Language:** [**React 19**](https://react.dev/) with [**TypeScript**](https://www.typescriptlang.org/). We leverage functional components and an extensive suite of custom hooks for a declarative, type-safe, and highly maintainable codebase.

-   **Styling:** [**Tailwind CSS**](https://tailwindcss.com/). A utility-first CSS framework enables rapid, consistent, and responsive UI development directly within our components, adhering to our mobile-first design principle.

-   **State Management:**
    -   **Global State:** [**Redux Toolkit**](https://redux-toolkit.js.org/) provides a centralized, predictable state container for application-wide data like UI state and settings.
    -   **Persistence:** `redux-persist` is used to save non-sensitive global state (like user settings) to local storage, ensuring a consistent experience across sessions.
    -   **Local State:** React's built-in `useState` and `useReducer` hooks are used for component-level, ephemeral state.

-   **Data Layer (Local-First):**
    -   **Database:** We use the browser's [**IndexedDB**](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) as a powerful, persistent, on-device database.
    -   **ORM/Wrapper:** [**Dexie.js**](https://dexie.org/) provides an elegant, promise-based API over IndexedDB, simplifying database schema management, transactions, and complex queries.
    -   **Reactivity:** `dexie-react-hooks` (`useLiveQuery`) bridges Dexie with React, creating a reactive data layer where UI components automatically re-render when the underlying data in IndexedDB changes.

-   **AI Integration:**
    -   **API:** The official [`@google/genai`](https://www.npmjs.com/package/@google/genai) SDK is used to interface with the **Google Gemini API**.
    -   **Structured Output:** We leverage Gemini's JSON mode and provide a detailed `responseSchema` for recipe generation. This ensures the AI's output is reliable, parseable, and directly usable within the application's data structures, minimizing errors and post-processing.

-   **PWA & Offline Functionality:**
    -   **Service Worker:** [**VitePWA**](https://vite-pwa-org.netlify.app/) orchestrates the generation and management of a service worker.
    -   **Strategy:** We employ a `autoUpdate` registration and a cache-first strategy for assets, ensuring the app loads instantly and works seamlessly offline.

-   **Build & Development:**
    -   **Bundler:** [**Vite**](https://vitejs.dev/) offers a lightning-fast development experience with Hot Module Replacement (HMR) and an optimized production build process.
    -   **Icons:** [**Lucide React**](https://lucide.dev/) for a clean, consistent, and tree-shakable icon set.

---

## 🏁 Getting Started

To run CulinaSync locally for development, follow these steps:

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/your-username/CulinaSync.git
    cd CulinaSync
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Configure Environment Variables**
    The AI features require a Google Gemini API key. Create a `.env.local` file in the project root:
    ```env
    # Obtain your key from Google AI Studio and replace YOUR_API_KEY
    VITE_API_KEY=YOUR_API_KEY
    ```
    *Note: The `VITE_` prefix is required for Vite to expose the variable to the client-side code.*

4.  **Run the Development Server**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

### Available Scripts

-   `npm run dev`: Starts the development server with HMR.
-   `npm run build`: Compiles and bundles the application for production.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run preview`: Serves the production build locally for testing.

---

## 🚀 Deployment

The repository includes configuration for seamless deployment to **Google Cloud Run** via **Cloud Build**.

-   **`Dockerfile`:** A multi-stage Dockerfile that first builds the static React assets and then serves them using a lightweight Nginx container.
-   **`cloudbuild.yaml`:** A CI/CD pipeline definition for Cloud Build. It automates building the Docker image, pushing it to Google Container Registry, and deploying it as a new revision to the Cloud Run service.

To deploy, execute the following `gcloud` command from the project root:
```sh
gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_API_KEY="YOUR_API_KEY"
```

---

## 📂 Project Structure

The project follows a feature-oriented and modular structure to ensure scalability and maintainability.

```
/
├── public/                # Static assets (icons, manifest.json)
├── src/
│   ├── components/        # Reusable React components (UI elements, pages)
│   ├── contexts/          # React Context providers for localized state
│   ├── data/              # Static data, including seed recipes
│   ├── hooks/             # Custom React Hooks for shared logic (e.g., useDebounce)
│   ├── services/          # Core business logic, API clients (Gemini), DB interactions (Dexie)
│   ├── store/             # Redux Toolkit setup (store, slices, middleware)
│   ├── types.ts           # Global TypeScript type definitions
│   ├── App.tsx            # Root component, routing, and global layout
│   └── index.tsx          # Application entry point
├── .env.local             # Local environment variables (untracked)
├── Dockerfile             # Container definition for deployment
├── cloudbuild.yaml        # CI/CD configuration for Google Cloud Build
└── vite.config.ts         # Vite build and PWA configuration
```

---

## 🗺️ Future Roadmap

CulinaSync is an actively evolving project. Key areas for future development include:
- [ ] **Multi-Device Sync:** Optional, end-to-end encrypted synchronization of data across user devices.
- [ ] **Barcode Scanning:** Quickly add pantry items by scanning their barcodes.
- [ ] **Recipe Import:** Import recipes directly from your favorite cooking websites.
- [ ] **Advanced Sharing:** Share meal plans or shopping lists with other household members.
- [ ] **Nutritional Analysis:** Deeper integration of nutritional data and tracking.
