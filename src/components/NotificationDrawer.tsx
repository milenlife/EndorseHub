import React from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { Endorsement, NotificationItem } from '../types/endorsement';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectEndorsementById: (endorsementId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectEndorsementById,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="relative flex flex-col h-full w-full max-w-md border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-violet-500/10 p-2 text-violet-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notifikasi Tahapan</h2>
              <p className="text-xs text-zinc-400">Pemberitahuan otomatis perubahan alur</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subheader / Mark all as read */}
        <div className="flex items-center justify-between py-3 border-b border-zinc-900 text-xs">
          <span className="text-zinc-400 font-medium">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              Belum ada notifikasi perubahan tahapan.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.read) onMarkAsRead(item.id);
                  onSelectEndorsementById(item.endorsementId);
                  onClose();
                }}
                className={`group relative rounded-2xl border p-3.5 transition-all cursor-pointer ${
                  item.read
                    ? 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900/80'
                    : 'border-violet-500/30 bg-violet-950/20 text-zinc-200 hover:border-violet-500/50 shadow-sm'
                }`}
              >
                {!item.read && (
                  <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                )}

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-400">
                  <Sparkles className="h-3 w-3" />
                  <span>{item.brandName}</span>
                </div>

                <p className="mt-1 text-xs font-semibold text-white leading-tight">
                  {item.title}
                </p>

                <p className="mt-1 text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/50 pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    • {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </span>

                  <span className="text-violet-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Buka Proyek <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
