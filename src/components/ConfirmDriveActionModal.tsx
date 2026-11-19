import { AlertTriangle, X } from 'lucide-react';
import { buildDriveConfirmationCopy, type DriveActionDescriptor } from '../utils/drive';

interface ConfirmDriveActionModalProps {
  descriptor: DriveActionDescriptor | null;
  newName?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDriveActionModal({
  descriptor,
  newName,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDriveActionModalProps) {
  if (!descriptor) return null;

  const copy = buildDriveConfirmationCopy(descriptor, newName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-confirm-title"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                copy.isDestructive ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700'
              }`}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="drive-confirm-title" className="font-display text-base font-bold text-slate-900">
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Onay penceresini kapat"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">{copy.description}</p>

        {descriptor.targetNames.length > 0 && (
          <div className="mt-3 max-h-36 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold text-slate-600">Etkilenen öğeler:</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-800">
              {descriptor.targetNames.map((name, idx) => (
                <li key={`${name}-${idx}`} className="truncate font-mono">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              copy.isDestructive
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-slate-900 hover:bg-sky-700'
            }`}
          >
            {busy ? 'İşleniyor...' : copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
