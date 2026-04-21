import { useState, useEffect } from 'react';
import Splash from './screens/Splash';
import Home from './screens/Home';
import Dashboard from './screens/Dashboard';
import { Office } from './types';
import { startWatcher } from './utils/watcher';
import { requestPermission } from './utils/notifications';

type Screen = 'splash' | 'home' | 'dashboard';

export default function App() {
    const [screen, setScreen] = useState<Screen>('splash');
    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

    useEffect(() => {
        requestPermission().then((granted) => {
            if (granted) startWatcher();
        });
    }, []);

    const goHome = (): void => setScreen('home');

    const openDash = (office: Office): void => {
        setSelectedOffice(office);
        setScreen('dashboard');
    };

    return (
        <div style={styles.phone}>
            {screen === 'splash' && <Splash onDone={goHome} />}
            {screen === 'home' && <Home onSelect={openDash} />}
            {screen === 'dashboard' && selectedOffice && (
                <Dashboard office={selectedOffice} onBack={goHome} />
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    phone: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 390,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#F4F6FB',
        position: 'relative',
        overflow: 'hidden',
    },
};