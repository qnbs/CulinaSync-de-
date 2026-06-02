import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DEEPLINK_EVENT, type DeepLinkDetail } from '../deepLinking';
import { useAppDispatch } from '../store/hooks';
import { addToast, navigateToItem, setCurrentPage } from '../store/slices/uiSlice';

// QNBS-v3: Deeplink-Events (Tauri/Capacitor/Web) → Redux-Navigation
export function useDeepLinkNavigation(): void {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const onDeepLink = (event: Event) => {
      const detail = (event as CustomEvent<DeepLinkDetail>).detail;
      if (!detail) {
        return;
      }

      if (detail.type === 'recipe') {
        const recipeId = Number(detail.id);
        if (!Number.isFinite(recipeId) || recipeId <= 0) {
          dispatch(addToast({ message: t('app.deeplink.invalidRecipe'), type: 'error' }));
          return;
        }
        dispatch(navigateToItem({ page: 'recipes', id: recipeId }));
        return;
      }

      if (detail.type === 'shoppinglist') {
        dispatch(setCurrentPage({ page: 'shopping-list' }));
      }
    };

    window.addEventListener(DEEPLINK_EVENT, onDeepLink);
    return () => window.removeEventListener(DEEPLINK_EVENT, onDeepLink);
  }, [dispatch, t]);
}
