import { useEffect, useState } from "react";
import { Button } from "./button";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

// Simple Modal Component with Portal and CSS Override
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = "hidden";
      const style = document.createElement("style");
      style.textContent = `
        [data-radix-popper-content-wrapper] {
          z-index: 99999 !important;
        }
        [data-radix-select-content] {
          z-index: 99999 !important;
        }
      `;
      style.id = "modal-select-override";
      document.head.appendChild(style);
    } else {
      document.body.style.overflow = "unset";
      const existingStyle = document.getElementById("modal-select-override");
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      const existingStyle = document.getElementById("modal-select-override");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[9999] ${className}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 relative z-[10000]">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
