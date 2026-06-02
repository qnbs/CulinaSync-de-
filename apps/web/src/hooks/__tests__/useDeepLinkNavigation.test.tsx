import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../test/createTestStore';
import { dispatchDeepLink } from '../../deepLinking';
import { useDeepLinkNavigation } from '../useDeepLinkNavigation';

describe('useDeepLinkNavigation', () => {
  it('navigiert zu Rezept-Detail bei recipe-Deeplink', () => {
    const store = createTestStore();
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useDeepLinkNavigation(), { wrapper: localWrapper });

    act(() => {
      dispatchDeepLink({ type: 'recipe', id: '12' });
    });

    expect(store.getState().ui.currentPage).toBe('recipes');
    expect(store.getState().ui.initialSelectedId).toBe(12);
  });

  it('navigiert zur Einkaufsliste bei shoppinglist-Deeplink', () => {
    const store = createTestStore();
    const localWrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useDeepLinkNavigation(), { wrapper: localWrapper });

    act(() => {
      dispatchDeepLink({ type: 'shoppinglist' });
    });

    expect(store.getState().ui.currentPage).toBe('shopping-list');
  });
});
