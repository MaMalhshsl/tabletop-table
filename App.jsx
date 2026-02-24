import React, { useRef, useEffect, useState, useMemo } from "react";
import { initialCharacters, characterTemplates } from "./data/characters";
import { drawGrid, drawCharacters } from "./lib/draw";
import { distanceBetween, getCharacterByCoords, calculateDamage } from "./utils/helpers";
import CharacterCard from "./components/CharacterCard";
import Toolbar from "./components/Toolbar";
import CharacterForm from "./components/CharacterForm";
import BattlemapPicker from "./components/BattlemapPicker";
import { battlemaps } from "./data/map";
import useMarkerTracking from './hooks/useMarkerTracking'; 
import './glass.css';

const codewords = [
  [1, 0, 0, 0, 0],
  [1, 0, 1, 1, 1],
  [0, 1, 0, 0, 1],
  [0, 1, 1, 1, 0],
];

const generateJsArucoMarker = (markerId, cellSize = 24, borderCells = 1) => {
  if (typeof document === "undefined") return "";

  const bits = [];
  for (let row = 0; row < 5; row++) {
    const shift = (4 - row) * 2;
    const val = (markerId >> shift) & 0b11;
    bits[row] = codewords[val];
  }

  const size = (5 + borderCells * 2) * cellSize;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#000";
  for (let y = 0; y < 5 + borderCells * 2; y++) {
    for (let x = 0; x < 5 + borderCells * 2; x++) {
      const isBorder =
        x < borderCells ||
        y < borderCells ||
        x >= 5 + borderCells ||
        y >= 5 + borderCells;
      if (isBorder) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }

  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      ctx.fillStyle = bits[y][x] ? "#fff" : "#000";
      ctx.fillRect(
        (x + borderCells) * cellSize,
        (y + borderCells) * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  return canvas.toDataURL("image/png");
};

const TILE_SIZE = 50;

// 2025-12-26: Keine Start-Charaktere laden, Figuren spawnen erst bei Marker-Erkennung
const savedState = null;

const prepareInitialCharacters = () => initialCharacters.map((char) => ({
  ...char,
  hasMoved: false,
  hasAttacked: false,
  remainingMove: char.move,
}));

let characterIdCounter = 1001;
const isAlive = (char) => char.hp > 0;

export default function App() {
  const canvasRef = useRef();
  const debugCanvasRef = useRef(null);
  const [videoElement, setVideoElement] = useState(null);
  const [characters, setCharacters] = useState(prepareInitialCharacters);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [backgroundMap, setBackgroundMap] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [attackMode, setAttackMode] = useState(false);

  const { markers, error } = useMarkerTracking(videoElement, debugCanvasRef);
  const markerPreviews = useMemo(
    () =>
      [1, 5, 17].map((id) => ({
        id,
        dataUrl: generateJsArucoMarker(id, 28),
      })),
    []
  );

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const withinFacingCone = (char, target, coneRadians = Math.PI / 6) => {
      if (!char.facing) return false;
      const vx = target.x - char.x;
      const vy = target.y - char.y;
      const dist = Math.hypot(vx, vy);
      if (dist === 0) return false;
      const normX = vx / dist;
      const normY = vy / dist;
      const dot = char.facing.x * normX + char.facing.y * normY;
      const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
      return angle <= coneRadians;
    };

    setCharacters((prevChars) => {
      let changed = false;
      let updated = [...prevChars];

      markers.forEach((marker) => {
        const idx = updated.findIndex(
          (c) => c.markerId === marker.id && isAlive(c)
        );

        if (idx !== -1) {
          const current = updated[idx];

          const dx = current.x - marker.x;
          const dy = current.y - marker.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const tilesMoved = distance / TILE_SIZE;
          if (tilesMoved < 0.2) {
            return;
          }

          if (current.remainingMove > 0 && tilesMoved <= current.remainingMove) {
            updated[idx] = {
              ...current,
              x: marker.x,
              y: marker.y,
              angle: marker.angle,
              facing: marker.facing,
              remainingMove: Math.max(0, current.remainingMove - tilesMoved),
              hasMoved: true,
            };
            changed = true;
          } else if (current.remainingMove > 0) {
            const ratio = current.remainingMove / tilesMoved;
            const clampedX = current.x + (marker.x - current.x) * ratio;
            const clampedY = current.y + (marker.y - current.y) * ratio;
            updated[idx] = {
              ...current,
              x: clampedX,
              y: clampedY,
              angle: marker.angle,
              facing: marker.facing,
              remainingMove: 0,
              hasMoved: true,
            };
            changed = true;
          } else {
            updated[idx] = { ...current, angle: marker.angle, facing: marker.facing };
          }
        } else {
          const template = characterTemplates[marker.id];
          const newCharacter = {
            id: characterIdCounter++,
            name: template?.name || `Marker #${marker.id}`,
            role: template?.role,
            markerId: marker.id,
            x: marker.x,
            y: marker.y,
            hp: template?.hp ?? 10,
            maxHp: template?.maxHp ?? 10,
            atk: template?.atk ?? 3,
            def: template?.def ?? 1,
            move: template?.move ?? 3,
            range: template?.range ?? 1,
            color:
              template?.color ||
              `#${Math.floor(Math.random() * 16777215)
                .toString(16)
                .padStart(6, "0")}`,
            hasMoved: false,
            hasAttacked: false,
            remainingMove: template?.move ?? 3,
            angle: marker.angle,
            facing: marker.facing,
          };
          updated.push(newCharacter);
          changed = true;
        }
      });

      // 2025-12-02: Auto-Angriff in Sichtrichtung: aktiver Charakter greift das nächste Ziel in Range an, das im Sichtkegel liegt
      // Funktioniert so nicht -> braucht eine andere Lösung
      updated = updated.map((char) => ({ ...char }));
      updated.forEach((char) => {
        if (char.hasAttacked || !isAlive(char)) return;
        const targets = updated.filter((c) => c.id !== char.id && isAlive(c));
        const inRange = targets
          .map((t) => {
            const dx = t.x - char.x;
            const dy = t.y - char.y;
            return { t, dist: Math.hypot(dx, dy) };
          })
          .filter(({ dist }) => dist <= char.range * TILE_SIZE);
        const directionalTargets = inRange.filter(({ t }) =>
          withinFacingCone(char, t)
        );
        if (!directionalTargets.length) return;

        const { t: target } = directionalTargets.sort((a, b) => a.dist - b.dist)[0];
        const damage = calculateDamage(char, target);
        updated = updated.map((c) =>
          c.id === target.id
            ? { ...c, hp: Math.max(0, c.hp - damage) }
            : c.id === char.id
            ? { ...c, hasAttacked: true }
            : c
        );
        changed = true;
      });

      return changed ? updated : prevChars;
    });
  }, [markers]);


  const handleSelectMap = (mapUrl) => {
    const img = new Image();
    img.src = mapUrl;
    img.onload = () => setBackgroundMap(img);
    setShowMapPicker(false);
  };

  useEffect(() => {
    if (battlemaps.length > 0) handleSelectMap(battlemaps[0]);
  }, []);

  const endTurn = () => {
    if (!characters.length) return;

    const aliveCharacters = characters.filter(isAlive);
    const currentCharacter = characters[currentTurn];
    const currentAliveIndex = aliveCharacters.findIndex((c) => c.id === currentCharacter.id);
    const nextAlive = aliveCharacters[(currentAliveIndex + 1) % aliveCharacters.length];

    if (!nextAlive || nextAlive.id === aliveCharacters[0].id) {
      setRound((r) => r + 1);
      setCharacters((prev) =>
        prev.map((c) =>
          isAlive(c)
            ? { ...c, hasMoved: false, hasAttacked: false, remainingMove: c.move }
            : c
        )
      );
    }

    const nextIndex = characters.findIndex((c) => c.id === nextAlive.id);
    setCurrentTurn(nextIndex);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setCanvasSize({ width: canvas.width, height: canvas.height });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    if (backgroundMap) {
      ctx.drawImage(backgroundMap, 0, 0, canvasSize.width, canvasSize.height);
    }

    drawGrid(ctx, canvasSize.width, canvasSize.height, 50);
    drawCharacters(ctx, characters, {
      selectedId: null,
      tempPosition: null,
      currentCharacter: characters[currentTurn],
      attackMode,
      isAlive,
      showMoveRadius: true,
      showAttackRadius: true,
    });
  }, [characters, canvasSize, currentTurn, attackMode, backgroundMap]);

  const addCharacter = (charData) => {
    const newChar = {
      ...charData,
      id: characterIdCounter++,
      hasMoved: false,
      hasAttacked: false,
      remainingMove: charData.move,
    };
    setCharacters((prev) => [...prev, newChar]);
    setShowForm(false);
  };

  const handleCanvasClick = (e) => {
    if (!characters.length) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clicked = getCharacterByCoords(x, y, characters);

    if (attackMode && clicked && clicked.id !== characters[currentTurn].id) {
      const attacker = characters[currentTurn];
      if (
        distanceBetween(attacker, clicked) <= attacker.range * 50 &&
        !attacker.hasAttacked
      ) {
        const damage = calculateDamage(attacker, clicked);
        setCharacters((prev) =>
          prev.map((c) =>
            c.id === clicked.id
              ? { ...c, hp: Math.max(0, c.hp - damage) }
              : c.id === attacker.id
              ? { ...c, hasAttacked: true }
              : c
          )
        );
        setAttackMode(false);
      }
      return;
    }
    
    if (clicked) {
        setSelectedCharacter(clicked);
    }
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener("click", handleCanvasClick);
    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  });

  useEffect(() => {
    localStorage.setItem("tabletopGame", JSON.stringify({ characters, currentTurn, round }));
  }, [characters, currentTurn, round]);

  return (
    <>
      <canvas ref={canvasRef} />
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 200,
          textAlign: 'center'
        }}>
          <h3>Camera Error</h3>
          <p>{error.name}: {error.message}</p>
          <p style={{ fontSize: '0.8em', marginTop: '15px' }}>Please check your browser permissions and ensure no other application is using the camera.</p>
        </div>
      )}

      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100, display: 'flex', gap: '10px' }}>
        <video 
          ref={setVideoElement} 
          style={{ width: 160, height: 120, objectFit: 'cover', border: '1px solid black' }}
          muted
          autoPlay
          playsInline
        />
        <canvas 
          ref={debugCanvasRef}
          style={{ width: 160, height: 120, objectFit: 'cover', border: '3px solid red' }}
        />
      </div>

      <div style={{
        position: 'absolute',
        top: 140,
        left: 10,
        zIndex: 90,
        background: 'rgba(0,0,0,0.55)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '200px'
      }}>
        <div style={{ marginBottom: '6px', fontWeight: 600 }}>Marker-Status</div>
        <div>Erkannte IDs: {markers?.length ? markers.map(m => m.id).join(', ') : 'keine'}</div>
        <div style={{ marginTop: '10px', fontWeight: 600 }}>Marker zum Drucken</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          {markerPreviews.map(({ id, dataUrl }) => (
            <div key={id} style={{ background: '#fff', padding: '6px', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, color: '#111', marginBottom: '4px' }}>ID {id}</div>
              <img src={dataUrl} alt={`ArUco Marker ID ${id}`} style={{ width: '100%', display: 'block' }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: '6px', lineHeight: 1.4 }}>
          Drucke diese Marker (Rand vollständig lassen). Zuordnung: Krieger=ID 1, Fernkämpfer=ID 5, Magier=ID 17.
        </div>
      </div>

      <Toolbar
        round={round}
        currentCharacter={characters[currentTurn]}
        onEndTurn={endTurn}
        showForm={showForm}
        onToggleForm={() => setShowForm((prev) => !prev)}
        onOpenMapPicker={() => setShowMapPicker(true)}
      />

      {showForm && (
        <CharacterForm
          onSubmit={addCharacter}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showMapPicker && (
        <BattlemapPicker
          maps={battlemaps}
          onSelectMap={handleSelectMap}
          onCancel={() => setShowMapPicker(false)}
        />
      )}

      {characters.map((char) => (
        <React.Fragment key={`char-ui-${char.id}`}>
          <button
            className="character-ui-button"
            onClick={() => setSelectedCharacter(char)}
            style={{ left: char.x - 20, top: char.y - 45 }}
          >
            {char.name}
          </button>

          <button
            className="character-ui-button character-ui-button--attack"
            onClick={() => {
              if (char.id === characters[currentTurn]?.id && !char.hasAttacked) {
                setAttackMode(true);
              }
            }}
            style={{
              left: char.x + 30,
              top: char.y - 20,
              cursor:
                char.id === characters[currentTurn]?.id && !char.hasAttacked
                  ? "pointer"
                  : "not-allowed",
              opacity:
                char.id === characters[currentTurn]?.id && !char.hasAttacked ? 1 : 0.5,
            }}
          >
            Angriff
          </button>
        </React.Fragment>
      ))}

      {selectedCharacter && (
        <CharacterCard char={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
      )}
    </>
  );
}
