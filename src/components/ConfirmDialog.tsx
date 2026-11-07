import { Modal } from './Modal';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: 'red' | 'teal' | 'blue';
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  confirmColor = 'red'
}: ConfirmDialogProps) {
  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
    blue: 'bg-blue-700 hover:bg-blue-800'
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${colorClasses[confirmColor]}`}>
          
          {confirmText}
        </button>
      </div>
    </Modal>);

}