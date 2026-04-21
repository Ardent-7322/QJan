import { useEffect, useState, type ReactElement } from 'react';
import { getAllOffices, aiSearch } from '../api/queue';
import { Office, OfficeType } from '../types';

type IconProps = { color?: string };

const RTOIcon = ({ color = '#1A56DB' }: IconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);

const PassportIcon = ({ color = '#D97706' }: IconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M9 18h6" />
    </svg>
);

const HospitalIcon = ({ color = '#16A34A' }: IconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M12 7v6M9 10h6" />
    </svg>
);

const PostIcon = ({ color = '#DB2777' }: IconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const ICON_MAP: Record<OfficeType, ({ color }: IconProps) => ReactElement> = {
    'RTO': RTOIcon,
    'Passport': PassportIcon,
    'Hospital': HospitalIcon,
    'Post Office': PostIcon,
};

const BG: Record<OfficeType, string> = {
    'RTO': '#EBF2FF',
    'Passport': '#FFF3E0',
    'Hospital': '#E8F5E9',
    'Post Office': '#FCE4EC',
};

const COLOR: Record<OfficeType, string> = {
    'RTO': '#1A56DB',
    'Passport': '#D97706',
    'Hospital': '#16A34A',
    'Post Office': '#DB2777',
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
    busy: { background: '#FEE2E2', color: '#B91C1C' },
    moderate: { background: '#FEF3C7', color: '#92400E' },
    quiet: { background: '#D1FAE5', color: '#065F46' },
};

const getStatusKey = (status: string): string => {
    if (status.includes('busy')) return 'busy';
    if (status.includes('moderate')) return 'moderate';
    return 'quiet';
};

interface NavIconProps {
    name: string;
    active: boolean;
}

const NavIcon = ({ name, active }: NavIconProps): ReactElement => {
    const color = active ? '#1A56DB' : '#9CA3AF';
    if (name === 'Home') return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
    );
    if (name === 'Search') return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    );
    if (name === 'Alerts') return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
};

interface OfficeCardProps {
    office: Office;
    onSelect: (office: Office) => void;
}

const OfficeCard = ({ office, onSelect }: OfficeCardProps): ReactElement => {
    const statusKey = getStatusKey(office.status);
    const statusLabel = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
    const IconComponent = ICON_MAP[office.type as OfficeType] || RTOIcon;
    const bg = BG[office.type as OfficeType] || '#EBF2FF';
    const color = COLOR[office.type as OfficeType] || '#1A56DB';

    return (
        <div style={s.card} onClick={() => onSelect(office)}>
            <div style={{ ...s.cardIcon, background: bg }}>
                <IconComponent color={color} />
            </div>
            <div style={s.cardInfo}>
                <div style={s.cardName}>{office.name}</div>
                <div style={s.cardMeta}>{office.city}</div>
            </div>
            <div style={s.cardRight}>
                <span style={{ ...s.statusPill, ...STATUS_STYLE[statusKey] }}>
                    {statusLabel}
                </span>
                <span style={s.cardCount}>{office.current_count} in queue</span>
            </div>
        </div>
    );
};

interface Props {
    onSelect: (office: Office) => void;
}

export default function Home({ onSelect }: Props): ReactElement {
    const [offices, setOffices] = useState<Office[]>([]);
    const [filter, setFilter] = useState<string>('All');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searching, setSearching] = useState<boolean>(false);

    useEffect(() => {
        getAllOffices()
            .then(setOffices)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = async (): Promise<void> => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const result = await aiSearch(searchQuery);
            if (result.matched_office_id) {
                const matched = offices.find(
                    o => o.office_id === result.matched_office_id
                );
                if (matched) onSelect(matched);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const types = ['All', 'RTO', 'Passport', 'Hospital', 'Post Office'];

    const filtered = filter === 'All'
        ? offices
        : offices.filter(o => o.type === filter);

    const busy = filtered.filter(o =>
        getStatusKey(o.status) === 'busy' ||
        getStatusKey(o.status) === 'moderate'
    );
    const quiet = filtered.filter(o =>
        getStatusKey(o.status) === 'quiet'
    );

    return (
        <div style={s.wrap}>
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerTop}>
                    <div style={s.logoRow}>
                        <div style={s.lb}>
                            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                                <rect x="8" y="6" width="16" height="20" rx="3" fill="white" opacity="0.3" />
                                <rect x="11" y="9" width="16" height="20" rx="3" fill="white" opacity="0.5" />
                                <rect x="14" y="12" width="16" height="20" rx="3" fill="white" />
                                <path d="M18 19h8M18 23h5" stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="28" cy="28" r="6" fill="#1A56DB" />
                                <path d="M25.5 28l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span style={s.lname}>Q<b style={{ color: '#1A56DB' }}>Jan</b></span>
                    </div>
                    <div style={s.notifBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </div>
                </div>

                {/* Search */}
                <div style={s.searchBar}>
                    <input
                        style={s.searchInput}
                        placeholder='Try "renew license near Andheri"...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <div style={s.searchIcon} onClick={handleSearch}>
                        {searching ? (
                            <div style={s.spinner} />
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="white" strokeWidth="2.5"
                                strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        )}
                    </div>
                </div>
                {!searchQuery && (
                    <div style={s.searchHint}>
                        AI powered — describe what you need in plain words
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={s.body}>
                {/* Filter Pills */}
                <div style={s.pills}>
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{ ...s.pill, ...(filter === t ? s.pillActive : {}) }}>
                            <span style={{
                                ...s.pillLabel,
                                ...(filter === t ? { color: '#1A56DB' } : {})
                            }}>
                                {t}
                            </span>
                        </button>
                    ))}
                </div>

                {loading && (
                    <div style={s.loadingWrap}>
                        <div style={s.loadingText}>Finding offices near you...</div>
                    </div>
                )}

                {/* High Footfall */}
                {busy.length > 0 && (
                    <>
                        <div style={s.sectionHead}>
                            <span style={s.sectionTitle}>High Footfall Today</span>
                            <span style={s.viewAll}>View all</span>
                        </div>
                        {busy.map(o => (
                            <OfficeCard key={o.office_id} office={o} onSelect={onSelect} />
                        ))}
                    </>
                )}

                {/* Quiet */}
                {quiet.length > 0 && (
                    <>
                        <div style={{ ...s.sectionHead, marginTop: 20 }}>
                            <span style={s.sectionTitle}>Quiet Right Now</span>
                            <span style={s.viewAll}>View all</span>
                        </div>
                        {quiet.map(o => (
                            <OfficeCard key={o.office_id} office={o} onSelect={onSelect} />
                        ))}
                    </>
                )}
            </div>

            {/* Bottom Nav */}
            <div style={s.bottomNav}>
                {(['Home', 'Search', 'Alerts', 'Profile'] as const).map((item, i) => (
                    <div key={item} style={s.navItem}>
                        <NavIcon name={item} active={i === 0} />
                        <span style={{ ...s.navLabel, ...(i === 0 ? { color: '#1A56DB' } : {}) }}>
                            {item}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    wrap: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F4F6FB' },
    header: { background: '#fff', padding: '20px 20px 14px', borderBottom: '0.5px solid #EAECF0' },
    headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    logoRow: { display: 'flex', alignItems: 'center', gap: 8 },
    lb: { width: 34, height: 34, background: '#1A56DB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    lname: { fontSize: 17, fontWeight: 700, color: '#111827' },
    notifBtn: { width: 34, height: 34, background: '#F4F6FB', borderRadius: 10, border: '0.5px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    searchBar: { display: 'flex', alignItems: 'center', gap: 10, background: '#F4F6FB', border: '0.5px solid #EAECF0', borderRadius: 12, padding: '10px 14px' },
    searchInput: { border: 'none', background: 'transparent', fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#374151', flex: 1, outline: 'none' },
    searchIcon: { width: 32, height: 32, background: '#1A56DB', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' },
    spinner: { width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    searchHint: { fontSize: 11, color: '#9CA3AF', marginTop: 6, paddingLeft: 4 },
    body: { flex: 1, overflowY: 'auto', padding: '16px 20px 90px' },
    pills: { display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 },
    pill: { flexShrink: 0, background: '#fff', border: '0.5px solid #EAECF0', borderRadius: 20, padding: '8px 14px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" },
    pillActive: { background: '#EBF2FF', borderColor: '#1A56DB' },
    pillLabel: { fontSize: 12, fontWeight: 500, color: '#374151' },
    sectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: 600, color: '#111827' },
    viewAll: { fontSize: 12, fontWeight: 500, color: '#1A56DB', cursor: 'pointer' },
    card: { background: '#fff', border: '0.5px solid #EAECF0', borderRadius: 16, padding: 14, marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 },
    cardIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 },
    cardMeta: { fontSize: 12, color: '#6B7280' },
    cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
    statusPill: { fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20 },
    cardCount: { fontSize: 11, color: '#9CA3AF' },
    loadingWrap: { display: 'flex', justifyContent: 'center', padding: 40 },
    loadingText: { fontSize: 14, color: '#6B7280' },
    bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderTop: '0.5px solid #EAECF0', display: 'flex', padding: '10px 0 16px', zIndex: 100 },
    navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' },
    navLabel: { fontSize: 10, fontWeight: 500, color: '#9CA3AF' },
};