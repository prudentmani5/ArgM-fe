import { useState, useEffect, useCallback, useRef } from 'react';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;      // 5 minutes
const WARNING_THRESHOLD_MS = 30 * 1000;      // Show warning 30 seconds before logout
const ACTIVITY_THROTTLE_MS = 1000;           // Throttle activity events to 1 per second

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;

interface UseIdleTimeoutReturn {
    isWarningVisible: boolean;
    remainingSeconds: number;
    resetTimer: () => void;
    forceLogout: () => void;
}

export const useIdleTimeout = (
    onLogout: () => void,
    isEnabled: boolean = true
): UseIdleTimeoutReturn => {
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(30);

    const lastActivityRef = useRef<number>(Date.now());
    const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastThrottleRef = useRef<number>(0);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setIsWarningVisible(false);
        setRemainingSeconds(30);
        if (warningIntervalRef.current) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
        }
    }, []);

    const forceLogout = useCallback(() => {
        if (warningIntervalRef.current) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
        }
        if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
        }
        onLogout();
    }, [onLogout]);

    const handleActivity = useCallback(() => {
        const now = Date.now();
        if (now - lastThrottleRef.current < ACTIVITY_THROTTLE_MS) return;
        lastThrottleRef.current = now;
        if (!isWarningVisible) {
            lastActivityRef.current = now;
        }
    }, [isWarningVisible]);

    const startWarningCountdown = useCallback(() => {
        setIsWarningVisible(true);
        setRemainingSeconds(30);
        if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
        warningIntervalRef.current = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    if (warningIntervalRef.current) {
                        clearInterval(warningIntervalRef.current);
                        warningIntervalRef.current = null;
                    }
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [onLogout]);

    useEffect(() => {
        if (!isEnabled) return;
        checkIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const idleTime = now - lastActivityRef.current;
            const timeUntilLogout = IDLE_TIMEOUT_MS - idleTime;
            if (timeUntilLogout <= WARNING_THRESHOLD_MS && !isWarningVisible) {
                startWarningCountdown();
            }
        }, 1000);
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        };
    }, [isEnabled, isWarningVisible, startWarningCountdown]);

    useEffect(() => {
        if (!isEnabled) return;
        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });
        return () => {
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isEnabled, handleActivity]);

    useEffect(() => {
        return () => {
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
    }, []);

    return { isWarningVisible, remainingSeconds, resetTimer, forceLogout };
};
