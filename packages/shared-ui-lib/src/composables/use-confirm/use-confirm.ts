import { useState, useCallback } from 'react';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title,
        message,
        onConfirm: () => resolve(true),
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.onConfirm?.();
    setState((s) => ({ ...s, isOpen: false, onConfirm: null }));
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false, onConfirm: null }));
  }, []);

  return {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
