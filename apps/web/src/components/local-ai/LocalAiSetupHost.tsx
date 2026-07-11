import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateSettings } from '../../store/slices/settingsSlice';
import { useTransientUiStore } from '../../store/transientUiStore';
import { LocalAiSetupModal, type LocalAiSetupCompletion } from './LocalAiSetupModal';

export const LocalAiSetupHost: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const currentPage = useAppSelector((state) => state.ui.currentPage);
  const localAiSetupRequested = useTransientUiStore((s) => s.localAiSetupRequested);
  const clearLocalAiSetupRequest = useTransientUiStore((s) => s.clearLocalAiSetupRequest);

  const open =
    !settings.localAi.setupWizardCompleted &&
    settings.localAi.enabled &&
    (currentPage === 'chef' || localAiSetupRequested);

  const handleComplete = async (completion: LocalAiSetupCompletion) => {
    const next = structuredClone(settings);
    next.localAi.setupWizardCompleted = true;
    if (completion.enableEmbeddings) {
      next.localAi.enableEmbeddings = true;
    }
    if (completion.enableWebLlmInference) {
      next.localAi.enableWebLlmInference = true;
    }
    dispatch(updateSettings(next));
    // QNBS-v3: Lazy-Load der Embeddings-Schicht | letzter Eager-Importeur von localAiEmbeddingsService — nur im Wizard-Abschluss-Callback gebraucht, hält den Service aus dem Initial-Load-Graph.
    const { reindexAllEmbeddings } = await import('../../services/localAiEmbeddingsService');
    await reindexAllEmbeddings(next);
  };

  const handleClose = () => {
    clearLocalAiSetupRequest();
  };

  return (
    <LocalAiSetupModal open={open} settings={settings} onComplete={handleComplete} onClose={handleClose} />
  );
};
