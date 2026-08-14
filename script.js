// Tailwind CSS configuration (was inline in the original HTML <script id="tailwind-config">)
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline-variant": "#3a494b",
        "inverse-primary": "#00696f",
        "surface-tint": "#00dbe7",
        "tertiary-fixed-dim": "#d1bcff",
        "on-secondary-fixed": "#000f5d",
        "secondary-fixed-dim": "#bbc3ff",
        "surface-container-high": "#252a36",
        "surface-navy-bright": "#161E2E",
        "on-tertiary-container": "#7318ff",
        "on-surface-variant": "#b9cacb",
        "on-tertiary": "#3c0090",
        "on-secondary": "#001d93",
        "primary-container": "#00f2ff",
        tertiary: "#fcf5ff",
        "primary-fixed": "#74f5ff",
        "tertiary-fixed": "#e9ddff",
        "on-secondary-fixed-variant": "#002ccd",
        background: "#0e131e",
        "surface-variant": "#303541",
        "tertiary-container": "#e3d4ff",
        "surface-dim": "#0e131e",
        primary: "#e1fdff",
        "primary-fixed-dim": "#00dbe7",
        "on-secondary-container": "#b1bbff",
        "on-surface": "#dee2f2",
        "on-error-container": "#ffdad6",
        "on-tertiary-fixed-variant": "#5700c9",
        "inverse-on-surface": "#2b303c",
        error: "#ffb4ab",
        "inverse-surface": "#dee2f2",
        "surface-container-low": "#171b27",
        "surface-container": "#1b1f2b",
        "cyan-glow": "rgba(0, 242, 255, 0.5)",
        "on-primary-fixed-variant": "#004f54",
        "on-error": "#690005",
        "on-tertiary-fixed": "#23005b",
        "surface-container-highest": "#303541",
        "surface-container-lowest": "#090e19",
        "on-primary-fixed": "#002022",
        surface: "#0e131e",
        "glass-stroke": "rgba(255, 255, 255, 0.15)",
        "on-primary": "#00363a",
        "error-container": "#93000a",
        outline: "#849495",
        "secondary-fixed": "#dee0ff",
        "surface-bright": "#343946",
        "on-primary-container": "#006a71",
        secondary: "#bbc3ff",
        "secondary-container": "#0231de",
        "on-background": "#dee2f2",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        "margin-desktop": "40px",
        "margin-mobile": "20px",
        gutter: "16px",
        "container-padding": "24px",
      },
      fontFamily: {
        "body-lg": ["Inter"],
        "label-caps": ["Inter"],
        "headline-md": ["Inter"],
        "mono-label": ["Inter"],
        "body-sm": ["Inter"],
        "display-lg-mobile": ["Inter"],
        "display-lg": ["Inter"],
      },
      fontSize: {
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-caps": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "headline-md": [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "mono-label": [
          "11px",
          { lineHeight: "14px", letterSpacing: "0.02em", fontWeight: "500" },
        ],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "display-lg-mobile": [
          "28px",
          { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        "display-lg": [
          "36px",
          { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
      },
    },
  },
};


/* -----------------------------
   Deezer test player
   Uses Deezer's public search API
   and the track "preview" URL (30s).
   ----------------------------- */
(() => {
  "use strict";

  const DEFAULT_QUERY = "Daft Punk Get Lucky";
  const DEEZER_SEARCH = "https://api.deezer.com/search";

  let currentTrack = null;
  let jsonpCounter = 0;

  const $ = (id) => document.getElementById(id);

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function showStatus(message, isError = false) {
    const el = $("playerStatus");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("text-red-300", isError);
    el.classList.remove("opacity-0");
    clearTimeout(showStatus.timer);
    showStatus.timer = setTimeout(() => el.classList.add("opacity-0"), 2400);
  }

  // Deezer's API has historically restricted direct browser XHR/CORS.
  // JSONP avoids that limitation for this public read-only test request.
  function deezerSearch(query) {
    return new Promise((resolve, reject) => {
      const callbackName = `deezerCallback_${Date.now()}_${jsonpCounter++}`;
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Deezer API timeout"));
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = (data) => {
        cleanup();
        if (!data || !Array.isArray(data.data)) {
          reject(new Error("Invalid Deezer response"));
          return;
        }
        resolve(data.data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("Could not reach Deezer API"));
      };

      script.src =
        `${DEEZER_SEARCH}?q=${encodeURIComponent(query)}` +
        `&limit=10&output=jsonp&callback=${encodeURIComponent(callbackName)}`;

      document.head.appendChild(script);
    });
  }

  function updateTrackUI(track) {
    const title = track.title || track.title_short || "Sin título";
    const artist = track.artist?.name || "Artista desconocido";
    const cover = track.album?.cover_big || track.album?.cover_medium || track.album?.cover || "";

    $("trackTitle").textContent = title;
    $("artistName").textContent = artist;
    $("bottomTrackTitle").textContent = title;
    $("bottomArtistName").textContent = artist;

    if (cover) {
      $("nowPlayingCover").src = cover;
    }

    const duration = $("duration");
    duration.textContent = "0:30";
  }

  function setPlayIcon(isPlaying) {
    $("playIcon").textContent = isPlaying ? "pause" : "play_arrow";
    $("playButton").setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  }

  function setProgress() {
    const audio = $("audioPlayer");
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    const clamped = Math.max(0, Math.min(100, percent));
    $("progressPlayed").style.width = `${clamped}%`;
    $("progressHandle").style.left = `calc(${clamped}% - 6px)`;
    $("currentTime").textContent = formatTime(audio.currentTime);
    $("duration").textContent = formatTime(audio.duration || 30);
  }

  async function loadTrack(track) {
    if (!track?.preview) {
      throw new Error("La pista no tiene preview disponible.");
    }

    const audio = $("audioPlayer");
    currentTrack = track;
    audio.pause();
    audio.src = track.preview;
    audio.load();

    updateTrackUI(track);
    setProgress();
    setPlayIcon(false);
  }

  async function togglePlayback() {
    const audio = $("audioPlayer");

    if (!currentTrack) {
      showStatus("Cargando una canción de Deezer…");
      await searchAndLoad(DEFAULT_QUERY);
    }

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error(error);
      showStatus("El navegador bloqueó la reproducción. Pulsa Play otra vez.", true);
    }
  }

  async function searchAndLoad(query) {
    const cleanQuery = query.trim() || DEFAULT_QUERY;
    showStatus(`Buscando "${cleanQuery}"…`);

    const results = await deezerSearch(cleanQuery);
    const track = results.find((item) => item.preview) || results[0];

    if (!track) {
      throw new Error("No se encontró ninguna canción.");
    }

    if (!track.preview) {
      throw new Error("La primera canción encontrada no tiene preview.");
    }

    await loadTrack(track);
    showStatus(`Cargada: ${track.title} — ${track.artist?.name || ""}`);
  }

  function seekFromPointer(event) {
    const audio = $("audioPlayer");
    if (!audio.duration) return;

    const rect = $("progressBar").getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress();
  }

  function setVolumeFromPointer(event) {
    const audio = $("audioPlayer");
    const rect = $("volumeControl").getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.volume = ratio;
    $("volumePlayed").style.width = `${ratio * 100}%`;
  }

  function createQueueFromResults(results) {
    // Keep the existing visual list but make its rows playable.
    const rows = document.querySelectorAll(".aero-glass-panel ul > li");
    results.slice(0, rows.length).forEach((track, index) => {
      const row = rows[index];
      if (!track.preview) return;

      row.dataset.deezerId = String(track.id);
      row.addEventListener("click", async () => {
        try {
          await loadTrack(track);
          await $("audioPlayer").play();
        } catch (error) {
          console.error(error);
          showStatus("No se pudo reproducir esta pista.", true);
        }
      });
    });
  }

  async function init() {
    const audio = $("audioPlayer");

    $("playButton").addEventListener("click", togglePlayback);
    $("progressBar").addEventListener("click", seekFromPointer);
    $("volumeControl").addEventListener("click", setVolumeFromPointer);

    $("searchInput").addEventListener("keydown", async (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();

      try {
        const results = await deezerSearch(event.currentTarget.value);
        const tracksWithPreview = results.filter((track) => track.preview);

        if (!tracksWithPreview.length) {
          showStatus("No hay previews disponibles para esa búsqueda.", true);
          return;
        }

        await loadTrack(tracksWithPreview[0]);
        await audio.play();
      } catch (error) {
        console.error(error);
        showStatus("No se pudo consultar Deezer.", true);
      }
    });

    audio.addEventListener("play", () => setPlayIcon(true));
    audio.addEventListener("pause", () => setPlayIcon(false));
    audio.addEventListener("timeupdate", setProgress);
    audio.addEventListener("loadedmetadata", setProgress);
    audio.addEventListener("ended", () => {
      setPlayIcon(false);
      setProgress();
      showStatus("Preview terminado (30 s).");
    });
    audio.addEventListener("error", () => {
      showStatus("Deezer no pudo entregar el preview en este momento.", true);
      setPlayIcon(false);
    });

    // Load one real Deezer track for the initial demo.
    try {
      const results = await deezerSearch(DEFAULT_QUERY);
      const available = results.filter((track) => track.preview);
      if (!available.length) throw new Error("No preview available");
      await loadTrack(available[0]);
      createQueueFromResults(available);
    } catch (error) {
      console.error(error);
      showStatus("No se pudo cargar Deezer. Comprueba tu conexión.", true);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
