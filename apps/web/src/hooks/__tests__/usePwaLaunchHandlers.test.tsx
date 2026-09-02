import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../test/createTestStore';
import { usePwaLaunchHandlers } from '../usePwaLaunchHandlers';
import { useTransientUiStore } from '../../store/transientUiStore';

const logAppError = vi.fn();
vi.mock('../../services/errorLoggingService', () => ({
  logAppError: (...args: unknown[]) => logAppError(...args),
}));

describe('usePwaLaunchHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTransientUiStore.setState({
      pendingShareText: null,
      pendingLaunchFile: null,
    });
    window.history.replaceState({}, '', '/');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={createTestStore()}>{children}</Provider>
  );

  it('navigiert zu Launch-Page aus Query-Param', () => {
    window.history.replaceState({}, '', '/?page=recipes');
    const store = createTestStore();
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => usePwaLaunchHandlers(), { wrapper: localWrapper });

    expect(store.getState().ui.currentPage).toBe('recipes');
  });

  it('verarbeitet Share-Target und setzt pendingShareText', () => {
    window.history.replaceState({}, '', '/?title=Tomato&text=Fresh+tomatoes');
    const store = createTestStore();

    renderHook(() => usePwaLaunchHandlers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(store.getState().ui.currentPage).toBe('chef');
    expect(useTransientUiStore.getState().pendingShareText).toMatch(/tomato|Fresh/i);
  });

  it('strippt pwa-file Query ohne Share-Payload', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    window.history.replaceState({}, '', '/?pwa-file=1&foo=bar');

    renderHook(() => usePwaLaunchHandlers(), { wrapper });

    expect(replaceState).toHaveBeenCalled();
  });

  it('registriert launchQueue Consumer fuer Datei-Import', async () => {
    const setConsumer = vi.fn();
    const getFile = vi.fn().mockResolvedValue(new File(['recipe'], 'import.json', { type: 'application/json' }));
    const fileHandle = { kind: 'file', getFile } as unknown as FileSystemFileHandle;

    Object.defineProperty(window, 'launchQueue', {
      configurable: true,
      value: { setConsumer },
    });

    const store = createTestStore();
    renderHook(() => usePwaLaunchHandlers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(setConsumer).toHaveBeenCalled();
    const consumer = setConsumer.mock.calls[0]![0] as (params: { files: readonly FileSystemHandle[] }) => Promise<void>;
    await consumer({ files: [fileHandle] });

    expect(store.getState().ui.currentPage).toBe('settings');
    expect(useTransientUiStore.getState().pendingLaunchFile?.name).toBe('import.json');
  });

  it('loggt Fehler wenn launchQueue getFile scheitert', async () => {
    const setConsumer = vi.fn();
    const fileHandle = {
      kind: 'file',
      getFile: vi.fn().mockRejectedValue(new Error('read failed')),
    } as unknown as FileSystemFileHandle;

    Object.defineProperty(window, 'launchQueue', {
      configurable: true,
      value: { setConsumer },
    });

    renderHook(() => usePwaLaunchHandlers(), { wrapper });

    const consumer = setConsumer.mock.calls[0]![0] as (params: { files: readonly FileSystemHandle[] }) => Promise<void>;
    await consumer({ files: [fileHandle] });

    expect(logAppError).toHaveBeenCalledWith(expect.any(Error), 'pwa.file-launch');
  });

  it('ignoriert launchQueue ohne Datei-Handle', async () => {
    const setConsumer = vi.fn();
    Object.defineProperty(window, 'launchQueue', {
      configurable: true,
      value: { setConsumer },
    });

    const store = createTestStore();
    renderHook(() => usePwaLaunchHandlers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    const consumer = setConsumer.mock.calls[0]![0] as (params: { files: readonly FileSystemHandle[] }) => Promise<void>;
    await consumer({ files: [{ kind: 'directory' } as FileSystemHandle] });

    expect(store.getState().ui.currentPage).toBe('pantry');
    expect(useTransientUiStore.getState().pendingLaunchFile).toBeNull();
  });
});
