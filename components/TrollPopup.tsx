"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface TrollPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrollPopup({ isOpen, onClose }: TrollPopupProps) {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [canEscape, setCanEscape] = useState(true);
  const totalDistanceRef = useRef(0);
  const previousPositionRef = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const ESCAPE_DISTANCE = 100; // Distance at which button starts to "run away"
  const MAX_TOTAL_DISTANCE = 2500; // Total distance button can travel before stopping

  // Set initial position after popup dimensions are available
  useEffect(() => {
    if (isOpen && popupRef.current && buttonRef.current) {
      const popupRect = popupRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const padding = 16;

      // Start in top-right corner
      const initialX = popupRect.width - buttonRect.width - padding;
      const initialY = padding;

      setButtonPosition({ x: initialX, y: initialY });
      previousPositionRef.current = { x: initialX, y: initialY };
      totalDistanceRef.current = 0;
      setCanEscape(true);
    }
  }, [isOpen]);

  // Make button "run away" from cursor
  useEffect(() => {
    if (!isOpen || !canEscape) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!popupRef.current || !buttonRef.current) return;

      const popupRect = popupRef.current.getBoundingClientRect();
      const buttonRect = buttonRef.current.getBoundingClientRect();

      // Get mouse position relative to popup
      const mouseX = e.clientX - popupRect.left;
      const mouseY = e.clientY - popupRect.top;

      // Get button center position
      const buttonCenterX = buttonPosition.x + buttonRect.width / 2;
      const buttonCenterY = buttonPosition.y + buttonRect.height / 2;

      // Calculate distance from mouse to button
      const distance = Math.sqrt(
        Math.pow(mouseX - buttonCenterX, 2) +
        Math.pow(mouseY - buttonCenterY, 2)
      );

      // If mouse is close and button can still escape, make button "run away"
      if (distance < ESCAPE_DISTANCE && totalDistanceRef.current < MAX_TOTAL_DISTANCE) {
        const angle = Math.atan2(mouseY - buttonCenterY, mouseX - buttonCenterX);
        const escapeDistance = 80;

        const newX = buttonPosition.x - Math.cos(angle) * escapeDistance;
        const newY = buttonPosition.y - Math.sin(angle) * escapeDistance;

        // Clamp to bounds
        const padding = 16;
        const minX = padding;
        const maxX = popupRect.width - buttonRect.width - padding;
        const minY = padding;
        const maxY = popupRect.height - buttonRect.height - padding;

        const clampedX = Math.max(minX, Math.min(maxX, newX));
        const clampedY = Math.max(minY, Math.min(maxY, newY));

        // Calculate distance moved
        const distanceMoved = Math.sqrt(
          Math.pow(clampedX - buttonPosition.x, 2) +
          Math.pow(clampedY - buttonPosition.y, 2)
        );

        // Update total distance traveled
        totalDistanceRef.current += distanceMoved;

        if (clampedX !== buttonPosition.x || clampedY !== buttonPosition.y) {
          setButtonPosition({ x: clampedX, y: clampedY });
          previousPositionRef.current = { x: clampedX, y: clampedY };
        }

        // Stop escaping if max distance reached
        if (totalDistanceRef.current >= MAX_TOTAL_DISTANCE) {
          setCanEscape(false);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isOpen, buttonPosition, canEscape]);

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Close immediately when clicked
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center -pt-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Popup Content */}
      <div className="relative z-10 max-w-7xl w-full mx-4">
        <div
          ref={popupRef}
          className="relative bg-zinc-900 rounded-lg overflow-visible border border-zinc-700 shadow-2xl"
        >
          {/* Troll Image */}
          <div className="relative w-full aspect-video">
            <Image
              src="/images/trollform.png"
              alt="Troll Form"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Close Button - positioned absolutely */}
          <button
            ref={buttonRef}
            onClick={handleCloseClick}
            className="absolute rounded-full bg-red-600 hover:bg-red-700 text-white p-2 shadow-lg transition-all duration-300 ease-out z-20 cursor-pointer"
            style={{
              left: `${buttonPosition.x}px`,
              top: `${buttonPosition.y}px`,
            }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

