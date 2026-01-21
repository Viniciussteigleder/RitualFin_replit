/**
 * Standardized toast notification hook
 * Wraps sonner with consistent styling and behavior
 */

'use client';

import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Standardized toast notification hook
 */
export function useNotify() {
  const notify = (
    type: ToastType,
    message: string,
    options?: ToastOptions
  ) => {
    const { description, duration = 4000, action } = options || {};

    const toastOptions = {
      description,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    switch (type) {
      case 'success':
        return sonnerToast.success(message, toastOptions);
      case 'error':
        return sonnerToast.error(message, toastOptions);
      case 'warning':
        return sonnerToast.warning(message, toastOptions);
      case 'info':
        return sonnerToast.info(message, toastOptions);
      case 'loading':
        return sonnerToast.loading(message, toastOptions);
    }
  };

  return {
    success: (message: string, options?: ToastOptions) =>
      notify('success', message, options),
    error: (message: string, options?: ToastOptions) =>
      notify('error', message, options),
    warning: (message: string, options?: ToastOptions) =>
      notify('warning', message, options),
    info: (message: string, options?: ToastOptions) =>
      notify('info', message, options),
    loading: (message: string, options?: ToastOptions) =>
      notify('loading', message, options),
    promise: sonnerToast.promise,
    dismiss: sonnerToast.dismiss,
  };
}

/**
 * Pre-configured toast messages for common scenarios
 */
export const toastMessages = {
  // Success messages
  saved: 'Alterações salvas com sucesso',
  created: 'Criado com sucesso',
  updated: 'Atualizado com sucesso',
  deleted: 'Excluído com sucesso',
  uploaded: 'Upload concluído com sucesso',
  imported: 'Importação concluída com sucesso',

  // Error messages
  error: 'Ocorreu um erro. Por favor, tente novamente.',
  networkError: 'Erro de conexão. Verifique sua internet.',
  unauthorized: 'Você não tem permissão para esta ação.',
  notFound: 'Item não encontrado.',
  validationError: 'Por favor, verifique os dados informados.',

  // Loading messages
  saving: 'Salvando...',
  loading: 'Carregando...',
  uploading: 'Enviando...',
  processing: 'Processando...',
  deleting: 'Excluindo...',
};
