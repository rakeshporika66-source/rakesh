import React, { useState, useEffect, useRef, useCallback } from 'react';

const TRACKS = [
  { id: 1, title: "SEQ_01: NEON_DRIVE", artist: "SYS.AUDIO.GEN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "SEQ_02: CYBER_CITY", artist: "SYS.AUDIO.GEN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "SEQ_03: DIGI_HORIZON", artist: "SYS.AUDIO.GEN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

function MusicPlayer({ isPlaying, setIsPlaying }: { isPlaying: boolean, setIsPlaying: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("AUDIO_ERR:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume]);

  const handleEnded = () => {
    setCurrentTrack(p => (p + 1) % TRACKS.length);
  };

  const track = TRACKS[currentTrack];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full border-t-4 border-[#f0f] pt-4 gap-4">
      {/* Track Info */}
      <div className="flex flex-col w-full md:w-1/3">
        <span className="text-[#f0f] text-sm mb-1">{">>"} AUDIO_STREAM_ACTIVE</span>
        <h3 className="font-pixel text-xs md:text-sm text-[#0ff] truncate">{track.title}</h3>
        <p className="text-xs text-[#0ff]/60 truncate">SRC: {track.artist}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 w-full md:w-1/3 justify-start md:justify-center font-pixel text-xs md:text-sm">
        <button onClick={() => setCurrentTrack(p => (p - 1 + TRACKS.length) % TRACKS.length)} className="text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff]/10 px-2 py-1 transition-colors">
          [ &lt;&lt; ]
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-2 border-2 ${isPlaying ? 'border-[#f0f] text-[#f0f]' : 'border-[#0ff] text-[#0ff]'} hover:bg-[#f0f]/20 transition-colors`}
        >
          {isPlaying ? '[ HALT ]' : '[ EXEC ]'}
        </button>
        <button onClick={() => setCurrentTrack(p => (p + 1) % TRACKS.length)} className="text-[#0ff] hover:text-[#f0f] hover:bg-[#0ff]/10 px-2 py-1 transition-colors">
          [ &gt;&gt; ]
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-4 w-full md:w-1/3 justify-start md:justify-end font-pixel text-xs">
        <span className="text-[#f0f]">AMP_LVL:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 appearance-none bg-transparent border border-[#0ff] h-3 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#f0f]"
        />
        <span className="w-8 text-right text-[#0ff]">{(volume * 100).toFixed(0)}%</span>
      </div>

      <audio
        ref={audioRef}
        src={track.url}
        onEnded={handleEnded}
        preload="auto"
      />
    </div>
  );
}

function SnakeGame({ hasStarted }: { hasStarted: boolean }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const dirRef = useRef(direction);
  const nextDirRef = useRef(direction);
  const foodRef = useRef(food);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    dirRef.current = INITIAL_DIRECTION;
    nextDirRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);

    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!INITIAL_SNAKE.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    setFood(newFood);
    foodRef.current = newFood;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dirRef.current.y === 0) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dirRef.current.y === 0) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dirRef.current.x === 0) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dirRef.current.x === 0) nextDirRef.current = { x: 1, y: 0 };
          break;
        case ' ':
        case 'Escape':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, resetGame]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDir = nextDirRef.current;
      dirRef.current = currentDir;

      const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore(s => {
          const newScore = s + 10;
          setHighScore(h => Math.max(h, newScore));
          return newScore;
        });

        let newFood;
        while (true) {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          };
          if (!newSnake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
        }
        setFood(newFood);
        foodRef.current = newFood;
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (!hasStarted || gameOver || isPaused) return;
    const speed = Math.max(40, 120 - Math.floor(score / 50) * 8);
    const id = setInterval(moveSnake, speed);
    return () => clearInterval(id);
  }, [hasStarted, gameOver, isPaused, moveSnake, score]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl relative z-10 tear">
      {/* Score Board */}
      <div className="flex items-center justify-between w-full px-4 py-2 border-2 border-[#0ff] bg-[#000] relative">
        <div className="absolute top-0 left-0 w-2 h-2 bg-[#f0f] -translate-x-1 -translate-y-1" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#f0f] translate-x-1 translate-y-1" />
        
        <div className="flex flex-col">
          <span className="text-[#f0f] text-xs font-pixel mb-1">DATA_YIELD</span>
          <span className="text-2xl font-term text-[#0ff]">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#f0f] text-xs font-pixel mb-1">PEAK_EFFICIENCY</span>
          <span className="text-2xl font-term text-[#0ff]">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative p-1 border-4 border-[#f0f] bg-[#000]">
        <div
          className="relative grid bg-[#000]"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(75vw, 450px)',
            height: 'min(75vw, 450px)',
            gap: '1px'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`w-full h-full ${
                  isHead
                    ? 'bg-[#0ff] shadow-[0_0_5px_#0ff]'
                    : isBody
                    ? 'bg-[#0aa]'
                    : isFood
                    ? 'bg-[#f0f] shadow-[0_0_8px_#f0f] animate-pulse'
                    : 'bg-[#111]'
                }`}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-[#000]/80 flex flex-col items-center justify-center z-20 border-2 border-[#f0f] m-2">
            <h2 className="text-2xl md:text-3xl font-pixel text-[#f0f] mb-4 text-center glitch" data-text="FATAL_ERR">FATAL_ERR</h2>
            <p className="text-[#0ff] mb-8 font-term text-xl">COLLISION_DETECTED</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-[#000] border-2 border-[#0ff] text-[#0ff] font-pixel text-xs hover:bg-[#0ff] hover:text-[#000] transition-colors"
            >
              [ REBOOT_SEQ ]
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-[#000]/60 flex items-center justify-center z-20">
            <h2 className="text-2xl font-pixel text-[#0ff] animate-pulse">SYS.HALTED</h2>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-[#0ff]/70 text-sm font-term text-center border border-[#0ff]/30 p-2 w-full">
        INPUT_REQ: [W][A][S][D] OR [ARROWS] TO NAVIGATE. [SPACE] TO HALT.
      </div>
    </div>
  );
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#000] text-[#0ff] flex flex-col font-term overflow-hidden selection:bg-[#f0f] selection:text-[#000]">
      <div className="scanlines" />
      <div className="static-bg" />

      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#000]">
          <div className="scanlines" />
          <div className="static-bg" />
          <div className="relative mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-pixel text-[#0ff] glitch" data-text="SNAKE.EXE">
              SNAKE.EXE
            </h1>
            <p className="text-[#f0f] mt-4 text-xl tracking-widest">v2.0.26 // GLITCH_ART_EDITION</p>
          </div>
          <button
            onClick={() => {
              setHasStarted(true);
              setIsPlaying(true);
            }}
            className="px-8 py-4 text-xl font-pixel text-[#000] bg-[#0ff] border-4 border-[#f0f] hover:bg-[#f0f] hover:text-[#0ff] hover:border-[#0ff] transition-all"
          >
            [ SYS.INIT() ]
          </button>
          <p className="mt-8 text-[#0ff]/50 animate-pulse">AWAITING_INPUT...</p>
        </div>
      )}

      {/* Header */}
      <header className="p-4 md:p-6 flex-shrink-0 flex items-center justify-between max-w-6xl mx-auto w-full border-b-2 border-[#0ff] mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-[#f0f] animate-pulse" />
          <h1 className="text-xl md:text-2xl font-pixel text-[#0ff] tracking-widest">
            SNAKE.EXE
          </h1>
        </div>
        <div className="text-[#f0f] text-sm md:text-base">
          STATUS: <span className="text-[#0ff] animate-pulse">ONLINE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative z-10">
        <SnakeGame hasStarted={hasStarted} />
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-[#000] p-4 relative z-10 max-w-6xl mx-auto w-full">
        <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </footer>
    </div>
  );
}
