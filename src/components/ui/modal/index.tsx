"use client";

import { cn } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

const MODAL_TRANSITION_MS = 300;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  const finishExit = useCallback(() => {
    setMounted(false);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let frame2 = 0;
      const frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(frame1);
        cancelAnimationFrame(frame2);
      };
    }
    setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    if (visible || isOpen || !mounted) return;
    const timer = window.setTimeout(finishExit, MODAL_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [visible, isOpen, mounted, finishExit]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && visible) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, visible, onClose]);

  useEffect(() => {
    if (!mounted) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  const handlePanelTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target !== modalRef.current) return;
    if (visible || isOpen) return;
    finishExit();
  };

  if (!mounted) return null;

  const contentClasses = isFullscreen
    ? "h-full w-full"
    : "relative w-full rounded-3xl bg-white dark:bg-gray-900";

  return (
    <div
      className={cn(
        "modal fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto p-4 sm:p-6",
        !visible && "pointer-events-none",
      )}
      aria-hidden={!visible}
    >
      {!isFullscreen && (
        <button
          type="button"
          className={cn(
            "fixed inset-0 h-full w-full bg-gray-900/20 backdrop-blur-xs transition-opacity duration-300 ease-out motion-reduce:transition-none dark:bg-gray-950/40",
            visible ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close"
          onClick={onClose}
          tabIndex={visible ? 0 : -1}
        />
      )}
      <div
        ref={modalRef}
        onTransitionEnd={handlePanelTransitionEnd}
        className={cn(
          contentClasses,
          className,
          "relative z-10 transition-all duration-300 ease-out motion-reduce:transition-none",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-e-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 sm:inset-e-6 sm:top-6 sm:h-11 sm:w-11 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
