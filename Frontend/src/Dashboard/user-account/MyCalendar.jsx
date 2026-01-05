import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { BASE_URL } from '../../config';
import { authContext } from '../../context/AuthContext';
import { HiOutlineCalendar, HiOutlineSun, HiOutlineLightBulb } from 'react-icons/hi';

const LOCAL_EVENT_COLOR = '#1d4ed8';
const GOOGLE_EVENT_COLOR = '#0b89da';
const DEFAULT_DURATION_MINUTES = 50;
const HORIZON_HOURS = 48;
const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const filterOptions = [
	{ id: 'all', label: 'Todo' },
	{ id: 'psiconepsis', label: 'Psiconepsis' },
	{ id: 'google', label: 'Google' },
];

const viewOptions = [
	{ id: 'timeGridWeek', label: 'Semana' },
	{ id: 'timeGridDay', label: 'Día' },
	{ id: 'dayGridMonth', label: 'Mes' },
];

const mapBookingsToEvents = (bookings = []) =>
	bookings.map((booking) => {
		const startDate = new Date(booking.appointmentDate);
		const endDate = booking.endDate
			? new Date(booking.endDate)
			: new Date(startDate.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);

		return {
			id: booking._id,
			title: booking.reason || booking.doctor?.name || 'Cita programada',
			start: startDate.toISOString(),
			end: endDate.toISOString(),
			backgroundColor: LOCAL_EVENT_COLOR,
			borderColor: LOCAL_EVENT_COLOR,
			extendedProps: {
				source: 'psiconepsis',
				doctorName: booking.doctor?.name || 'Profesional',
				doctorSpecialty: booking.doctor?.specialization || 'Medicina',
				reason: booking.reason,
			},
		};
	});

const mapGoogleItemsToEvents = (items = []) =>
	items
		.filter((item) => item.start?.dateTime || item.start?.date)
		.map((item) => {
			const startIso = item.start.dateTime || `${item.start.date}T08:00:00`;
			const endIso = item.end?.dateTime || (item.end?.date ? `${item.end.date}T09:00:00` : startIso);
			return {
				id: item.id,
				title: item.summary || 'Evento de Google',
				start: startIso,
				end: endIso,
				backgroundColor: GOOGLE_EVENT_COLOR,
				borderColor: GOOGLE_EVENT_COLOR,
				extendedProps: {
					source: 'google',
					description: item.description,
					creator: item.creator?.email,
				},
			};
		});

const describeEventTiming = (start, end) => {
	const startDate = new Date(start);
	const endDate = end ? new Date(end) : null;
	if (Number.isNaN(startDate.getTime())) return 'Sin horario confirmado';
	const dayLabel = startDate.toLocaleDateString('es-ES', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
	const startTime = startDate.toLocaleTimeString('es-ES', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
	const endTime = endDate
		? endDate.toLocaleTimeString('es-ES', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		  })
		: '';
	return `${dayLabel} · ${startTime}${endTime ? ` - ${endTime}` : ''}`;
};

const formatSelectedDay = (date) =>
	date.toLocaleDateString('es-ES', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

const isSameLocalDay = (a, b) =>
	a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const sourceLabel = (source) => (source === 'google' ? 'Google' : 'Psiconepsis');

const sourceBadgeClass = (source) => {
	if (source === 'google') return 'bg-sky-50 text-sky-700 border border-sky-100';
	if (source === 'psiconepsis') return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
	return 'bg-slate-100 text-slate-600 border border-slate-200';
};

const sortByStart = (events = []) =>
	[...events].sort((a, b) => new Date(a.start) - new Date(b.start));

const computeStreak = (activeDaysSet) => {
	let streak = 0;
	const today = new Date();
	for (let i = 0; i < 14; i += 1) {
		const probe = new Date(today);
		probe.setDate(today.getDate() - i);
		const key = probe.toISOString().split('T')[0];
		if (activeDaysSet.has(key)) streak += 1;
		else break;
	}
	return streak;
};

const computeInsights = (localEvents, googleEvents) => {
	const windowDays = 14;
	const now = new Date();
	const windowStart = new Date();
	windowStart.setDate(now.getDate() - (windowDays - 1));
	const activeDays = new Set();
	[...localEvents, ...googleEvents].forEach((evt) => {
		const startDate = new Date(evt.start);
		if (!Number.isNaN(startDate.getTime()) && startDate >= windowStart) {
			activeDays.add(startDate.toISOString().split('T')[0]);
		}
	});
	const coveragePercent = Math.min(100, Math.round((activeDays.size / windowDays) * 100));
	let coverageLabel = 'Cobertura parcial';
	if (coveragePercent >= 80) coverageLabel = 'Cobertura dominante';
	else if (coveragePercent <= 30) coverageLabel = 'Cobertura ligera';
	const doctorNames = new Set();
	localEvents.forEach((evt) => {
		if (evt.extendedProps?.doctorName) doctorNames.add(evt.extendedProps?.doctorName);
	});
	return {
		spanLabel: 'Últimos 14 días',
		coveragePercent,
		coverageLabel,
		streakDays: computeStreak(activeDays),
		doctors: doctorNames.size,
	};
};

const computeExperience = (events) => {
	if (!events.length) {
		return {
			balanceLabel: 'Aún sin agenda registrada',
			peakDay: 'sin datos',
			cadenceLabel: 'Ligera',
			googleShare: 0,
			focusSuggestion: 'Registra o importa tu primera cita',
		};
	}
	const localCount = events.filter((evt) => evt.extendedProps?.source === 'psiconepsis').length;
	const googleCount = events.filter((evt) => evt.extendedProps?.source === 'google').length;
	const total = events.length;
	const googleShare = total ? Math.round((googleCount / total) * 100) : 0;
	let balanceLabel = 'Agenda equilibrada';
	if (googleShare > 60) balanceLabel = 'Predominio externo';
	else if (googleShare < 30) balanceLabel = 'Semana local intensiva';
	const distribution = new Array(7).fill(0);
	events.forEach((evt) => {
		const dayIndex = new Date(evt.start).getDay();
		if (!Number.isNaN(dayIndex)) distribution[dayIndex] += 1;
	});
	const peakIndex = distribution.indexOf(Math.max(...distribution));
	const peakDay = distribution[peakIndex] === 0 ? 'sin datos' : dayNames[peakIndex];
	const last7 = new Date();
	last7.setDate(last7.getDate() - 6);
	const cadenceCount = events.filter((evt) => new Date(evt.start) >= last7).length;
	const cadenceLabel = cadenceCount >= 6 ? 'Intensa' : cadenceCount >= 3 ? 'Constante' : 'Ligera';
	const focusSuggestion = distribution[peakIndex] === 0
		? 'Abre nuevos slots locales'
		: `Protege los ${dayNames[peakIndex].toLowerCase()}`;
	return { balanceLabel, peakDay, cadenceLabel, googleShare, focusSuggestion };
};

const formatTimeUntil = (date) => {
	const now = Date.now();
	const target = date?.getTime?.();
	if (!target || Number.isNaN(target)) return '';
	const diffMs = target - now;
	if (diffMs <= 0) return 'ya empezó';
	const diffMin = Math.round(diffMs / 60000);
	if (diffMin < 60) return `en ${diffMin} min`;
	const diffHr = Math.round(diffMin / 60);
	if (diffHr < 24) return `en ${diffHr} h`;
	const diffDay = Math.round(diffHr / 24);
	return `en ${diffDay} días`;
};

const CBT_HOMEWORK_ITEMS = [
	{ id: 'registro', label: 'Hice al menos 1 registro de pensamientos' },
	{ id: 'actividad', label: 'Programé 1 actividad agradable o importante' },
	{ id: 'exposicion', label: 'Di 1 paso de exposición (si aplica)' },
	{ id: 'respiracion', label: 'Practicé respiración/relajación 5 min' },
	{ id: 'revision', label: 'Revisé mi plan y lo comenté en sesión' },
];

const CBT_EMOTIONS = [
	'Ansiedad',
	'Tristeza',
	'Ira',
	'Frustración',
	'Vergüenza',
	'Culpa',
	'Miedo',
	'Estrés',
	'Otra',
];

const loadChecklistState = (storageKey) => {
	try {
		const raw = localStorage.getItem(storageKey);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
};

const saveChecklistState = (storageKey, state) => {
	try {
		localStorage.setItem(storageKey, JSON.stringify(state));
	} catch {
		// ignore
	}
};

const toDayKey = (date) => {
	const d = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(d.getTime())) return 'general';
	return d.toISOString().split('T')[0];
};

const startOfWeekMonday = (date) => {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return new Date();
	const day = d.getDay();
	const diff = (day === 0 ? -6 : 1) - day; // move to Monday
	d.setDate(d.getDate() + diff);
	d.setHours(0, 0, 0, 0);
	return d;
};

const toWeekKey = (date) => toDayKey(startOfWeekMonday(date));

const MyCalendar = () => {
	const { user, token, authProvider } = useContext(authContext);
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [googleError, setGoogleError] = useState(null);
	const [calendarView, setCalendarView] = useState('timeGridWeek');
	const [eventFilter, setEventFilter] = useState(filterOptions[0].id);
	const [isGoogleConnected, setIsGoogleConnected] = useState(false);
	const [selectedDate, setSelectedDate] = useState(() => new Date());
	const [cbtPrepState, setCbtPrepState] = useState(() => loadChecklistState('mycalendar_cbt_prep_v1'));
	const [cbtThoughtState, setCbtThoughtState] = useState(() => loadChecklistState('mycalendar_cbt_thoughts_v1'));
	const [cbtHomeworkState, setCbtHomeworkState] = useState(() => loadChecklistState('mycalendar_cbt_homework_v1'));
	const calendarRef = useRef(null);
	const isGoogleAccount = (authProvider || user?.authProvider) === 'google';

	useEffect(() => {
		saveChecklistState('mycalendar_cbt_prep_v1', cbtPrepState);
	}, [cbtPrepState]);

	useEffect(() => {
		saveChecklistState('mycalendar_cbt_thoughts_v1', cbtThoughtState);
	}, [cbtThoughtState]);

	useEffect(() => {
		saveChecklistState('mycalendar_cbt_homework_v1', cbtHomeworkState);
	}, [cbtHomeworkState]);

	useEffect(() => {
		if (!token) {
			setLoading(false);
			setError('No hay sesión activa.');
			return;
		}
		let isMounted = true;
		const fetchLocalEvents = async () => {
			const response = await fetch(`${BASE_URL}/bookings`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || result.message || 'No se pudieron cargar tus citas');
			}
			return mapBookingsToEvents(result.data || []);
		};
		const fetchGoogleEvents = async () => {
			const response = await fetch(`${BASE_URL}/calendar/events`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok) {
				const message = result.error || result.message || 'No se pudo sincronizar con Google Calendar';
				const err = new Error(message);
				err.status = response.status;
				throw err;
			}
			return mapGoogleItemsToEvents(result.data || []);
		};
		const loadEvents = async () => {
			setLoading(true);
			setError(null);
			setGoogleError(null);
			try {
				const googlePromise = isGoogleAccount ? fetchGoogleEvents() : Promise.resolve([]);
				const [localResult, googleResult] = await Promise.allSettled([
					fetchLocalEvents(),
					googlePromise,
				]);
				if (!isMounted) return;
				const localEvents = localResult.status === 'fulfilled' ? localResult.value : [];
				const googleEvents = googleResult.status === 'fulfilled' ? googleResult.value : [];
				setEvents([...localEvents, ...(isGoogleAccount ? googleEvents : [])]);
				if (localResult.status === 'rejected') {
					setError(localResult.reason?.message || 'No se pudieron cargar las citas locales');
				}
				if (isGoogleAccount) {
					if (googleResult.status === 'rejected') {
						setGoogleError(googleResult.reason?.message || 'Conecta tu Google Calendar para sincronizar.');
						setIsGoogleConnected(false);
					} else {
						setIsGoogleConnected(googleEvents.length > 0);
					}
				} else {
					setIsGoogleConnected(false);
				}
			} catch (err) {
				if (!isMounted) return;
				setError(err.message || 'No se pudo cargar la agenda');
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		loadEvents();
		return () => {
			isMounted = false;
		};
	}, [token, isGoogleAccount]);

	useEffect(() => {
		if (!isGoogleAccount && eventFilter === 'google') {
			setEventFilter('all');
		}
	}, [isGoogleAccount, eventFilter]);

	useEffect(() => {
		const api = calendarRef.current?.getApi?.();
		if (api && api.view.type !== calendarView) {
			api.changeView(calendarView);
		}
	}, [calendarView]);

	const filteredEvents = useMemo(() => {
		if (eventFilter === 'all') return events;
		return events.filter((evt) => evt.extendedProps?.source === eventFilter);
	}, [events, eventFilter]);

	const dayAgendaEvents = useMemo(() => {
		const base = eventFilter === 'all' ? events : filteredEvents;
		return sortByStart(
			base.filter((evt) => {
				const startDate = new Date(evt.start);
				return !Number.isNaN(startDate.getTime()) && isSameLocalDay(startDate, selectedDate);
			})
		);
	}, [events, filteredEvents, eventFilter, selectedDate]);

	const localEvents = useMemo(
		() => events.filter((evt) => evt.extendedProps?.source === 'psiconepsis'),
		[events]
	);

	const googleEvents = useMemo(
		() => events.filter((evt) => evt.extendedProps?.source === 'google'),
		[events]
	);

	const stats = useMemo(() => {
		const weekStart = new Date();
		weekStart.setDate(weekStart.getDate() - 6);
		const weekLocal = localEvents.filter((evt) => new Date(evt.start) >= weekStart).length;
		return {
			local: localEvents.length,
			google: googleEvents.length,
			weekLocal,
		};
	}, [localEvents, googleEvents]);

	const insights = useMemo(() => computeInsights(localEvents, googleEvents), [localEvents, googleEvents]);
	const experience = useMemo(() => computeExperience(events), [events]);

	const upcomingEvents = useMemo(() => {
		const now = new Date();
		return sortByStart(events).filter((evt) => new Date(evt.start) >= now).slice(0, 4);
	}, [events]);

	const nextFortyEight = useMemo(() => {
		const now = Date.now();
		const limit = now + HORIZON_HOURS * 60 * 60 * 1000;
		return sortByStart(events).filter((evt) => {
			const start = new Date(evt.start).getTime();
			return !Number.isNaN(start) && start >= now && start <= limit;
		});
	}, [events]);

	const nextLocalSlot = useMemo(() => {
		const now = new Date();
		return sortByStart(localEvents).find((evt) => new Date(evt.start) >= now);
	}, [localEvents]);

	const selectedDayPrimaryEvent = useMemo(() => {
		if (dayAgendaEvents.length === 0) return null;
		return dayAgendaEvents[0];
	}, [dayAgendaEvents]);

	const dayKey = useMemo(() => toDayKey(selectedDate), [selectedDate]);
	const weekKey = useMemo(() => toWeekKey(selectedDate), [selectedDate]);

	const prepForDay = useMemo(() => cbtPrepState?.[dayKey] || {}, [cbtPrepState, dayKey]);
	const thoughtsForDay = useMemo(() => cbtThoughtState?.[dayKey] || [], [cbtThoughtState, dayKey]);
	const homeworkForWeek = useMemo(() => cbtHomeworkState?.[weekKey] || {}, [cbtHomeworkState, weekKey]);

	const [thoughtDraft, setThoughtDraft] = useState({
		situation: '',
		thought: '',
		emotion: 'Ansiedad',
		intensity: 5,
		alternative: '',
	});

	useEffect(() => {
		setThoughtDraft((d) => ({ ...d, situation: '', thought: '', alternative: '' }));
	}, [dayKey]);

	const updatePrepField = (field, value) => {
		setCbtPrepState((prev) => ({
			...(prev || {}),
			[dayKey]: {
				...(prev?.[dayKey] || {}),
				[field]: value,
			},
		}));
	};

	const addThoughtRecord = () => {
		const situation = (thoughtDraft.situation || '').trim();
		const thought = (thoughtDraft.thought || '').trim();
		const emotion = (thoughtDraft.emotion || '').trim();
		const alternative = (thoughtDraft.alternative || '').trim();
		const intensity = Number(thoughtDraft.intensity);
		if (!situation || !thought) return;
		setCbtThoughtState((prev) => {
			const list = Array.isArray(prev?.[dayKey]) ? prev[dayKey] : [];
			const entry = {
				id: `${Date.now()}`,
				createdAt: new Date().toISOString(),
				situation,
				thought,
				emotion: emotion || 'Ansiedad',
				intensity: Number.isFinite(intensity) ? Math.max(0, Math.min(10, intensity)) : 5,
				alternative,
			};
			return { ...(prev || {}), [dayKey]: [entry, ...list].slice(0, 20) };
		});
		setThoughtDraft({ situation: '', thought: '', emotion: 'Ansiedad', intensity: 5, alternative: '' });
	};

	const removeThoughtRecord = (id) => {
		setCbtThoughtState((prev) => {
			const list = Array.isArray(prev?.[dayKey]) ? prev[dayKey] : [];
			return { ...(prev || {}), [dayKey]: list.filter((x) => x.id !== id) };
		});
	};

	const toggleHomeworkItem = (itemId) => {
		setCbtHomeworkState((prev) => {
			const current = prev?.[weekKey] || {};
			return { ...(prev || {}), [weekKey]: { ...current, [itemId]: !current[itemId] } };
		});
	};

	const clearCbtForDay = () => {
		setCbtPrepState((prev) => {
			const next = { ...(prev || {}) };
			delete next[dayKey];
			return next;
		});
		setCbtThoughtState((prev) => {
			const next = { ...(prev || {}) };
			delete next[dayKey];
			return next;
		});
	};

	const activeFilterLabel = useMemo(() => {
		const match = filterOptions.find((option) => option.id === eventFilter);
		return match?.label || 'Todo';
	}, [eventFilter]);

	const handleViewToggle = (viewId) => setCalendarView(viewId);
	const handleConnectGoogle = () => {
		window.location.href = `${BASE_URL}/calendar/google-auth`;
	};
	const jumpToToday = () => {
		const api = calendarRef.current?.getApi?.();
		api?.today();
		setSelectedDate(new Date());
	};
	const handleDateClick = (arg) => {
		if (arg?.date) setSelectedDate(arg.date);
	};

	const displayedFilterOptions = useMemo(
		() => (isGoogleAccount ? filterOptions : filterOptions.filter((option) => option.id !== 'google')),
		[isGoogleAccount]
	);
	const showGoogleCTA = isGoogleAccount && !isGoogleConnected;
	const showGoogleNotice = isGoogleAccount && Boolean(googleError);
	const noEvents = events.length === 0;
	const showUpcomingTimeline = upcomingEvents.length > 0;

	return (
		<>
			<div className="space-y-6">
			<div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur">
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div className="flex items-start gap-4">
						<div className="rounded-2xl bg-primaryColor/10 p-3 text-primaryColor">
							<HiOutlineCalendar className="h-7 w-7" />
						</div>
						<div className="max-w-2xl space-y-1">
							<p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Mis citas</p>
							<h1 className="text-3xl font-semibold leading-tight text-slate-900 text-pretty">
								Tablero operativo con calendario curado
							</h1>
							<p className="text-sm leading-relaxed text-slate-600 text-pretty">
								{insights.spanLabel} · {experience.balanceLabel}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<button
							onClick={jumpToToday}
							className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
						>
							Volver a hoy
						</button>
						{showGoogleCTA && (
							<button
								onClick={handleConnectGoogle}
								className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
							>
								{isGoogleAccount ? 'Renovar Google' : 'Conectar Google'}
							</button>
						)}
					</div>
				</div>
				<div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-600">
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold uppercase tracking-[0.3em]">
						{insights.streakDays} días seguidos
					</span>
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold uppercase tracking-[0.3em]">
						{experience.peakDay}
					</span>
					<span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold uppercase tracking-[0.3em]">
						Cobertura {insights.coveragePercent}%
					</span>
				</div>
			</div>

				{error && (
					<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
				)}

				<div className="space-y-6">
					<section
						className="glass-panel"
						style={{
							'--glass-panel-bg': 'linear-gradient(140deg, rgba(255, 255, 255, 0.92), rgba(235, 241, 255, 0.9))',
							'--glass-panel-border': 'rgba(15, 23, 42, 0.10)',
							'--glass-panel-shadow': '0 25px 60px rgba(15, 23, 42, 0.10)',
							'--glass-panel-overlay': '0.65',
						}}
					>
						<div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
							<div className="flex items-center gap-3">
								<div className="rounded-2xl bg-slate-900/10 p-2 text-slate-900">
									<HiOutlineCalendar className="h-5 w-5" />
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Calendario principal</p>
									<p className="text-sm leading-relaxed text-slate-500">{stats.local + stats.google} eventos sincronizados</p>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{displayedFilterOptions.map((option) => (
									<button
										key={option.id}
										onClick={() => setEventFilter(option.id)}
										className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
											eventFilter === option.id
												? 'border-slate-900 bg-slate-900 text-white'
												: 'border-slate-200 text-slate-600 hover:border-slate-300'
										}`}
										type="button"
									>
										{option.label}
									</button>
								))}
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{viewOptions.map((option) => (
									<button
										key={option.id}
										onClick={() => handleViewToggle(option.id)}
										className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
											calendarView === option.id
												? 'border-slate-900 bg-slate-900 text-white'
												: 'border-slate-200 text-slate-600 hover:border-slate-300'
										}`}
										type="button"
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 text-sm text-slate-600">
							<div className="flex flex-wrap gap-3">
								<div className="rounded-2xl border border-slate-200 px-3 py-2">
									<p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Psiconepsis</p>
									<p className="text-lg font-semibold text-slate-900">{stats.local}</p>
								</div>
								{isGoogleAccount && (
									<div className="rounded-2xl border border-slate-200 px-3 py-2">
										<p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Google</p>
										<p className="text-lg font-semibold text-slate-900">{stats.google}</p>
									</div>
								)}
								<div className="rounded-2xl border border-slate-200 px-3 py-2">
									<p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Semana</p>
									<p className="text-lg font-semibold text-slate-900">{stats.weekLocal}</p>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<button
									onClick={jumpToToday}
									className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
									type="button"
								>
									Hoy
								</button>
								{showGoogleCTA && (
									<button
										onClick={handleConnectGoogle}
										className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
										type="button"
									>
										Google OAuth
									</button>
								)}
							</div>
						</div>

						<div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white">
							{loading ? (
								<div className="flex h-[620px] items-center justify-center text-sm text-slate-500">
									Sincronizando tu universo de citas…
								</div>
							) : (
								<div className="relative">
									{noEvents && (
										<div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">
											Sin eventos aún
										</div>
									)}
									<FullCalendar
										ref={calendarRef}
										plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
										initialView={calendarView}
										events={filteredEvents}
										locale={esLocale}
										height="640px"
										firstDay={1}
										headerToolbar={false}
										nowIndicator
										scrollTime="08:00:00"
										slotMinTime="06:00:00"
										slotMaxTime="22:00:00"
										slotDuration="00:30:00"
										eventDisplay="block"
										allDaySlot={false}
										expandRows
										dayMaxEvents
										dateClick={handleDateClick}
									/>
								</div>
							)}
						</div>
					</section>

					<div
						className="glass-panel"
						style={{
							'--glass-panel-bg': 'linear-gradient(140deg, rgba(16, 185, 129, 0.18), rgba(8, 145, 178, 0.18))',
							'--glass-panel-border': 'rgba(13, 148, 136, 0.28)',
							'--glass-panel-shadow': '0 25px 60px rgba(5, 92, 104, 0.18)',
							'--glass-panel-overlay': '0.4',
						}}
					>
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Agenda del día ☀️</p>
							<span className="text-xs text-slate-500">{formatSelectedDay(selectedDate)}</span>
						</div>
						<div className="mt-4 space-y-3">
							{dayAgendaEvents.length === 0 ? (
								<p className="text-sm leading-relaxed text-slate-500 text-pretty">Sin eventos para esta fecha.</p>
							) : (
								dayAgendaEvents.map((evt) => (
									<div key={`${evt.extendedProps?.source || 'evt'}-${evt.id}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
										<div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
											<span className={`rounded-full px-2 py-0.5 font-semibold ${sourceBadgeClass(evt.extendedProps?.source)}`}>
												{sourceLabel(evt.extendedProps?.source)}
											</span>
											<span className="truncate">{describeEventTiming(evt.start, evt.end)}</span>
										</div>
										<p className="mt-2 text-sm font-semibold leading-snug text-slate-900">{evt.title}</p>
										{evt.extendedProps?.doctorName && (
											<p className="mt-1 text-xs leading-relaxed text-slate-500">{evt.extendedProps.doctorName}</p>
										)}
									</div>
								))
							)}
						</div>
					</div>

					<div
						className="glass-panel"
						style={{
							'--glass-panel-bg': 'linear-gradient(140deg, rgba(79, 70, 229, 0.16), rgba(15, 118, 177, 0.14))',
							'--glass-panel-border': 'rgba(79, 70, 229, 0.25)',
							'--glass-panel-shadow': '0 25px 60px rgba(30, 41, 59, 0.18)',
							'--glass-panel-overlay': '0.3',
						}}
					>
						<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">Herramientas TCC 🧠</p>
							<button
								onClick={clearCbtForDay}
								className="text-xs font-semibold text-slate-500 hover:text-slate-700"
								type="button"
							>
								Borrar del día
							</button>
						</div>

						<div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
							{nextLocalSlot ? (
								<div className="space-y-1 text-sm leading-relaxed">
									<p className="font-semibold text-slate-900">Próxima sesión</p>
									<p className="text-slate-700">{nextLocalSlot.title}</p>
									<p className="text-xs text-slate-500">
										{describeEventTiming(nextLocalSlot.start, nextLocalSlot.end)} · {formatTimeUntil(new Date(nextLocalSlot.start))}
									</p>
									{nextLocalSlot.extendedProps?.doctorSpecialty && (
										<p className="text-xs text-slate-500">Enfoque: {nextLocalSlot.extendedProps.doctorSpecialty}</p>
									)}
								</div>
							) : (
								<p className="text-sm leading-relaxed text-slate-600 text-pretty">
									Si no tienes sesión agendada, igual puedes usar estos ejercicios.
								</p>
							)}
						</div>

						<div className="mt-6 grid gap-6 lg:grid-cols-2">
							<div className="rounded-3xl border border-slate-100 bg-white p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Preparación (2 min)</p>
								<div className="mt-4 space-y-4">
									<div>
										<label className="text-xs font-semibold text-slate-600">¿Qué pasó esta semana?</label>
										<textarea
											value={prepForDay.weekSummary || ''}
											onChange={(e) => updatePrepField('weekSummary', e.target.value)}
											rows={2}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											placeholder="Ej: tuve una discusión, estuve más ansioso, me costó dormir…"
										/>
									</div>
									<div>
										<label className="text-xs font-semibold text-slate-600">¿Qué quiero trabajar en sesión?</label>
										<textarea
											value={prepForDay.sessionGoal || ''}
											onChange={(e) => updatePrepField('sessionGoal', e.target.value)}
											rows={2}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											placeholder="Ej: manejar ansiedad social, dejar de evitar llamadas…"
										/>
									</div>
									<div>
										<label className="text-xs font-semibold text-slate-600">¿Qué intenté y cómo me fue?</label>
										<textarea
											value={prepForDay.triedSteps || ''}
											onChange={(e) => updatePrepField('triedSteps', e.target.value)}
											rows={2}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											placeholder="Ej: respiración 3 días, pero abandoné cuando me sentí mal…"
										/>
									</div>
								</div>
							</div>

							<div className="rounded-3xl border border-slate-100 bg-white p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Registro rápido</p>
								<div className="mt-4 space-y-4">
									<div>
										<label className="text-xs font-semibold text-slate-600">Situación</label>
										<textarea
											value={thoughtDraft.situation}
											onChange={(e) => setThoughtDraft((d) => ({ ...d, situation: e.target.value }))}
											rows={2}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											placeholder="¿Qué pasó? ¿Dónde estabas?"
										/>
									</div>
									<div>
										<label className="text-xs font-semibold text-slate-600">Pensamiento automático</label>
										<textarea
											value={thoughtDraft.thought}
											onChange={(e) => setThoughtDraft((d) => ({ ...d, thought: e.target.value }))}
											rows={2}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											placeholder='Ej: "Voy a fallar", "Me van a juzgar"'
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-xs font-semibold text-slate-600">Emoción</label>
											<select
												value={thoughtDraft.emotion}
												onChange={(e) => setThoughtDraft((d) => ({ ...d, emotion: e.target.value }))}
												className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											>
												{CBT_EMOTIONS.map((opt) => (
													<option key={opt} value={opt}>
														{opt}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="text-xs font-semibold text-slate-600">Intensidad (0–10)</label>
											<div className="mt-1 flex items-center gap-2">
												<input
													type="range"
													min={0}
													max={10}
													value={thoughtDraft.intensity}
													onChange={(e) => setThoughtDraft((d) => ({ ...d, intensity: Number(e.target.value) }))}
													className="w-full"
												/>
												<span className="w-6 text-right text-sm font-semibold text-slate-700">{thoughtDraft.intensity}</span>
											</div>
										</div>
									</div>
									<div>
										<label className="text-xs font-semibold text-slate-600">Respuesta alternativa (más realista)</label>
										<textarea
											value={thoughtDraft.alternative}
											onChange={(e) => setThoughtDraft((d) => ({ ...d, alternative: e.target.value }))}
											rows={2}
											className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-300"
											placeholder='Ej: "No tengo certeza. Puedo intentarlo paso a paso"'
										/>
									</div>
									<button
										onClick={addThoughtRecord}
										type="button"
										disabled={!thoughtDraft.situation.trim() || !thoughtDraft.thought.trim()}
										className="w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
									>
										Guardar registro
									</button>
								</div>
							</div>

							<div className="rounded-3xl border border-slate-100 bg-white p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Registros guardados (día)</p>
								<div className="mt-4 space-y-2">
									{thoughtsForDay.length === 0 ? (
										<p className="text-sm text-slate-500">Aún no guardas registros hoy.</p>
									) : (
										thoughtsForDay.slice(0, 3).map((t) => (
											<div key={t.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-sm text-slate-700">
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="font-semibold text-slate-900">{t.emotion} · {t.intensity}/10</p>
														<p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
													</div>
													<button
														onClick={() => removeThoughtRecord(t.id)}
														type="button"
														className="text-xs font-semibold text-slate-500 hover:text-slate-700"
													>
														Eliminar
													</button>
												</div>
												<p className="mt-2 text-xs text-slate-600"><span className="font-semibold">Situación:</span> {t.situation}</p>
												<p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Pensamiento:</span> {t.thought}</p>
												{t.alternative ? (
													<p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Alternativa:</span> {t.alternative}</p>
												) : null}
											</div>
										))
									)}
								</div>
							</div>

							<div className="rounded-3xl border border-slate-100 bg-white p-5">
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Tarea de la semana</p>
								<p className="mt-2 text-xs text-slate-500">Semana desde {formatSelectedDay(startOfWeekMonday(selectedDate))}</p>
								<div className="mt-4 space-y-2.5">
									{CBT_HOMEWORK_ITEMS.map((item) => (
										<label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm leading-snug text-slate-700">
											<input
												type="checkbox"
												checked={Boolean(homeworkForWeek[item.id])}
												onChange={() => toggleHomeworkItem(item.id)}
												className="mt-1 h-4 w-4 rounded border-slate-300"
											/>
											<span>{item.label}</span>
										</label>
									))}
								</div>
							</div>
						</div>

						<div className="mt-6 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-xs leading-relaxed text-slate-500 text-pretty">
							Esto es apoyo para tu terapia (no reemplaza la atención profesional). Si te sientes en riesgo inmediato, busca ayuda urgente en tu país.
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<div className="rounded-3xl bg-white/95 p-5 shadow-2xl shadow-slate-900/10 ring-1 ring-white/40">
							<div className="flex items-center justify-between border-b border-slate-100 pb-3">
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Próximas 48h</p>
								<span className="text-xs text-slate-500">{nextFortyEight.length || '0'} eventos</span>
							</div>
							<div className="mt-4 space-y-3">
								{nextFortyEight.length === 0 && (
									<p className="text-sm leading-relaxed text-slate-500 text-pretty">
										Sin compromisos inmediatos. Mantén abiertos los bloques creativos.
									</p>
								)}
								{nextFortyEight.slice(0, 3).map((evt) => (
									<div key={evt.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
										<div className="flex items-center justify-between text-[11px] text-slate-500">
											<span className={`rounded-full px-2 py-0.5 font-semibold ${sourceBadgeClass(evt.extendedProps?.source)}`}>
												{sourceLabel(evt.extendedProps?.source)}
											</span>
											<span>{describeEventTiming(evt.start, evt.end)}</span>
										</div>
										<p className="mt-2 text-sm font-semibold text-slate-900">{evt.title}</p>
									</div>
								))}
							</div>
						</div>

						<div className="rounded-3xl bg-white/95 p-5 shadow-2xl shadow-slate-900/10 ring-1 ring-white/40">
							<div className="flex items-center justify-between border-b border-slate-100 pb-3">
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Estado de tu agenda</p>
								<span className="text-xs text-slate-500">{activeFilterLabel}</span>
							</div>
							<p className="mt-4 text-sm leading-relaxed text-slate-600 text-pretty">
								{noEvents
									? 'Cuando tengas citas, aquí verás un resumen y recordatorios.'
									: 'Tu agenda está activa. Revisa la agenda del día para ver detalles.'}
							</p>
							<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
								<div className="rounded-2xl border border-slate-100 p-3">
									<p className="text-xs text-slate-400">Eventos hoy</p>
									<p className="text-base font-semibold text-slate-900">{dayAgendaEvents.length}</p>
								</div>
								<div className="rounded-2xl border border-slate-100 p-3">
									<p className="text-xs text-slate-400">Próximas 48h</p>
									<p className="text-base font-semibold text-slate-900">{nextFortyEight.length}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="rounded-3xl bg-white/95 p-5 shadow-2xl shadow-slate-900/10 ring-1 ring-white/40">
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Próximas citas</p>
						<div className="mt-4 space-y-3">
							{showUpcomingTimeline ? (
								upcomingEvents.map((evt) => (
									<div key={evt.id} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-600">
										<p className="font-semibold text-slate-900">{evt.title}</p>
										<p className="text-xs text-slate-500">{describeEventTiming(evt.start, evt.end)}</p>
									</div>
								))
							) : (
								<p className="text-sm leading-relaxed text-slate-500 text-pretty">
									No hay más eventos en fila. Añade uno desde el calendario.
								</p>
							)}
						</div>
					</div>
				</div>

				{showGoogleNotice && (
					<div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">{googleError}</div>
				)}
			</div>
		</>
	);
};

export default MyCalendar;
