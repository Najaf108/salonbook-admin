// src/components/Confirm.js
'use client';
import Modal from './Modal';
import clsx from 'clsx';

export default function Confirm({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            'px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60',
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
          )}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
