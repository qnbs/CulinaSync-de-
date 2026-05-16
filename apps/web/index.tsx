import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { registerSW } from 'virtual:pwa-register';
import { store, persistor } from './src/store';
import { addToast as addToastAction } from './src/store/slices/uiSlice';
import './src/index.css';
import i18n from './src/i18n';
import App from './src/App';
import { installGlobalErrorLogging, logAppError } from './src/services/errorLoggingService';
installGlobalErrorLogging();

const emitPwaEvent = (eventName: string) => {
  window.dispatchEvent(new CustomEvent(eventName));
};

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) {
      return;
    }

    registration.addEventListener('updatefound', () => {
      store.dispatch(addToastAction({ message: i18n.t('app.pwa.updateDownloading'), type: 'info' }));
      emitPwaEvent('culinasync:pwa-update-found');
    });
  },
  onNeedRefresh() {
    store.dispatch(addToastAction({ message: i18n.t('app.pwa.updateReady'), type: 'info' }));
    emitPwaEvent('culinasync:pwa-update-ready');
  },
  onOfflineReady() {
    store.dispatch(addToastAction({ message: i18n.t('app.pwa.offlineReady'), type: 'info' }));
  },
  onRegisterError(error) {
    void logAppError(error, 'service-worker.register');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);