import React from 'react';
import { PantryManagerProvider, usePantryManagerContext } from '../contexts/PantryManagerContext';
import { PantryHeader } from './pantry/PantryHeader';
import { PantryToolbar } from './pantry/PantryToolbar';
import { PantryList } from './pantry/PantryList';
import { PantryBulkActions } from './pantry/PantryBulkActions';
import { PantryItemModal } from './pantry/PantryItemModal';

const PantryManagerView: React.FC = () => {
    const { modalState, setModalState, handleSaveItem, pantryItems } = usePantryManagerContext();

    return (
        <div className="space-y-8">
            <PantryItemModal 
                isOpen={modalState.isOpen}
                item={modalState.item}
                onClose={() => setModalState({ isOpen: false, item: null })}
                onSave={handleSaveItem}
                pantryItems={pantryItems || []}
            />
            <PantryHeader />
            <PantryToolbar />
            <div className="space-y-4">
                <PantryList />
                <PantryBulkActions />
            </div>
        </div>
    );
};

const PantryManager: React.FC = () => {
  return (
    <PantryManagerProvider>
      <PantryManagerView />
    </PantryManagerProvider>
  );
};

export default PantryManager;