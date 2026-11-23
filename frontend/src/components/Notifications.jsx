import { createContext, useContext, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const nextId = useRef(0);

    function dismiss(id) {
        setNotifications((current) => current.filter((item) => item.id !== id));
    }

    function notify(type, message) {
        const id = ++nextId.current;
        setNotifications((current) => [...current.slice(-3), { id, type, message }]);
        setTimeout(() => dismiss(id), 5000);
    }

    return (
        <NotificationContext value={notify}>
            {children}
            <aside className="notifications" aria-label="Notificaciones">
                {notifications.map(({ id, type, message }) => (
                    <div className={`notification notification-${type}`} key={id}>
                        {type === 'success' ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
                        <p role={type === 'error' ? 'alert' : 'status'}>{message}</p>
                        <button className="icon-button" type="button" onClick={() => dismiss(id)}
                            aria-label="Cerrar notificación" title="Cerrar notificación"><X size={18} /></button>
                    </div>
                ))}
            </aside>
        </NotificationContext>
    );
}

export function useNotify() {
    return useContext(NotificationContext);
}