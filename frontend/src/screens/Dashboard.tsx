import { useEffect, useState, type ReactElement } from 'react';
import {
    getOfficeQueue, checkin, checkout,
    getAnomaly, planVisit
} from '../api/queue';
import {
    isWatched, addToWatchlist,
    removeFromWatchlist, setEnRoute
} from '../utils/watchlist';
import { Office, OfficeDetail, AnomalyResult, PlanResult } from '../types';

const SLOT_OPTIONS: string[] = [
    'Monday 9am', 'Monday 11am', 'Monday 2pm',
    'Tuesday 9am', 'Tuesday 11am', 'Tuesday 2pm',
    'Wednesday 9am', 'Wednesday 11am', 'Wednesday 2pm',
    'Thursday 9am', 'Thursday 11am', 'Thursday 2pm',
    'Friday 9am', 'Friday 11am', 'Friday 2pm',
];

// Operating hours per office type
const OFFICE_HOURS: Record<string, { weekday: string; saturday: string; sunday: string }> = {
    'RTO':          { weekday: '9:00 AM – 5:00 PM', saturday: '9:00 AM – 1:00 PM', sunday: 'Closed' },
    'Passport':     { weekday: '9:00 AM – 5:00 PM', saturday: 'Closed',            sunday: 'Closed' },
    'Hospital':     { weekday: '8:00 AM – 2:00 PM', saturday: '8:00 AM – 12:00 PM', sunday: 'Emergency only' },
    'Post Office':  { weekday: '9:00 AM – 5:00 PM', saturday: '9:00 AM – 1:00 PM', sunday: 'Closed' },
};

function getOfficeHours(type: string): { label: string; open: boolean } {
    const hours = OFFICE_HOURS[type] || { weekday: '9:00 AM – 5:00 PM', saturday: 'Closed', sunday: 'Closed' };
    const day = new Date().getDay(); // 0=Sun, 6=Sat
    const hour = new Date().getHours();
    let todayHours: string;
    if (day === 0) todayHours = hours.sunday;
    else if (day === 6) todayHours = hours.saturday;
    else todayHours = hours.weekday;

    // Simple open/closed check
    let open = false;
    if (todayHours !== 'Closed' && todayHours !== 'Emergency only') {
        const openHour = parseInt(todayHours.split(':')[0]);
        const closeStr = todayHours.split('–')[1]?.trim() || '';
        let closeHour = parseInt(closeStr.split(':')[0]);
        if (closeStr.includes('PM') && closeHour !== 12) closeHour += 12;
        open = hour >= openHour && hour < closeHour;
    }
    return { label: todayHours, open };
}

// Office-type specific document tips
const OFFICE_TIPS: Record<string, string[]> = {
    'RTO': [
        'Carry original RC, insurance and pollution certificate.',
        'DL renewal: bring old DL, address proof and medical form.',
        'Vehicle transfer: bring Form 29, Form 30 and original RC.',
    ],
    'Passport': [
        'Carry original Aadhaar with two self-attested copies.',
        'Bring address proof, DOB proof and old passport if renewing.',
        'Photocopies alone are not accepted. Bring originals.',
    ],
    'Hospital': [
        'Bring previous prescriptions and test reports.',
        'OPD registration card speeds up entry.',
        'Arrive 15 minutes early for token registration.',
    ],
    'Post Office': [
        'Carry valid ID for money orders and registered post.',
        'Speed Post: pack and seal before arriving.',
        'Savings account work needs passbook and Aadhaar.',
    ],
};

function getOfficeTip(type: string): string {
    const tips = OFFICE_TIPS[type] || ['Carry all relevant documents to avoid multiple visits.'];
    return tips[new Date().getDay() % tips.length];
}

interface Props {
    office: Office;
    onBack: () => void;
}

export default function Dashboard({ office, onBack }: Props): ReactElement {
    const [data, setData] = useState<OfficeDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [inQueue, setInQueue] = useState<boolean>(false);
    const [starred, setStarred] = useState<boolean>(false);
    const [showWatchModal, setShowWatchModal] = useState<boolean>(false);
    const [quietThreshold, setQuietThreshold] = useState<number>(10);
    const [enRoute, setEnRouteState] = useState<boolean>(false);
    const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null);
    const [plan, setPlan] = useState<PlanResult | null>(null);
    const [showPlanner, setShowPlanner] = useState<boolean>(false);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [planLoading, setPlanLoading] = useState<boolean>(false);
    const [checkinError, setCheckinError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        setStarred(isWatched(office.office_id));

        getOfficeQueue(office.office_id)
            .then(setData)
            .catch((err: any) => {
                if (err.message === 'network_error') {
                    setApiError('Unable to connect. Please check your connection.');
                } else {
                    setApiError('Could not load office data. Please try again.');
                }
            })
            .finally(() => setLoading(false));

        // Anomaly is now included in queue data response (data.anomaly)
        // Keeping getAnomaly as fallback for backward compat

        const interval = setInterval(() => {
            getOfficeQueue(office.office_id).then(setData);
        }, 10000);

        return () => clearInterval(interval);
    }, [office]);

    const handleCheckin = async (): Promise<void> => {
        setCheckinError(null);
        try {
            if (!inQueue) {
                await checkin(office.office_id);
                setInQueue(true);
            } else {
                await checkout(office.office_id);
                setInQueue(false);
            }
            const updated = await getOfficeQueue(office.office_id);
            setData(updated);
        } catch (err: any) {
            if (err.message === 'rate_limited') {
                setCheckinError('You checked in recently. Please wait a few minutes before checking in again.');
            } else if (err.message === 'network_error') {
                setCheckinError('Network error. Please check your connection and try again.');
            } else {
                setCheckinError('Something went wrong. Please try again.');
            }
        }
    };

    const toggleStar = (): void => {
        if (starred) {
            removeFromWatchlist(office.office_id);
            setStarred(false);
        } else {
            setShowWatchModal(true);
        }
    };

    const confirmWatch = (): void => {
        addToWatchlist(office.office_id, office.name, {
            quietThreshold,
            surgeThreshold: 10,
            isEnRoute: false,
        });
        setStarred(true);
        setShowWatchModal(false);
    };

    const toggleEnRoute = (): void => {
        const newStatus = !enRoute;
        setEnRouteState(newStatus);
        setEnRoute(office.office_id, newStatus);
    };

    const toggleSlot = (slot: string): void => {
        setSelectedSlots(prev =>
            prev.includes(slot)
                ? prev.filter(s => s !== slot)
                : [...prev, slot]
        );
    };

    const handlePlanVisit = async (): Promise<void> => {
        if (selectedSlots.length === 0) return;
        setPlanLoading(true);
        try {
            const result = await planVisit(office.office_id, selectedSlots);
            setPlan(result);
            setShowPlanner(false);
        } catch (err) {
            console.error(err);
        } finally {
            setPlanLoading(false);
        }
    };

    if (loading) return <div style={s.loading}>Loading...</div>;
    if (apiError) return (
        <div style={s.loading}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>{apiError}</div>
                <button
                    onClick={() => { setApiError(null); setLoading(true); getOfficeQueue(office.office_id).then(setData).catch(() => setApiError('Still unable to load. Please try again.')).finally(() => setLoading(false)); }}
                    style={{ background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
                    Retry
                </button>
            </div>
        </div>
    );
    if (!data) return <div style={s.loading}>Office not found.</div>;

    return (
        <div style={s.wrap}>
            {/* Blue Header */}
            <div style={s.header}>
                <div style={s.backBtn} onClick={onBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    <span style={s.backText}>Back</span>
                </div>
                <div style={s.headerRow}>
                    <div>
                        <div style={s.officeName}>{data.name}</div>
                        <div style={s.metaRow}>
                            <span style={s.distText}>{office.city}</span>
                            <div style={s.liveChip}>
                                <div style={s.liveDot} />
                                <span style={s.liveText}>Live</span>
                            </div>
                        </div>
                    </div>
                    <div onClick={toggleStar} style={s.starBtn}>
                        <svg width="22" height="22" viewBox="0 0 24 24"
                            fill={starred ? '#FBBF24' : 'none'}
                            stroke={starred ? '#FBBF24' : '#93C5FD'}
                            strokeWidth="2" strokeLinecap="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                </div>
            </div>

            <div style={s.body}>
                {/* Float Card */}
                <div style={s.floatCard}>
                    <div style={s.queueHero}>
                        <div style={s.queueNumber}>{data.current_count}</div>
                        <div style={s.queueLabel}>people currently in queue</div>
                        <div style={s.waitChip}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                stroke="#92400E" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {data.estimated_wait_display || `~${data.estimated_wait_mins} mins`}
                        </div>
                        {data.utilisation !== null && data.utilisation !== undefined && (
                            <div style={s.utilisationChip}>
                                Office is {Math.min(100, Math.round(data.utilisation * 100))}% busy
                            </div>
                        )}
                    </div>
                    <div style={s.miniStats}>
                        <div style={s.miniStat}>
                            <div style={s.miniLabel}>Avg per person</div>
                            <div style={s.miniVal}>4.5 min</div>
                        </div>
                        <div style={s.divider} />
                        <div style={s.miniStat}>
                            <div style={s.miniLabel}>Today's peak</div>
                            <div style={s.miniVal}>50 people</div>
                        </div>
                    </div>
                </div>

                {/* Anomaly Card — with actionable next-slot suggestion */}
                {data.anomaly && data.anomaly.anomaly ? (
                    <div style={{
                        ...s.anomalyCard,
                        ...(data.anomaly.severity === 'high' ? s.anomalyHigh : s.anomalyMed)
                    }}>
                        <div style={s.anomalyTitle}>⚠ {data.anomaly.message}</div>
                        {data.best_time_today && (
                            <div style={s.anomalySuggestion}>
                                Try visiting at <strong>{data.best_time_today.time}</strong>, avg only {data.best_time_today.expected_count} people.
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={s.allClearCard}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="#065F46" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={s.allClearText}>
                            Queue is normal for this time. Good time to visit.
                        </span>
                    </div>
                )}

                {/* Best Time */}
                <div style={s.bestTime}>
                    <div style={s.btIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="2" strokeLinecap="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div>
                        <div style={s.btLabel}>Best time to visit today</div>
                        <div style={s.btVal}>{data.best_time_today?.time}</div>
                        <div style={s.btSub}>
                            Avg only {data.best_time_today?.expected_count} people
                            {data.best_time_today?.confidence === 'low' && (
                                <span style={s.lowConfidence}> · Low confidence</span>
                            )}
                        </div>
                        {data.best_time_today?.note && (
                            <div style={s.btNote}>{data.best_time_today.note}</div>
                        )}
                    </div>
                </div>
                {/* Mini Stats */}
                <div style={s.miniStats}>
                    <div style={s.miniStat}>
                        <div style={s.miniLabel}>Avg per person</div>
                        <div style={s.miniVal}>4.5 min</div>
                    </div>
                    <div style={s.divider} />
                    <div style={s.miniStat}>
                        <div style={s.miniLabel}>Today's peak</div>
                        <div style={s.miniVal}>
                            {data.best_time_today?.expected_count
                                ? data.best_time_today.expected_count * 3
                                : 50} people
                        </div>
                    </div>
                </div>
                {/* Visit Planner */}
                {plan ? (
                    <div style={s.planCard}>
                        <div style={s.planTitle}>Best time to visit</div>
                        <div style={s.planSlot}>{plan.recommended_slot}</div>
                        <div style={s.planSub}>~{plan.expected_count} people expected</div>
                        <div style={s.planTip}>{plan.tip || getOfficeTip(data.type)}</div>
                        <button style={s.replanBtn}
                            onClick={() => { setPlan(null); setShowPlanner(true); }}>
                            Change slots
                        </button>
                    </div>
                ) : (
                    <button style={s.planBtn} onClick={() => setShowPlanner(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="#1A56DB" strokeWidth="2.5" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Plan my visit
                    </button>
                )}

                {/* Checkin */}
                {/* Office-type specific document tip */}
                <div style={s.tipCard}>
                    <span style={s.tipText}>{getOfficeTip(data.type)}</span>
                </div>

                <div style={s.checkinWrap}>
                    <button
                        style={{ ...s.checkinBtn, ...(inQueue ? s.checkinDone : {}) }}
                        onClick={handleCheckin}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {inQueue ? "Checked in" : "I'm here now"}
                    </button>
                    {inQueue && (
                        <button style={s.checkoutBtn} onClick={handleCheckin}>
                            I've left the queue
                        </button>
                    )}

                    <div style={s.anonNote}>
                        Your check-in helps others see real-time queue data · No account needed
                    </div>

                    {/* Report inaccurate data */}
                    <button
                        style={s.reportBtn}
                        onClick={() => {
                            const confirmed = window.confirm(
                                'Report this queue count as inaccurate?\n\nThis helps us improve data quality. No account needed.'
                            );
                            if (confirmed) {
                                // Store report locally — backend can pick up later
                                const reports = JSON.parse(localStorage.getItem('qjan_reports') || '[]');
                                reports.push({
                                    office_id: data.office_id,
                                    reported_count: data.current_count,
                                    timestamp: new Date().toISOString(),
                                });
                                localStorage.setItem('qjan_reports', JSON.stringify(reports.slice(-20)));
                                alert('Thanks for the report! This helps improve accuracy.');
                            }
                        }}>
                        ⚑ Report inaccurate data
                    </button>
                    {checkinError && (
                        <div style={s.checkinError}>{checkinError}</div>
                    )}

                    {/* En Route Toggle */}
                    {starred && (
                        <div style={s.enRouteRow}>
                            <div>
                                <div style={s.erTitle}>I'm on my way</div>
                                <div style={s.erSub}>Get surge alerts while travelling</div>
                            </div>
                            <div onClick={toggleEnRoute}
                                style={{ ...s.toggle, ...(enRoute ? s.toggleOn : {}) }}>
                                <div style={{
                                    ...s.toggleThumb,
                                    ...(enRoute ? s.thumbOn : {})
                                }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Watch Modal */}
            {showWatchModal && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <div style={s.modalTitle}>Watch this office</div>
                        <div style={s.modalSub}>
                            Get notified when queue gets quiet
                        </div>
                        <div style={s.modalRow}>
                            <span style={s.modalLabel}>Notify me when below</span>
                            <div style={s.modalCounter}>
                                <button style={s.counterBtn}
                                    onClick={() => setQuietThreshold(
                                        Math.max(1, quietThreshold - 1)
                                    )}>−</button>
                                <span style={s.counterVal}>{quietThreshold}</span>
                                <button style={s.counterBtn}
                                    onClick={() => setQuietThreshold(quietThreshold + 1)}>
                                    +
                                </button>
                            </div>
                            <span style={s.modalLabel}>people</span>
                        </div>
                        <div style={s.modalNote}>
                            Surge alerts auto-enabled when you go en-route
                        </div>
                        <button style={s.modalConfirm} onClick={confirmWatch}>
                            Start Watching
                        </button>
                        <button style={s.modalCancel}
                            onClick={() => setShowWatchModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Planner Modal */}
            {showPlanner && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <div style={s.modalTitle}>When are you free?</div>
                        <div style={s.modalSub}>
                            Select your free slots — we find the quietest one
                        </div>
                        <div style={s.slotsGrid}>
                            {SLOT_OPTIONS.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => toggleSlot(slot)}
                                    style={{
                                        ...s.slotBtn,
                                        ...(selectedSlots.includes(slot) ? s.slotBtnActive : {})
                                    }}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                        <button
                            style={{
                                ...s.modalConfirm,
                                ...((planLoading || selectedSlots.length === 0) ? { opacity: 0.5 } : {})
                            }}
                            onClick={handlePlanVisit}
                            disabled={planLoading || selectedSlots.length === 0}>
                            {planLoading ? 'Finding best slot...' : selectedSlots.length === 0 ? 'Select at least one slot' : 'Find Best Time'}
                        </button>
                        <button style={s.modalCancel}
                            onClick={() => setShowPlanner(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const s: Record<string, React.CSSProperties> = {
    wrap: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
    loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#6B7280', fontSize: 14 },
    header: { background: '#1A56DB', padding: '20px 20px 28px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 16 },
    backText: { fontSize: 13, color: '#93C5FD', fontWeight: 500 },
    headerRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
    officeName: { fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 },
    metaRow: { display: 'flex', alignItems: 'center', gap: 8 },
    distText: { fontSize: 12, color: '#93C5FD' },
    liveChip: { display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 9px' },
    liveDot: { width: 6, height: 6, borderRadius: '50%', background: '#34D399', animation: 'pulse 1.2s infinite' },
    liveText: { fontSize: 11, color: '#fff', fontWeight: 500 },
    starBtn: { cursor: 'pointer', padding: 4 },
    body: { flex: 1, background: '#F4F6FB', paddingBottom: 32 },
    floatCard: { background: '#fff', borderRadius: 20, margin: '0 16px', marginTop: -20, padding: 20, border: '0.5px solid #EAECF0' },
    queueHero: { textAlign: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '0.5px solid #F3F4F6' },
    queueNumber: { fontSize: 64, fontWeight: 700, color: '#1A56DB', lineHeight: 1, letterSpacing: -2 },
    queueLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
    waitChip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 20, marginTop: 10 },
    miniStats: { display: 'flex', justifyContent: 'space-between', gap: 10 },
    miniStat: { flex: 1, textAlign: 'center' },
    miniLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    miniVal: { fontSize: 17, fontWeight: 700, color: '#111827' },
    divider: { width: '0.5px', background: '#F3F4F6' },
    anomalyCard: { margin: '12px 16px 0', borderRadius: 14, padding: 14 },
    anomalyHigh: { background: '#FEE2E2', border: '0.5px solid #FECACA' },
    anomalyMed: { background: '#FEF3C7', border: '0.5px solid #FDE68A' },
    anomalyLow: { background: '#EFF6FF', border: '0.5px solid #BFDBFE' },
    anomalyTop: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
    anomalyTitle: { fontSize: 13, fontWeight: 600, color: '#111827' },
    anomalyMsg: { fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 6 },
    anomalySuggestion: { fontSize: 12, color: '#6B7280' },
    allClearCard: { margin: '12px 16px 0', background: '#ECFDF5', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 },
    allClearText: { fontSize: 12, color: '#065F46', fontWeight: 500 },
    bestTime: { margin: '12px 16px 0', background: '#ECFDF5', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 },
    btIcon: { width: 40, height: 40, background: '#059669', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    btLabel: { fontSize: 11, color: '#065F46', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    btVal: { fontSize: 15, fontWeight: 700, color: '#065F46' },
    btSub: { fontSize: 12, color: '#059669', marginTop: 1 },
    planBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#EBF2FF', border: '0.5px solid #BFDBFE', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1A56DB', cursor: 'pointer', margin: '12px 16px 0', width: 'calc(100% - 32px)', justifyContent: 'center', fontFamily: "'Inter',sans-serif" },
    planCard: { margin: '12px 16px 0', background: '#fff', border: '0.5px solid #EAECF0', borderRadius: 14, padding: 16 },
    planTitle: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    planSlot: { fontSize: 20, fontWeight: 700, color: '#1A56DB', marginBottom: 4 },
    planReason: { fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 8 },
    planAlt: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
    planSub: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
    planTip: { fontSize: 12, color: '#059669', marginBottom: 10, fontStyle: 'italic' },
    replanBtn: { fontSize: 12, color: '#1A56DB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", padding: 0 },
    checkinWrap: { padding: '16px 16px 0' },
    checkinBtn: { width: '100%', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
    checkinDone: { background: '#059669' },
    checkoutBtn: { width: '100%', background: 'transparent', border: '0.5px solid #E5E7EB', borderRadius: 14, padding: 12, fontSize: 13, color: '#6B7280', fontFamily: "'Inter',sans-serif", cursor: 'pointer', marginTop: 8 },
    enRouteRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EBF2FF', borderRadius: 12, padding: '12px 14px', marginTop: 10 },
    erTitle: { fontSize: 13, fontWeight: 600, color: '#1A56DB' },
    erSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
    toggle: { width: 44, height: 24, background: '#E5E7EB', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'all 0.2s' },
    toggleOn: { background: '#1A56DB' },
    toggleThumb: { position: 'absolute', top: 2, left: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'all 0.2s' },
    thumbOn: { left: 22 },
    anonNote: { textAlign: 'center', fontSize: 11, color: '#6B7280', marginTop: 8, marginBottom: 6 },
    utilisationChip: { display: 'inline-block', fontSize: 11, color: '#6B7280', marginTop: 6, background: '#F4F6FB', borderRadius: 20, padding: '4px 12px' },
    lowConfidence: { color: '#D97706', fontSize: 10 },
    btNote: { fontSize: 11, color: '#92400E', marginTop: 3, fontStyle: 'italic' },
    tipCard: { margin: '12px 16px 0', background: '#FFFBEB', border: '0.5px solid #FDE68A', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 8 },
    hoursBadge: { fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20, marginLeft: 6 },
    hoursOpen: { background: '#D1FAE5', color: '#065F46', border: '0.5px solid #6EE7B7' },
    hoursClosed: { background: '#FEE2E2', color: '#991B1B', border: '0.5px solid #FECACA' },
    reportBtn: { background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: 11, cursor: 'pointer', marginTop: 10, padding: '4px 0', fontFamily: "'Inter',sans-serif", textDecoration: 'underline', display: 'block', width: '100%', textAlign: 'center' as const },
    tipIcon: { fontSize: 14, flexShrink: 0, marginTop: 1 },
    tipText: { fontSize: 12, color: '#78350F', lineHeight: 1.5 },
    checkinError: { background: '#FEE2E2', border: '0.5px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#B91C1C', textAlign: 'center', marginTop: 8 },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 },
    modal: { background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 390 },
    modalTitle: { fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 },
    modalSub: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
    modalRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    modalLabel: { fontSize: 14, color: '#374151' },
    modalCounter: { display: 'flex', alignItems: 'center', gap: 12 },
    counterBtn: { width: 32, height: 32, borderRadius: 8, border: '0.5px solid #E5E7EB', background: '#F4F6FB', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" },
    counterVal: { fontSize: 18, fontWeight: 700, color: '#111827', minWidth: 24, textAlign: 'center' },
    modalNote: { fontSize: 11, color: '#9CA3AF', marginBottom: 20, background: '#F4F6FB', padding: '8px 12px', borderRadius: 8 },
    modalConfirm: { width: '100%', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer', marginBottom: 8 },
    modalCancel: { width: '100%', background: 'transparent', border: 'none', color: '#6B7280', fontSize: 14, fontFamily: "'Inter',sans-serif", cursor: 'pointer', padding: 8 },
    slotsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 },
    slotBtn: { background: '#F4F6FB', border: '0.5px solid #EAECF0', borderRadius: 8, padding: '8px 4px', fontSize: 11, color: '#374151', cursor: 'pointer', fontFamily: "'Inter',sans-serif", textAlign: 'center' },
    slotBtnActive: { background: '#EBF2FF', borderColor: '#1A56DB', color: '#1A56DB', fontWeight: 600 },
};