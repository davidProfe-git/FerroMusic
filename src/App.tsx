import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

type Track = {
  id: string;
  name: string;
  artist: string;
  url: string;
  source: 'local' | 'web';
  duration?: number;
};

type CreatureState = 'IDLE' | 'CURIOUS' | 'LISTENING' | 'PLAYING' | 'EXCITED' | 'SLEEPING';

const STORAGE_KEY = 'ferro-profile';
const SAMPLE_TRACKS: Track[] = [
  { id: 'web-1', name: 'Neon Current', artist: 'FERRO Radio', url: '', source: 'web' },
  { id: 'web-2', name: 'Liquid Signal', artist: 'FERRO Radio', url: '', source: 'web' },
  { id: 'web-3', name: 'Magnetic Pulse', artist: 'FERRO Radio', url: '', source: 'web' }
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '00:00';
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function Creature({
  playing,
  progress,
  state,
  onPointerActivity
}: {
  playing: boolean;
  progress: number;
  state: CreatureState;
  onPointerActivity: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, active: false });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * ratio);
      canvas.height = Math.floor(canvas.clientHeight * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 240 }, (_, i) => ({
      a: (i / 240) * Math.PI * 2,
      r: 52 + Math.random() * 120,
      speed: 0.001 + Math.random() * 0.004,
      jitter: Math.random() * Math.PI * 2,
      size: 0.7 + Math.random() * 1.8
    }));

    let t = 0;
    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      t += playing ? 0.022 : 0.009;
      const energy = playing ? 1 + Math.sin(t * 5.2) * 0.12 + progress * 0.25 : 0.75;
      const stateBoost = state === 'EXCITED' ? 1.35 : state === 'LISTENING' ? 1.12 : state === 'SLEEPING' ? 0.55 : 1;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220 * energy);
      glow.addColorStop(0, 'rgba(170,255,36,0.11)');
      glow.addColorStop(0.5, 'rgba(170,255,36,0.035)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 220 * energy, 0, Math.PI * 2);
      ctx.fill();

      particles.forEach((p, i) => {
        p.a += p.speed * stateBoost * 10;
        const wobble = Math.sin(t * 1.7 + p.jitter) * (playing ? 12 : 5);
        const attractX = (mouse.current.x - 0.5) * 80 * (mouse.current.active ? 1 : 0);
        const attractY = (mouse.current.y - 0.5) * 55 * (mouse.current.active ? 1 : 0);
        const rr = p.r * (0.72 + 0.12 * Math.sin(t + i));
        const x = cx + Math.cos(p.a) * (rr + wobble) * stateBoost + attractX;
        const y = cy + Math.sin(p.a * 1.18) * (rr * 0.62 + wobble * 0.5) * stateBoost + attractY;
        const alpha = 0.2 + ((i % 7) / 7) * 0.55;
        const radius = p.size * (playing ? 1.1 + Math.sin(t * 4 + i) * 0.18 : 1);
        ctx.fillStyle = `rgba(189,255,54,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const silhouette = ctx.createRadialGradient(cx - 18, cy - 22, 2, cx, cy, 110);
      silhouette.addColorStop(0, 'rgba(229,255,195,0.72)');
      silhouette.addColorStop(0.18, 'rgba(163,239,57,0.34)');
      silhouette.addColorStop(1, 'rgba(85,132,28,0)');
      ctx.fillStyle = silhouette;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 86 * stateBoost, 64 * stateBoost, Math.sin(t) * 0.03, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(194,255,68,0.22)';
      ctx.lineWidth = 1;
      for (let ring = 0; ring < 3; ring++) {
        const rr = 116 + ring * 23 + Math.sin(t * 2 + ring) * 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * 0.63, t * 0.06, 0, Math.PI * 2);
        ctx.stroke();
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, progress, state]);

  return (
    <div
      className="creature-wrap"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        mouse.current = {
          x: (event.clientX - box.left) / box.width,
          y: (event.clientY - box.top) / box.height,
          active: true
        };
        onPointerActivity();
      }}
      onPointerLeave={() => { mouse.current.active = false; }}
    >
      <canvas ref={canvasRef} className="creature-canvas" />
      <div className="creature-eyes" aria-hidden="true">
        <span className="eye" />
        <span className="eye" />
      </div>
      <div className="creature-mouth" aria-hidden="true" />
      <div className="creature-state">{state}</div>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState('');
  const [onboarded, setOnboarded] = useState(false);
  const [view, setView] = useState('Inicio');
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [creatureState, setCreatureState] = useState<CreatureState>('IDLE');
  const [status, setStatus] = useState('¿Qué quieres escuchar hoy?');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setName(data.name ?? '');
        setOnboarded(Boolean(data.name));
        setFavorites(data.favorites ?? []);
        setRecent(data.recent ?? []);
      } catch { /* ignore malformed local profile */ }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, favorites, recent }));
  }, [name, favorites, recent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const current = currentIndex >= 0 ? queue[currentIndex] : undefined;
  const currentFav = current ? favorites.includes(current.id) : false;

  const filteredTracks = useMemo(() => {
    const source = [...tracks, ...SAMPLE_TRACKS];
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter((track) => `${track.name} ${track.artist}`.toLowerCase().includes(q));
  }, [tracks, query]);

  const ensureAudioGraph = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
  };

  const playTrack = async (track: Track, indexOverride?: number, queueOverride?: Track[]) => {
    if (!track.url) {
      setStatus(`${track.name} es una fuente de demostración. Conecta un proveedor web autorizado en la siguiente fase.`);
      setCreatureState('CURIOUS');
      return;
    }
    let nextQueue = queueOverride ? [...queueOverride] : (queue.length ? [...queue] : [track]);
    const idx = indexOverride ?? nextQueue.findIndex((item) => item.id === track.id);
    if (idx < 0) {
      nextQueue.push(track);
    }
    const finalIndex = idx < 0 ? nextQueue.length - 1 : idx;
    setQueue(nextQueue);
    setCurrentIndex(finalIndex);
    setProgress(0);
    setPlaying(true);
    setCreatureState('LISTENING');
    setStatus(`Reproduciendo ${track.name}`);
    setRecent((prev) => [track.id, ...prev.filter((id) => id !== track.id)].slice(0, 20));

    requestAnimationFrame(async () => {
      const audio = audioRef.current;
      if (!audio) return;
      await ensureAudioGraph();
      audio.src = track.url;
      audio.currentTime = 0;
      await audio.play();
    });
  };

  const loadLocalFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const local = files
      .filter((file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(file.name))
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        artist: 'Mi computador',
        url: URL.createObjectURL(file),
        source: 'local' as const
      }));
    if (!local.length) return;
    setTracks((prev) => [...local, ...prev.filter((item) => !local.some((newItem) => newItem.id === item.id))]);
    setQueue(local);
    setCurrentIndex(0);
    setView('Mi música');
    setStatus(`${local.length} archivo${local.length > 1 ? 's' : ''} añadido${local.length > 1 ? 's' : ''}.`);
    setCreatureState('CURIOUS');
    setTimeout(() => playTrack(local[0], 0, local), 50);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onPlay = () => { setPlaying(true); setCreatureState('PLAYING'); };
    const onPause = () => { setPlaying(false); setCreatureState(audio.currentTime ? 'SLEEPING' : 'IDLE'); };
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      const next = getNextIndex();
      if (next !== null) void playTrack(queue[next], next);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [queue, repeat]);

  const getNextIndex = () => {
    if (!queue.length) return null;
    if (shuffle) return Math.floor(Math.random() * queue.length);
    if (currentIndex < queue.length - 1) return currentIndex + 1;
    return repeat ? 0 : null;
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !current?.url) return;
    await ensureAudioGraph();
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  const step = (direction: 1 | -1) => {
    if (!queue.length) return;
    let idx = currentIndex + direction;
    if (idx < 0) idx = queue.length - 1;
    if (idx >= queue.length) idx = 0;
    void playTrack(queue[idx], idx);
  };

  const saveName = (event: React.FormEvent) => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setName(clean);
    setOnboarded(true);
    setCreatureState('CURIOUS');
    setStatus(`Encantada, ${clean}.`);
  };

  const chooseForMe = () => {
    const pick = SAMPLE_TRACKS[Math.floor(Math.random() * SAMPLE_TRACKS.length)];
    setStatus(`He elegido: ${pick.name}.`);
    setCreatureState('EXCITED');
  };

  const toggleFavorite = () => {
    if (!current) return;
    setFavorites((prev) => prev.includes(current.id) ? prev.filter((id) => id !== current.id) : [...prev, current.id]);
    setCreatureState('EXCITED');
  };

  if (!onboarded) {
    return (
      <div className="app-shell onboarding">
        <div className="grain" />
        <main className="welcome-card">
          <div className="brand-mini">FERRO <span>01</span></div>
          <Creature playing={false} progress={0} state={creatureState} onPointerActivity={() => setCreatureState('CURIOUS')} />
          <div className="welcome-copy">
            <div className="eyebrow">UNA PEQUEÑA CRIATURA DIGITAL</div>
            <h1>Hola. ¿Cómo debería llamarte?</h1>
            <p>Tu música. Tu espacio. Una criatura que vive con ella.</p>
            <form onSubmit={saveName} className="name-form">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe tu nombre"
                aria-label="Tu nombre"
              />
              <button type="submit">ENTRAR <span>↗</span></button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="grain" />
      <header className="topbar">
        <div className="brand">FERRO</div>
        <div className="search-wrap">
          <span>⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." />
          <kbd>CTRL K</kbd>
        </div>
        <div className="profile">● <span>{name}</span></div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="side-title">TU MÚSICA</div>
          {['Inicio', 'Mi música', 'Favoritos', 'Historial', 'Playlists'].map((item) => (
            <button key={item} className={`nav-item ${view === item ? 'active' : ''}`} onClick={() => setView(item)}>{item}</button>
          ))}
          <div className="side-title source-title">FUENTES</div>
          <button className={`nav-item ${view === 'Música local' ? 'active' : ''}`} onClick={() => inputRef.current?.click()}>Mi computador</button>
          <button className={`nav-item ${view === 'Música web' ? 'active' : ''}`} onClick={() => { setView('Música web'); setStatus('Fuentes web autorizadas preparándose.'); }}>Música web</button>
          <button className="nav-item" onClick={() => inputRef.current?.click()}>Mis archivos</button>
          <input ref={inputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" multiple hidden onChange={loadLocalFiles} />
          <div className="sidebar-bottom">
            <div className="connection"><span className="dot" /> MODO INVITADO</div>
            <div className="hint">Todo lo local vive en este navegador.</div>
          </div>
        </aside>

        <main className="main-panel">
          <div className="section-head">
            <div>
              <div className="eyebrow">FERRO / {view.toUpperCase()}</div>
              <h2>{view === 'Inicio' ? status : view}</h2>
            </div>
            <div className="section-actions">
              <button onClick={() => inputRef.current?.click()} className="ghost-button">+ AÑADIR MÚSICA</button>
              <button onClick={chooseForMe} className="neon-button">ELEGIR POR MÍ ✦</button>
            </div>
          </div>

          <section className="hero-grid">
            <div className="creature-stage">
              <Creature playing={playing} progress={duration ? progress / duration : 0} state={creatureState} onPointerActivity={() => setCreatureState(playing ? 'LISTENING' : 'CURIOUS')} />
              <div className="creature-caption">
                <span>{current ? 'REPRODUCIENDO' : 'SIN MÚSICA'}</span>
                <strong>{current?.name ?? '¿Qué quieres escuchar hoy?'}</strong>
                {current && <small>{current.artist}</small>}
              </div>
            </div>
            <div className="discovery-panel">
              <div className="panel-label">PRIMERA CONEXIÓN</div>
              <div className="discovery-copy">
                <h3>¿Cuál será tu hit de hoy?</h3>
                <p>Déjame entrar en tu música.</p>
              </div>
              <button className="discover" onClick={() => inputRef.current?.click()}><span>◉</span> ELEGIR DE MI COMPUTADOR</button>
              <button className="discover" onClick={() => { setView('Música web'); setStatus('Busca desde una fuente web autorizada.'); }}><span>◌</span> BUSCAR EN LA WEB</button>
              <button className="discover" onClick={chooseForMe}><span>✦</span> ELEGIR POR MÍ</button>
              <div className="microcopy">FERRO no sube tus archivos locales a un servidor.</div>
            </div>
          </section>

          <div className="divider-energy"><span /></div>

          <section className="library-grid">
            <div>
              <div className="section-kicker">BIBLIOTECA</div>
              <h3>{view === 'Inicio' ? 'Tu música' : view}</h3>
            </div>
            <div className="track-list">
              {(view === 'Favoritos' ? tracks.filter(t => favorites.includes(t.id)) : view === 'Historial' ? tracks.filter(t => recent.includes(t.id)) : filteredTracks).map((track) => (
                <button className={`track-row ${current?.id === track.id ? 'selected' : ''}`} key={track.id} onClick={() => { setQueue(filteredTracks); void playTrack(track); }}>
                  <span className="track-index">{current?.id === track.id && playing ? '◉' : '01'}</span>
                  <span className="track-meta"><strong>{track.name}</strong><small>{track.artist}</small></span>
                  <span className="source-chip">{track.source === 'local' ? 'LOCAL' : 'WEB'}</span>
                  <span className="play-dot">↗</span>
                </button>
              ))}
              {!filteredTracks.length && <div className="empty">Aún no hay archivos en esta vista.</div>}
            </div>
          </section>
        </main>
      </div>

      <footer className="player">
        <div className="player-track">
          <div className="mini-art"><span>◌</span></div>
          <div className="mini-meta"><strong>{current?.name ?? 'Sin selección'}</strong><small>{current?.artist ?? 'Elige una canción para comenzar'}</small></div>
          <button className={`icon ${currentFav ? 'is-fav' : ''}`} onClick={toggleFavorite} aria-label="Favorito">♡</button>
        </div>
        <div className="player-core">
          <div className="player-buttons">
            <button className={`icon ${shuffle ? 'on' : ''}`} onClick={() => setShuffle(!shuffle)} aria-label="Aleatorio">⤨</button>
            <button className="icon" onClick={() => step(-1)} aria-label="Anterior">◀</button>
            <button className="play-main" onClick={togglePlay} aria-label="Reproducir o pausar">{playing ? 'Ⅱ' : '▶'}</button>
            <button className="icon" onClick={() => step(1)} aria-label="Siguiente">▶</button>
            <button className={`icon ${repeat ? 'on' : ''}`} onClick={() => setRepeat(!repeat)} aria-label="Repetir">↻</button>
          </div>
          <div className="progress-line">
            <span className="time">{formatTime(progress)}</span>
            <input type="range" min="0" max={duration || 0.01} step="0.01" value={progress} onChange={(e) => { const v = Number(e.target.value); setProgress(v); if (audioRef.current) audioRef.current.currentTime = v; }} />
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="player-tools">
          <span>VOL</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          <button className="icon">☷</button>
          <button className="icon">⚙</button>
        </div>
      </footer>
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
