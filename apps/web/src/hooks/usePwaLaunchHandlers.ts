import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentPage } from '../store/slices/uiSlice';
import { useTransientUiStore } from '../store/transientUiStore';
import { getPageFromLocationSearch } from '../utils/pwaLaunchParams';
import {
  parseShareTargetFromSearch,
  stripShareTargetFromUrl,
  summarizeSharePayload,
} from '../utils/pwaShareTarget';
import { logAppError } from '../services/errorLoggingService';

export const usePwaLaunchHandlers = (): void => {
  const dispatch = useAppDispatch();
  const setPendingShareText = useTransientUiStore((s) => s.setPendingShareText);
  const setPendingLaunchFile = useTransientUiStore((s) => s.setPendingLaunchFile);

  useEffect(() => {
    const launchPage = getPageFromLocationSearch(window.location.search);
    if (launchPage) {
      dispatch(setCurrentPage({ page: launchPage }));
    }

    const share = parseShareTargetFromSearch(window.location.search);
    if (share) {
      setPendingShareText(summarizeSharePayload(share));
      dispatch(setCurrentPage({ page: 'chef' }));
      stripShareTargetFromUrl();
    }

    if (new URLSearchParams(window.location.search).get('pwa-file') === '1') {
      stripShareTargetFromUrl();
    }
  }, [dispatch, setPendingShareText]);

  useEffect(() => {
    if (!('launchQueue' in window)) {
      return;
    }

    const launchQueue = (
      window as Window & {
        launchQueue?: {
          setConsumer: (
            cb: (params: { files: readonly FileSystemHandle[] }) => void | Promise<void>,
          ) => void;
        };
      }
    ).launchQueue;

    launchQueue?.setConsumer(async (params) => {
      try {
        const fileHandle = params.files.find((f): f is FileSystemFileHandle => f.kind === 'file');
        if (!fileHandle) return;
        const file = await fileHandle.getFile();
        setPendingLaunchFile(file);
        dispatch(setCurrentPage({ page: 'settings' }));
      } catch (error) {
        void logAppError(error, 'pwa.file-launch');
      }
    });
  }, [dispatch, setPendingLaunchFile]);
};
