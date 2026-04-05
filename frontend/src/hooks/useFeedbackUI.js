import { useEffect, useState } from "react";

export default function useFeedbackUI(autoCloseMs = 3200) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [toast.open, autoCloseMs]);

  function showToast(message, type = "success") {
    setToast({
      open: true,
      message,
      type,
    });
  }

  function hideToast() {
    setToast((prev) => ({
      ...prev,
      open: false,
    }));
  }

  function openConfirm({ title = "", message = "", onConfirm = null }) {
    setConfirmState({
      open: true,
      title,
      message,
      onConfirm,
    });
  }

  function closeConfirm() {
    setConfirmState({
      open: false,
      title: "",
      message: "",
      onConfirm: null,
    });
  }

  return {
    toast,
    showToast,
    hideToast,
    confirmState,
    openConfirm,
    closeConfirm,
  };
}
