"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trash2, Globe2, Lock, Copy, ClipboardCheck, Pencil } from "lucide-react";
import { ReactNode } from "react";

export type ActionPopupType = "success" | "delete" | "publish" | "unpublish" | "copy" | "clone" | "rename";

type ActionPopupConfig = {
  icon: ReactNode;
  title: string;
  ringColor: string;
  bgColor: string;
  barColor: string;
};

const popupConfigs: Record<ActionPopupType, ActionPopupConfig> = {
  success: {
    icon: <CheckCircle2 className="w-8 h-8 text-green-400" />,
    title: "Success!",
    ringColor: "border-green-500",
    bgColor: "bg-green-500/20",
    barColor: "bg-green-500",
  },
  delete: {
    icon: <Trash2 className="w-8 h-8 text-red-400" />,
    title: "Build Deleted",
    ringColor: "border-red-500",
    bgColor: "bg-red-500/20",
    barColor: "bg-red-500",
  },
  publish: {
    icon: <Globe2 className="w-8 h-8 text-blue-400" />,
    title: "Build Published",
    ringColor: "border-blue-500",
    bgColor: "bg-blue-500/20",
    barColor: "bg-blue-500",
  },
  unpublish: {
    icon: <Lock className="w-8 h-8 text-yellow-400" />,
    title: "Build Unpublished",
    ringColor: "border-yellow-500",
    bgColor: "bg-yellow-500/20",
    barColor: "bg-yellow-500",
  },
  copy: {
    icon: <ClipboardCheck className="w-8 h-8 text-emerald-400" />,
    title: "Command Copied",
    ringColor: "border-emerald-500",
    bgColor: "bg-emerald-500/20",
    barColor: "bg-emerald-500",
  },
  clone: {
    icon: <Copy className="w-8 h-8 text-blue-400" />,
    title: "Build Cloned!",
    ringColor: "border-blue-500",
    bgColor: "bg-blue-500/20",
    barColor: "bg-blue-500",
  },
  rename: {
    icon: <Pencil className="w-8 h-8 text-purple-400" />,
    title: "Build Renamed",
    ringColor: "border-purple-500",
    bgColor: "bg-purple-500/20",
    barColor: "bg-purple-500",
  },
};

export function ActionPopup({
  type,
  message,
  onClose,
  duration = 3,
}: {
  type: ActionPopupType;
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  const config = popupConfigs[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
            className={`w-16 h-16 rounded-full ${config.bgColor} border-2 ${config.ringColor} flex items-center justify-center`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              {config.icon}
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h3 className="text-lg font-bold text-white mb-1">{config.title}</h3>
            <p className="text-sm text-zinc-400">{message}</p>
          </motion.div>

          {/* Progress bar auto-dismiss */}
          <motion.div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration, ease: "linear" }}
              className={`h-full ${config.barColor} rounded-full`}
            />
          </motion.div>

          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Click anywhere to dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ConfirmPopup({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Trash2 className="w-8 h-8 text-red-400" />
            </motion.div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-zinc-400">{message}</p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex gap-3 w-full mt-1"
          >
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors border border-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
            >
              {confirmLabel}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ActionPopupContainer({
  popup,
  onClose,
}: {
  popup: { type: ActionPopupType; message: string } | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {popup && (
        <ActionPopup
          type={popup.type}
          message={popup.message}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
