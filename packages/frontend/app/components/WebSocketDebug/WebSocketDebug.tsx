import { useEffect, useState } from 'react';
import { useSdk } from '~/hooks/useSdk';
import './WebSocketDebug.css';

export default function WebSocketDebug() {
    const { info } = useSdk();
    const [connectionStatus, setConnectionStatus] = useState<
        Record<string, boolean>
    >({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!info?.multiSocketInfo) return;

        const checkStatus = () => {
            if (!info.multiSocketInfo) return;
            const pool = info.multiSocketInfo.getPool();
            const status = pool.getConnectionStatus();
            setConnectionStatus(status);
        };

        // Initial check
        checkStatus();

        // Check every second
        const interval = setInterval(checkStatus, 1000);

        return () => clearInterval(interval);
    }, [info]);

    // Toggle with Ctrl+Shift+W
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.code === 'KeyD' && e.altKey) ||
                (e.ctrlKey && e.shiftKey && e.key === 'W')
            ) {
                setIsVisible((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isVisible || !info?.multiSocketInfo) return null;

    return (
        <div className='websocket-debug'>
            <h3>WebSocket Status</h3>
            {Object.entries(connectionStatus).map(([name, connected]) => (
                <div
                    key={name}
                    className={`socket-status ${connected ? 'connected' : 'disconnected'}`}
                >
                    <span className='socket-name'>{name}:</span>
                    <span className='socket-state'>
                        {connected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                </div>
            ))}
            <div className='debug-hint'>Press Ctrl+Shift+W to toggle</div>
        </div>
    );
}
