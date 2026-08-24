import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Play, Pause, Volume2, VolumeX, RotateCcw, Maximize2, Minimize2, 
    ChevronRight, ChevronLeft, Sparkles, ShieldCheck, CheckCircle2, 
    Share2, Download, Copy, Check, MessageSquare, Phone, ArrowRight,
    Sliders, Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUSINESS } from '@/data/site';

const SCENES = [
    {
        id: 'scene-1',
        title: 'The Standard of Perfection',
        subtitle: 'Where science meets automotive craftsmanship',
        image: '/promo/supercar.jpg',
        duration: 8,
        badge: 'Akaal Heritage',
        voiceover: "Every line tells a story. At Akaal Detailerz Co., we don't just wash cars — we restore their soul.",
        highlight: '11+ Years Experience · 2,400+ Exotics & Classics Delivered',
        tag: '01 / CINEMATIC INTRO',
        animationClass: 'animate-kenburns-1',
    },
    {
        id: 'scene-2',
        title: 'Active Snow Foam Bath',
        subtitle: 'Zero-contact paint decontamination and dirt encapsulation',
        image: '/promo/snow_foam.jpg',
        duration: 7,
        badge: 'Stage 1 Wash',
        voiceover: 'It begins with patience. Thick pH-neutral foam blankets every panel before a single mitt touches the paint.',
        highlight: 'Two-Bucket Hand Wash · Dual Grit Guards · 100% Scratch-Free',
        tag: '02 / DECONTAMINATION',
        animationClass: 'animate-kenburns-2',
    },
    {
        id: 'scene-3',
        title: 'Two-Stage Paint Correction',
        subtitle: 'Eliminating 90%+ of swirls, wash marring & micro-scratches',
        image: '/promo/paint_polish.jpg',
        beforeImage: 'https://images.hostinger.com/0be72380-2bd9-4c62-bcfc-23f3a21e0af1.png',
        duration: 8,
        badge: 'Precision Correction',
        voiceover: 'Under high-CRI studio lighting, dual-action machine polishers level the clear coat to mirror-flat optical clarity.',
        highlight: 'Rupes Dual-Action Machines · Flawless Swirl Removal',
        tag: '03 / PAINT CORRECTION',
        animationClass: 'animate-kenburns-3',
        hasInteractiveWipe: true,
    },
    {
        id: 'scene-4',
        title: '5-Year Ceramic Hydrophobic Armor',
        subtitle: 'Permanent molecular quartz crystal barrier with extreme water beading',
        image: '/promo/ceramic_beads.jpg',
        duration: 8,
        badge: '9H Ceramic Coating',
        voiceover: 'Sealed with professional-grade ceramic protection. Water sheets instantly. Gloss that outlasts the road.',
        highlight: '110° Water Contact Angle · UV & Chemical Resistant · 5-Yr Warranty',
        tag: '04 / CERAMIC COATING',
        animationClass: 'animate-kenburns-1',
    },
    {
        id: 'scene-5',
        title: 'Bespoke Interior Rejuvenation',
        subtitle: 'Deep steam extraction, matte leather conditioning & cockpit purification',
        image: '/promo/interior_vip.jpg',
        duration: 7,
        badge: 'Cabin Craftsmanship',
        voiceover: 'Step inside a sanctuary. Steam-sanitized carpets, conditioned leather, and that authentic new-car scent.',
        highlight: '220°F Steam Sanitization · PH-Balanced Matte Finish',
        tag: '05 / INTERIOR SPA',
        animationClass: 'animate-kenburns-2',
    },
    {
        id: 'scene-6',
        title: 'Your Vehicle. Transformed.',
        subtitle: 'Experience the benchmark of automotive detailing in Phoenix, Arizona',
        image: '/promo/supercar.jpg',
        duration: 8,
        badge: 'Showroom Delivery',
        voiceover: 'Handed back cleaner than promised. Ready to turn heads on every boulevard.',
        highlight: 'Limited Weekly Slots · Reserve Your Detail Online Today',
        tag: '06 / THE FINISH',
        animationClass: 'animate-kenburns-3',
        isCta: true,
    },
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

export default function MarketingVideoPlayer({ autoPlay = true, className = '' }) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0); // 0 to 1
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showCaptions, setShowCaptions] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [wipePosition, setWipePosition] = useState(50); // for before/after interactive slide
    const [showPromoKit, setShowPromoKit] = useState(false);
    const [copied, setCopied] = useState(false);

    const containerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const soundNodesRef = useRef([]);

    const currentScene = SCENES[currentSceneIndex];

    // Compute cumulative start time for scenes
    const sceneStartTimes = useMemo(() => {
        let t = 0;
        return SCENES.map(s => {
            const start = t;
            t += s.duration;
            return start;
        });
    }, []);

    // Current time in seconds
    const currentTimeSec = progress * TOTAL_DURATION;

    // Web Audio API Synth Engine for Cinematic Ambient Soundtrack
    const initAudio = () => {
        if (audioCtxRef.current) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            // Master Gain
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
            masterGain.connect(ctx.destination);

            // Sub Bass Drone (Deep Cinematic 48Hz)
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(48, ctx.currentTime);

            // Sub Lowpass filter
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(220, ctx.currentTime);

            // Warm Chord Layer (144Hz / D3 harmonic)
            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(144, ctx.currentTime);

            const osc2Gain = ctx.createGain();
            osc2Gain.gain.setValueAtTime(0.08, ctx.currentTime);

            osc1.connect(filter);
            osc2.connect(osc2Gain);
            osc2Gain.connect(filter);
            filter.connect(masterGain);

            osc1.start();
            osc2.start();

            soundNodesRef.current = [osc1, osc2, masterGain];
        } catch (e) {
            console.warn('Audio init error:', e);
        }
    };

    const toggleSound = () => {
        if (!soundEnabled) {
            if (!audioCtxRef.current) {
                initAudio();
            } else if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            setSoundEnabled(true);
        } else {
            if (audioCtxRef.current) {
                audioCtxRef.current.suspend();
            }
            setSoundEnabled(false);
        }
    };

    // Playback Loop
    useEffect(() => {
        if (!isPlaying) return;

        const intervalMs = 50;
        const step = (intervalMs / 1000) * playbackSpeed;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const nextTime = (prev * TOTAL_DURATION) + step;
                if (nextTime >= TOTAL_DURATION) {
                    // Loop back to start
                    setCurrentSceneIndex(0);
                    return 0;
                }

                // Determine active scene
                let activeIdx = 0;
                for (let i = 0; i < SCENES.length; i++) {
                    if (nextTime >= sceneStartTimes[i]) {
                        activeIdx = i;
                    }
                }

                if (activeIdx !== currentSceneIndex) {
                    setCurrentSceneIndex(activeIdx);
                }

                return nextTime / TOTAL_DURATION;
            });
        }, intervalMs);

        return () => clearInterval(timer);
    }, [isPlaying, playbackSpeed, currentSceneIndex, sceneStartTimes]);

    const jumpToScene = (index) => {
        setCurrentSceneIndex(index);
        const startTime = sceneStartTimes[index];
        setProgress(startTime / TOTAL_DURATION);
    };

    const nextScene = () => {
        const nextIdx = (currentSceneIndex + 1) % SCENES.length;
        jumpToScene(nextIdx);
    };

    const prevScene = () => {
        const prevIdx = (currentSceneIndex - 1 + SCENES.length) % SCENES.length;
        jumpToScene(prevIdx);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const copyPromoKit = () => {
        const promoText = `🚗✨ AKAAL DETAILERZ CO. // THE CINEMATIC DETAIL EXPERIENCE\n\n` +
        `Is your ride looking tired? Experience the ultimate automotive transformation in Phoenix, AZ.\n\n` +
        `🔥 2-Bucket Hand Foam Decontamination\n` +
        `💎 2-Stage Multi-Pad Paint Correction (90%+ Swirl Removal)\n` +
        `🛡️ 5-Year 9H Ceramic Hydrophobic Shield\n` +
        `🧼 VIP Deep Steam Interior Extraction & Leather Conditioning\n\n` +
        `📍 2417 W Gardenia Ave, Phoenix, AZ 85021\n` +
        `📞 Call: (602) 555-0184\n` +
        `🌐 Book Online: https://akaaldetailerz.com\n\n` +
        `#CarDetailing #PaintCorrection #CeramicCoating #AutoDetailingPhoenix #AkaalDetailerz #ExoticCarDetail`;

        navigator.clipboard.writeText(promoText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div 
            ref={containerRef}
            className={`group relative overflow-hidden rounded-2xl border border-white/15 bg-black text-white shadow-2xl ${className}`}
        >
            {/* 16:9 Screen Container */}
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                
                {/* Background Image with Cinematic Ken Burns Motion */}
                <div className="absolute inset-0 overflow-hidden">
                    <img 
                        key={currentScene.id}
                        src={currentScene.image} 
                        alt={currentScene.title}
                        className={`h-full w-full object-cover transition-opacity duration-1000 ${currentScene.animationClass}`}
                    />

                    {/* Interactive Before/After Wipe on Paint Correction Scene */}
                    {currentScene.hasInteractiveWipe && (
                        <div 
                            className="absolute inset-0 overflow-hidden border-r-2 border-accent shadow-[0_0_20px_rgba(245,158,11,0.8)]"
                            style={{ width: `${wipePosition}%` }}
                        >
                            <img 
                                src={currentScene.beforeImage} 
                                alt="Before Correction"
                                className="absolute inset-0 h-full w-[100vw] max-w-none object-cover"
                            />
                            <div className="absolute left-4 top-16 rounded bg-black/75 px-3 py-1 font-display text-xs uppercase tracking-widest text-destructive">
                                Before: Swirls & Oxidation
                            </div>
                        </div>
                    )}

                    {/* Interactive Wipe Slider Drag Handler */}
                    {currentScene.hasInteractiveWipe && (
                        <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-black/80 px-4 py-2 backdrop-blur">
                            <label className="flex items-center gap-3 text-xs uppercase tracking-wider text-accent">
                                <span>Before</span>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="95" 
                                    value={wipePosition} 
                                    onChange={(e) => setWipePosition(Number(e.target.value))}
                                    className="h-1.5 w-32 cursor-ew-resize appearance-none rounded-lg bg-white/20 accent-accent"
                                />
                                <span>After</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Cinematic Vignette, Color Grade & Film Grain Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
                <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80" />

                {/* Top Broadcast Branding Bar */}
                <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-3 w-3 items-center justify-center">
                            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-red-500 opacity-75" />
                            <span className="absolute h-2 w-2 rounded-full bg-red-600" />
                        </span>
                        <span className="font-display text-xs uppercase tracking-[0.3em] text-white/90">
                            4K PROMO REEL · AKAAL DETAILERZ CO.
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden rounded border border-accent/40 bg-accent/20 px-2.5 py-0.5 font-display text-xs uppercase tracking-widest text-accent sm:inline-block">
                            {currentScene.badge}
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowPromoKit(true)}
                            className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/20"
                        >
                            <Share2 className="h-3.5 w-3.5" /> Promo Kit
                        </button>
                    </div>
                </div>

                {/* Lower Thirds & Dynamic Scene Info */}
                <div className="absolute inset-x-0 bottom-16 z-20 p-5 sm:p-8">
                    <div className="max-w-2xl space-y-2.5">
                        <div className="flex items-center gap-2">
                            <span className="font-display text-xs uppercase tracking-[0.35em] text-accent">
                                {currentScene.tag}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-xs text-white/70">{currentScene.highlight}</span>
                        </div>

                        <h2 className="font-display text-2xl uppercase leading-tight tracking-wide text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                            {currentScene.title}
                        </h2>

                        <p className="text-xs leading-relaxed text-white/80 drop-shadow sm:text-sm md:text-base">
                            {currentScene.subtitle}
                        </p>

                        {/* Animated Captions / Subtitle Bar */}
                        {showCaptions && (
                            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-white/10 bg-black/60 p-3 backdrop-blur-md">
                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                <p className="font-sans text-xs italic leading-relaxed text-amber-200/90 sm:text-sm">
                                    "{currentScene.voiceover}"
                                </p>
                            </div>
                        )}

                        {/* Final Scene CTA overlay */}
                        {currentScene.isCta && (
                            <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
                                <Link 
                                    to="/contact" 
                                    className="flex items-center gap-2 rounded bg-accent px-6 py-2.5 font-display text-base uppercase text-accent-foreground shadow-lg shadow-accent/20 transition hover:bg-amber-400"
                                >
                                    Book This Detail <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a 
                                    href={`tel:${BUSINESS.phone.replace(/[^0-9]/g, '')}`}
                                    className="flex items-center gap-2 rounded border border-white/30 bg-white/10 px-5 py-2.5 font-display text-base uppercase text-white backdrop-blur transition hover:bg-white/20"
                                >
                                    <Phone className="h-4 w-4" /> {BUSINESS.phone}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Big Center Play/Pause Indicator on hover/click */}
                <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-transparent transition"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {!isPlaying && (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-black/75 text-accent shadow-2xl backdrop-blur transition-transform hover:scale-110">
                            <Play className="ml-1 h-8 w-8 fill-accent" />
                        </div>
                    )}
                </button>
            </div>

            {/* Timeline Progress Scrub Bar */}
            <div 
                className="group/track relative h-2.5 w-full cursor-pointer bg-white/10"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
                    setProgress(newProgress);
                }}
            >
                {/* Active progress fill */}
                <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-75"
                    style={{ width: `${progress * 100}%` }}
                />

                {/* Scene Chapter Markers */}
                {SCENES.map((scene, idx) => (
                    <div 
                        key={scene.id}
                        className="absolute top-0 h-full w-0.5 bg-black/60"
                        style={{ left: `${(sceneStartTimes[idx] / TOTAL_DURATION) * 100}%` }}
                    />
                ))}
            </div>

            {/* Bottom Control Dock */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-neutral-900/95 px-4 py-3 sm:px-6">
                {/* Left Playback controls */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition hover:bg-amber-400"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
                    </button>

                    <button
                        type="button"
                        onClick={prevScene}
                        className="text-white/70 transition hover:text-white"
                        title="Previous Scene"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={nextScene}
                        className="text-white/70 transition hover:text-white"
                        title="Next Scene"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => jumpToScene(0)}
                        className="text-white/70 transition hover:text-white"
                        title="Restart Video"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>

                    <div className="text-xs font-mono text-white/70">
                        <span>{formatTime(currentTimeSec)}</span>
                        <span className="mx-1 text-white/30">/</span>
                        <span>{formatTime(TOTAL_DURATION)}</span>
                    </div>
                </div>

                {/* Center Scene Quick Jump Pills */}
                <div className="hidden items-center gap-1.5 lg:flex">
                    {SCENES.map((scene, idx) => (
                        <button
                            key={scene.id}
                            type="button"
                            onClick={() => jumpToScene(idx)}
                            className={`rounded px-2.5 py-1 text-xs font-medium uppercase tracking-wider transition ${
                                currentSceneIndex === idx
                                    ? 'bg-accent text-accent-foreground shadow'
                                    : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'
                            }`}
                        >
                            {idx + 1}. {scene.badge}
                        </button>
                    ))}
                </div>

                {/* Right Settings & Actions */}
                <div className="flex items-center gap-2.5">
                    {/* Audio Synth Toggle */}
                    <button
                        type="button"
                        onClick={toggleSound}
                        className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs uppercase tracking-wider transition ${
                            soundEnabled 
                                ? 'border-accent bg-accent/20 text-accent' 
                                : 'border-white/15 bg-white/5 text-white/60 hover:text-white'
                        }`}
                        title="Toggle Ambient Audio Experience"
                    >
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        <span className="hidden sm:inline">{soundEnabled ? 'Audio On' : 'Sound'}</span>
                    </button>

                    {/* Captions Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowCaptions(!showCaptions)}
                        className={`rounded border px-2 py-1 text-xs uppercase tracking-wider transition ${
                            showCaptions 
                                ? 'border-white/30 bg-white/20 text-white' 
                                : 'border-white/10 bg-transparent text-white/40'
                        }`}
                        title="Toggle Subtitles"
                    >
                        CC
                    </button>

                    {/* Speed selector */}
                    <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="rounded border border-white/15 bg-neutral-800 px-2 py-1 text-xs text-white outline-none"
                        title="Playback Speed"
                    >
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1.0x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                    </select>

                    {/* Fullscreen Toggle */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="text-white/70 transition hover:text-white"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Promo Kit & Social Script Modal */}
            {showPromoKit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl rounded-xl border border-white/20 bg-neutral-900 p-6 text-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">Marketing Assets</p>
                                <h3 className="font-display text-2xl uppercase">Social Video Campaign Kit</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPromoKit(false)}
                                className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            <p className="text-sm text-neutral-300">
                                Copy ready-to-publish captions, scripts, and video hashtags optimized for Instagram Reels, TikTok, and YouTube Shorts:
                            </p>

                            <div className="rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-xs text-neutral-300">
                                <p className="text-accent font-semibold mb-2">// Instagram & TikTok Caption</p>
                                <p>🚗✨ AKAAL DETAILERZ CO. // THE CINEMATIC DETAIL EXPERIENCE</p>
                                <p className="mt-1">Is your ride looking tired? Experience the ultimate automotive transformation in Phoenix, AZ.</p>
                                <p className="mt-2">🔥 2-Bucket Hand Foam Decontamination</p>
                                <p>💎 2-Stage Multi-Pad Paint Correction (90%+ Swirl Removal)</p>
                                <p>🛡️ 5-Year 9H Ceramic Hydrophobic Shield</p>
                                <p>🧼 VIP Deep Steam Interior Extraction & Leather Conditioning</p>
                                <p className="mt-2">📍 2417 W Gardenia Ave, Phoenix, AZ 85021</p>
                                <p>📞 Call: (602) 555-0184 · https://akaaldetailerz.com</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <span className="text-xs text-neutral-400">
                                    Includes complete scene breakdown & voiceover transcript.
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={copyPromoKit}
                                        className="flex items-center gap-2 rounded bg-accent px-4 py-2 font-display text-sm uppercase text-accent-foreground transition hover:bg-amber-400"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied to Clipboard' : 'Copy Campaign Script'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
