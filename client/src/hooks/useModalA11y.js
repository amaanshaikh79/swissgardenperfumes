import { useEffect, useRef } from 'react';

/**
 * Accessibility helper for modal/drawer surfaces.
 * - Closes on Escape.
 * - Stores the previously focused element on open, focuses the close control,
 *   and restores focus on close/unmount.
 * - Provides a basic Tab focus trap that cycles between the first and last
 *   focusable descendants of the panel.
 *
 * @param {boolean} isOpen   Whether the surface is currently open.
 * @param {() => void} onClose Callback to close the surface.
 * @param {React.RefObject<HTMLElement>} closeRef Ref to the close button (focused on open).
 * @returns {React.RefObject<HTMLElement>} Ref to attach to the panel container (for the focus trap).
 */
const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useModalA11y(isOpen, onClose, closeRef) {
    const panelRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        previousFocusRef.current = document.activeElement;

        // Focus the close control once the panel is rendered.
        const focusTimer = window.setTimeout(() => {
            if (closeRef?.current) {
                closeRef.current.focus();
            }
        }, 0);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab' && panelRef.current) {
                const focusable = Array.from(
                    panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
                ).filter((el) => el.offsetParent !== null || el === document.activeElement);
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            const previous = previousFocusRef.current;
            if (previous && typeof previous.focus === 'function') {
                previous.focus();
            }
        };
    }, [isOpen, onClose, closeRef]);

    return panelRef;
}
