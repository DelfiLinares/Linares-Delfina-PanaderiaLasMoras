import { useEffect, useEffectEvent, useState } from 'react';
import { useNotify } from '../components/Notifications.jsx';

export function useResource(key, loader, enabled = true) {
    const [state, setState] = useState({ data: null, loading: enabled, error: null });
    const [revision, setRevision] = useState(0);
    const notify = useNotify();
    const loadLatest = useEffectEvent((signal) => loader(signal));
    const reportError = useEffectEvent((message) => notify('error', message));

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();
        setState({ data: null, loading: true, error: null });
        loadLatest(controller.signal).then((data) => {
            if (!controller.signal.aborted) setState({ data, loading: false, error: null });
        }).catch((error) => {
            if (controller.signal.aborted) return;
            setState({ data: null, loading: false, error: error.message });
            reportError(error.message);
        });
        return () => controller.abort();
    }, [key, revision, enabled]);

    return { ...state, reload: () => setRevision((current) => current + 1) };
}