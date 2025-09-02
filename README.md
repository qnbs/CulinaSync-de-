<div align="center">
  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYmJmMjQiIHN0cm9rZS1widthD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNiAxMy44N0E0IDQgMCAwIDEgNy40MSAxMWE0IDQgMCAwIDEgNS4xOC0yLjg3QTQgNCAwIDAgMSAxNi41OSAxMWExIDQgMCAwIDEgMS40MSAyLjg3Ii8+PHBhdGggZD0iTTggMThjMC0yLjY1IDIuNDItNC4yMiA1LTUuMjZzNS0yLjYxIDUtNS4yNmMwLTIuMi0xLjgtNC00LTQtMS41IDAtMi44Ljg0LTMuNSAyLjA2QzkuOCAzLjg0IDguNSAzIDcgM2MtMi4yIDAtNCAxLjgtNCA0IDAgMi42NSAyLjQyIDQuMjIgNSA1LjI2czUgMi42MSA1IDUuMjYiLz48cGF0aCBkPSJNNiAyMWgxMiIvPjwvc3ZnPg==" alt="CulinaSync Logo" width="150">
  <h1>CulinaSync: Your Smart Kitchen Assistant</h1>
  <p>
    <strong>Offline-First. Privacy-Centric. Seamless.</strong>
    <br />
    A Local-First Progressive Web App (PWA) to revolutionize your household's entire culinary lifecycle.
  </p>
  <p>
    <em>This project was developed and refined in a dialogue with <a href="https://ai.studio/apps/drive/1bQgaay6IODal47GVGZcn-65xgfu_PIDC">Google's AI Studio</a>.</em>
  </p>
</div>

---

## 🚀 Core Vision: From Recipe Archive to Proactive Kitchen Partner

CulinaSync is more than just another recipe app. It's a proactive, intelligent kitchen assistant designed to be the central hub for your household's culinary needs. The app supports the entire cooking process—from inspiration and meal planning to smart shopping, preparation, and pantry management.

Unlike traditional cloud-dependent applications, CulinaSync is built on a **local-first architecture**. Your data—your recipes, inventory, and plans—resides primarily on your device. The result is a lightning-fast, always-available, and completely private user experience that feels like a native app.

## ✨ Key Features

| Feature                | Description                                                                                                                                                            | Status      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 🥫 **Smart Pantry** | Manage your food inventory. Items, quantities, and expiration dates are used for intelligent recipe suggestions and shopping lists.                  | ✅ Available |
| 🤖 **AI Chef (Gemini API)**     | Get personalized recipe suggestions based on your pantry, preferences, and dietary goals. Turn "What should I cook?" into "This is what I'm cooking!". | ✅ Available |
| 📚 **Collaborative Cookbook**  | Collect, organize, and filter your favorite recipes. Every saved recipe becomes part of your personal, searchable cooking library.         | ✅ Available |
| 📅 **Dynamic Meal Planner**  | Plan meals with a drag-and-drop interface. Instantly see which ingredients are missing for planned dishes.                                      | ✅ Available |
| 🛒 **Automated Shopping List** | Generate a shopping list that automatically checks your meal plan against your pantry. Add items manually or with AI assistance.     | ✅ Available |
| 🗣️ **Voice Control**         | Control the app hands-free—add items, navigate, or check ingredients off your shopping list.                                         | ✅ Available |
| ⚙️ **Data Management**          | Export and import all your data as a JSON backup. You remain in full control.                                                               | ✅ Available |

## 🛠️ Tech Stack & Architecture

CulinaSync utilizes a modern, performant, and robust tech stack optimized for its local-first philosophy.

-   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/) for a type-safe, component-based UI.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a rapid, consistent, and customizable design system.
-   **Local Database:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) as a powerful, browser-native database.
-   **DB Abstraction:** [Dexie.js](https://dexie.org/) as an elegant and powerful wrapper for IndexedDB, simplifying database interaction and integrating seamlessly with React Hooks (`dexie-react-hooks`).
-   **AI & Generative AI:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`) for creating smart, context-aware recipes.
-   **PWA Functionality:** [VitePWA](https://vite-pwa-org.netlify.app/) for transforming the web app into an installable, offline-capable application.
-   **Build Tool:** [Vite](https://vitejs.dev/) for a lightning-fast development experience and optimized production builds.
-   **Icons:** [Lucide React](https://lucide.dev/) for a beautiful and consistent icon set.

## 🏛️ The Local-First Philosophy

The choice of a local-first architecture is the technical and ideological foundation of CulinaSync. It offers transformative advantages over cloud-centric models:

1.  **🚀 Performance & Zero Latency:** Actions execute instantly against the local IndexedDB. There are no loading spinners waiting for a network response.
2.  **🌐 True Offline Functionality:** Whether you're in a basement grocery store with no signal or on a plane, CulinaSync is always fully functional. An internet connection is only required for AI features.
3.  **🔐 Privacy & Data Ownership:** Your culinary data is private. With the source of truth on your device, sensitive information is not unnecessarily sent to third-party servers. You own your data.

## 🏁 Getting Started

Follow these steps to run the project locally:

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/qnbs/culinasync.git
    cd culinasync
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Configure Environment Variables**
    A Google Gemini API key is required for the AI features. Create a `.env.local` file in the project root and add your API key:
    ```env
    # Replace YOUR_API_KEY with your actual Google Gemini API Key
    API_KEY=YOUR_API_KEY
    ```

4.  **Run the Development Server**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

## 📂 Project Structure

The codebase is structured modularly by feature and responsibility to ensure maintainability and scalability.

```
/
├── public/                # Static assets (icons, manifest)
├── src/
│   ├── components/        # Reusable React components (UI)
│   ├── data/              # Static data (e.g., seed recipes)
│   ├── hooks/             # Custom React hooks (e.g., useDebounce, useSpeechRecognition)
│   ├── services/          # Business logic, API calls, DB interactions
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component and routing
│   └── index.tsx          # React application entry point
├── .env.local             # Example for local environment variables (unversioned)
├── vite.config.ts         # Vite build and plugin configuration
└── tsconfig.json          # TypeScript compiler configuration
```

## 🗺️ Roadmap

CulinaSync is a living project. Future planned enhancements include:

-   [ ] **Barcode Scanner:** Quickly add items to the pantry by scanning their EAN code.
-   [ ] **Multi-Device Sync (Optional):** A secure, end-to-end encrypted sync option for using the app across multiple devices.
-   [ ] **Recipe Importer:** Import recipes from popular cooking websites via URL.
-   [ ] **Nutrition Tracking:** Analyze and visualize nutritional information from the meal plan.
-   [ ] **Collaborative Households:** Share shopping lists and meal plans with other household members.