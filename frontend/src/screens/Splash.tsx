import { useEffect } from 'react';

interface Props {
    onDone: () => void;
}

export default function Splash({ onDone }: Props) {
    useEffect(() => {
        const t = setTimeout(onDone, 2200);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div style={s.wrap}>
            <div style={s.inner}>
                <div style={s.logoBox}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="8" y="6" width="16" height="20" rx="3" fill="white" opacity="0.3" />
                        <rect x="11" y="9" width="16" height="20" rx="3" fill="white" opacity="0.5" />
                        <rect x="14" y="12" width="16" height="20" rx="3" fill="white" />
                        <path d="M18 19h8M18 23h5" stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="28" cy="28" r="6" fill="#1A56DB" />
                        <path d="M25.5 28l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div style={s.wordmark}>
                    Q<span style={{ color: '#1A56DB' }}>Jan</span>
                </div>
                <div style={s.track}>
                    <div style={s.fill} />
                </div>
            </div>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    wrap: { background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
    inner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
    logoBox: { width: 76, height: 76, background: '#1A56DB', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    wordmark: { fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: -0.5 },
    track: { width: 120, height: 3, background: '#E5E7EB', borderRadius: 4, marginTop: 32, overflow: 'hidden' },
    fill: { height: '100%', width: '100%', background: '#1A56DB', borderRadius: 4, animation: 'load 2s ease forwards' },
};