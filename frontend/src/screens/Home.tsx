
import { useEffect, useState, type ReactElement } from 'react';
import { getNearbyOffices, getAllOffices, aiSearch } from '../api/queue';
import { Office, OfficeType } from '../types';
import { getUserLocation, reverseGeocode } from '../utils/location';


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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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

    const hasData = office.current_count > 0 || office.status !== 'quiet';

    return (
        <div style={s.card} onClick={() => onSelect(office)}>
            <div style={{ ...s.cardIcon, background: bg }}>
                <IconComponent color={color} />
            </div>
            <div style={s.cardInfo}>
                <div style={s.cardName}>{office.name}</div>
                <div style={s.cardMeta}>{office.area || office.city}
                    {office.distance_km !== undefined && (
                        <span style={s.distBadge}> · {office.distance_km} km</span>
                    )}
                </div>
            </div>
            <div style={s.cardRight}>
                {hasData ? (
                    <>
                        <span style={{ ...s.statusPill, ...STATUS_STYLE[statusKey] }}>
                            {statusLabel}
                        </span>
                        <span style={s.cardCount}>{office.current_count} in queue</span>
                        {office.current_count < 3 && (
                            <span style={s.lowConfBadge} title="Based on limited check-ins">
                                Low data
                            </span>
                        )}
                    </>
                ) : (
                    <span style={s.noDataPill}>No recent data</span>
                )}
            </div>
        </div>
    );
};

interface Props {
    onSelect: (office: Office) => void;
}

export default function Home({ onSelect }: Props): ReactElement {
    // Recently searched cities — stored in localStorage, no account needed
    const getRecentCities = (): string[] => {
        try { return JSON.parse(localStorage.getItem('qjan_recent_cities') || '[]'); }
        catch { return []; }
    };
    const saveRecentCity = (city: string): void => {
        const recent = getRecentCities().filter(c => c.toLowerCase() !== city.toLowerCase());
        const updated = [city, ...recent].slice(0, 5);
        localStorage.setItem('qjan_recent_cities', JSON.stringify(updated));
    };

    const [offices, setOffices] = useState<Office[]>([]);
    const [filter, setFilter] = useState<string>('All');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searching, setSearching] = useState<boolean>(false);
    const [locationLabel, setLocationLabel] = useState<string>('Detecting location...');
    const [locationLoading, setLocationLoading] = useState<boolean>(true);
    const [manualCity, setManualCity] = useState<string>('');
    const [citySearched, setCitySearched] = useState<boolean>(false);
    const [showCitySearch, setShowCitySearch] = useState<boolean>(false);
    const [showLocationPrompt, setShowLocationPrompt] = useState<boolean>(true);

    useEffect(() => {
        getUserLocation()
            .then(async (coords) => {
                const label = await reverseGeocode(coords.lat, coords.lng);
                setLocationLabel(label);
                setLocationLoading(false); // ← yahan
                const nearby = await getNearbyOffices(coords.lat, coords.lng, 20);
                setOffices(nearby);
            })
            .catch(() => {
                setLocationLabel('Location unavailable');
                setLocationLoading(false);
                getAllOffices()
                    .then(setOffices)
                    .catch(() => {
                        // Backend not running — show empty state, not crash
                        setOffices([]);
                    });
            })
            .finally(() => setLoading(false));
    }, []);

    const loadNearbyOffices = (): void => {
        setLocationLoading(true);
        getUserLocation()
            .then(async (coords) => {
                const label = await reverseGeocode(coords.lat, coords.lng);
                setLocationLabel(label);
                setLocationLoading(false);
                const nearby = await getNearbyOffices(coords.lat, coords.lng, 20);
                setOffices(nearby);
            })
            .catch(() => {
                setLocationLabel('Location unavailable');
                setLocationLoading(false);
                setShowCitySearch(true);
            })
            .finally(() => setLoading(false));
    };

    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = async (city: string): Promise<void> => {
        if (!city.trim()) return;
        setLoading(true);
        setSearchError(null);
        try {
            // Match by city name directly — no external API needed
            const all = await getAllOffices();
            const matched = all.filter(o =>
                o.city.toLowerCase().includes(city.toLowerCase()) ||
                city.toLowerCase().includes(o.city.toLowerCase()) ||
                (o.area && o.area.toLowerCase().includes(city.toLowerCase()))
            );
            if (matched.length > 0) {
                setOffices(matched);
                setLocationLabel(city);
                setCitySearched(true);
                saveRecentCity(city);
                setShowCitySearch(false);
            } else {
                setSearchError(`No offices found in ${city}. Try Jaipur, Delhi or Jodhpur.`);
            }
        } catch (err) {
            setSearchError('Could not load offices. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Pull to refresh
    const handleRefresh = (): void => {
        setLoading(true);
        if (citySearched && locationLabel) {
            handleSearch(locationLabel);
        } else {
            getAllOffices()
                .then(setOffices)
                .catch(() => setOffices([]))
                .finally(() => setLoading(false));
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
                {showLocationPrompt && (
                    <div style={s.locationPrompt}>
                        <div style={s.lpIcon}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                stroke="#1A56DB" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                <circle cx="12" cy="9" r="2.5" />
                            </svg>
                        </div>
                        <div style={s.lpTitle}>Find offices near you</div>
                        <div style={s.lpSub}>
                            Allow location access to see government offices within 20 km of you
                        </div>
                        <button style={s.lpAllow} onClick={() => {
                            setShowLocationPrompt(false);
                            loadNearbyOffices();
                        }}>
                            Allow location
                        </button>
                        <button style={s.lpDeny} onClick={() => {
                            setShowLocationPrompt(false);
                            setShowCitySearch(true);
                        }}>
                            Search by city instead
                        </button>
                    </div>
                )}
                {/* Location bar */}
                <div style={s.locationBar}>
                    <div style={{
                        ...s.locationDot,
                        background: locationLoading ? '#F59E0B' : '#1D9E75'
                    }} />
                    <div style={{ flex: 1 }}>
                        <div style={s.locationLabel}>{locationLabel}</div>
                        {!locationLoading && (
                            <div style={s.locationSub}>Showing offices within 20 km</div>
                        )}
                    </div>
                    {/* Change city button */}
                    {!locationLoading && (
                        <div
                            style={s.changeCityBtn}
                            onClick={() => setShowCitySearch(true)}>
                            Change
                        </div>
                    )}
                </div>

                {/* City search modal */}
                {showCitySearch && (
                    <div style={s.cityModalOverlay}>
                        <div style={s.cityModal}>
                            <div style={s.cityModalTitle}>Search by city</div>
                            <div style={s.cityModalSub}>
                                Enter any city to see offices there
                            </div>
                            <div style={s.cityInputRow}>
                                <input
                                    style={s.cityInput}
                                    placeholder="e.g. Delhi, Mumbai, Jodhpur..."
                                    value={manualCity}
                                    onChange={(e) => setManualCity(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch(manualCity);
                                            setShowCitySearch(false);
                                        }
                                    }}
                                    autoFocus
                                />
                                <button
                                    style={s.citySearchBtn}
                                    onClick={() => {
                                        handleSearch(manualCity);
                                        setShowCitySearch(false);
                                    }}>
                                    Search
                                </button>
                            </div>
                            <div style={s.quickCities}>
                                {(() => {
                                    const recent = getRecentCities();
                                    const defaults = ['Delhi', 'Mumbai', 'Jodhpur', 'Udaipur', 'Kota'];
                                    const shown = recent.length > 0
                                        ? [...recent, ...defaults.filter(d => !recent.map(r=>r.toLowerCase()).includes(d.toLowerCase()))].slice(0, 6)
                                        : defaults;
                                    return shown.map((city, i) => (
                                        <button
                                            key={city}
                                            style={{
                                                ...s.quickCityBtn,
                                                ...(i < recent.length ? s.recentCityBtn : {})
                                            }}
                                            onClick={() => {
                                                handleSearch(city);
                                                setShowCitySearch(false);
                                            }}>
                                            {city}
                                        </button>
                                    ));
                                })()}
                            </div>
                            {searchError && (
                                <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B91C1C', marginBottom: 12, textAlign: 'center' }}>
                                    {searchError}
                                </div>
                            )}
                        <button
                                style={s.cityModalCancel}
                                onClick={() => setShowCitySearch(false)}>
                                Cancel
                            </button>
                        </div>
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

                {/* Empty state when no offices match filter */}
                {!loading && filtered.length === 0 && offices.length === 0 && (
                    <div style={s.emptyState}>
                        <div style={s.emptyIcon}>🏛️</div>
                        <div style={s.emptyTitle}>No offices found</div>
                        <div style={s.emptyText}>
                            No offices in this area yet. Try searching for Jaipur, Jodhpur, or Kota — those have data.
                        </div>
                        <button style={s.emptyBtn} onClick={() => setShowCitySearch(true)}>
                            Search a city
                        </button>
                    </div>
                )}
                {!loading && filtered.length === 0 && offices.length > 0 && (
                    <div style={s.emptyState}>
                        <div style={s.emptyIcon}>🏛️</div>
                        <div style={s.emptyTitle}>No {filter} offices found</div>
                        <div style={s.emptyText}>
                            No {filter} offices nearby. Try a different category.
                        </div>
                        <button style={s.emptyBtn} onClick={() => setFilter('All')}>
                            Show all offices
                        </button>
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

            {/* Bottom Nav — Home only */}
            <div style={s.bottomNav}>
                <div style={s.navItem}>
                    <NavIcon name="Home" active={true} />
                    <span style={{ ...s.navLabel, color: '#1A56DB' }}>Home</span>
                </div>
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
    searchInput: { border: 'none', background: 'transparent', fontSize: 14, fontFamily: "'Inter',sans-serif", color: '#374151', flex: 1, outline: 'none' },
    searchIcon: { width: 32, height: 32, background: '#1A56DB', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' },
    spinner: { width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    searchHint: { fontSize: 11, color: '#9CA3AF', marginTop: 6, paddingLeft: 4 },
    body: { flex: 1, overflowY: 'auto', padding: '16px 20px 90px' },
    pills: { display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 },
    pill: { flexShrink: 0, background: '#fff', border: '0.5px solid #EAECF0', borderRadius: 20, padding: '8px 14px', cursor: 'pointer', fontFamily: "'Inter',sans-serif" },
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
    bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 390, background: '#fff', borderTop: '0.5px solid #EAECF0', display: 'flex', justifyContent: 'center', padding: '10px 0 16px', zIndex: 100 },
    navItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' },
    navLabel: { fontSize: 10, fontWeight: 500, color: '#9CA3AF' },
    locationBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F4F6FB', border: '0.5px solid #EAECF0', borderRadius: 12, marginBottom: 14 },
    locationDot: { width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0, animation: 'pulse 2s infinite' },
    locationLabel: { fontSize: 13, fontWeight: 500, color: '#111827' },
    locationSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
    distBadge: { color: '#1A56DB', fontWeight: 600 },
    changeCityBtn: { fontSize: 12, color: '#1A56DB', fontWeight: 500, cursor: 'pointer' },
    cityModalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 },
    cityModal: { background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 390 },
    cityModalTitle: { fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 },
    cityModalSub: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
    cityInputRow: { display: 'flex', gap: 8, marginBottom: 16 },
    cityInput: { flex: 1, border: '0.5px solid #EAECF0', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none' },
    citySearchBtn: { background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer' },
    quickCities: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 16 },
    quickCityBtn: { background: '#F4F6FB', border: '0.5px solid #EAECF0', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#374151', cursor: 'pointer', fontFamily: "'Inter',sans-serif" },
    cityModalCancel: { width: '100%', background: 'transparent', border: 'none', color: '#6B7280', fontSize: 14, fontFamily: "'Inter',sans-serif", cursor: 'pointer', padding: 8 },
    noDataPill: { fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: '#F4F6FB', color: '#9CA3AF', border: '0.5px solid #E5E7EB' },
    lowConfBadge: { fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: '#FFFBEB', color: '#D97706', border: '0.5px solid #FDE68A', marginTop: 2 },
    recentCityBtn: { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' },
    refreshBtn: { background: 'transparent', border: 'none', fontSize: 16, color: '#6B7280', cursor: 'pointer', padding: '2px 6px', borderRadius: 6, lineHeight: 1 },
    emptyState: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' as const },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 8 },
    emptyText: { fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 },
    emptyBtn: { background: '#EBF2FF', border: '0.5px solid #BFDBFE', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#1A56DB', cursor: 'pointer', fontFamily: "'Inter',sans-serif" },
    locationPrompt: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '0 32px', background: '#fff', gap: 16 },
    lpIcon: { width: 80, height: 80, background: '#EBF2FF', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    lpTitle: { fontSize: 22, fontWeight: 700, color: '#111827', textAlign: 'center' as const },
    lpSub: { fontSize: 14, color: '#6B7280', textAlign: 'center' as const, lineHeight: 1.6 },
    lpAllow: { width: '100%', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer', marginTop: 8 },
    lpDeny: { width: '100%', background: 'transparent', border: '0.5px solid #EAECF0', borderRadius: 14, padding: 14, fontSize: 14, color: '#6B7280', fontFamily: "'Inter',sans-serif", cursor: 'pointer' },
};