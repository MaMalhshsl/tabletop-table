import React from 'react';

export default function BattlemapPicker({ maps, onSelectMap, onCancel }) {
  return (
    <div className="picker-overlay">
      <div className="glassmorphic window map-picker">
        <h3>Karte auswählen</h3>
        <div className="thumbnail-grid">
          {maps.map((mapSrc) => (
            <div
              key={mapSrc}
              className="thumbnail-container"
              onClick={() => onSelectMap(mapSrc)}
            >
              <img src={mapSrc} alt={`Battlemap-Vorschau ${mapSrc}`} />
            </div>
          ))}
        </div>
        <div className="form-button-container">
          <button className="glass-button" type="button" onClick={onCancel}>
            <span>Schließen</span>
          </button>
        </div>
      </div>
    </div>
  );
}