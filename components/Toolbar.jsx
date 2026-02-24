import React from "react";

export default function Toolbar({ round, currentCharacter, onEndTurn, onToggleForm, onOpenMapPicker }) {
  return (
    <div className="glassmorphic topbar">
      <div>
        <span className="topbar--title">Runde:</span> <strong className="topbar--value">{round}</strong> | <span className="topbar--title">Am Zug:</span> <strong className="topbar--value">{currentCharacter?.name || 'Niemand'}</strong>
      </div>
      <div>
        <button
		  className="topbar--button"
		  onClick={onOpenMapPicker}
		  style={{ marginRight: '1rem' }}
		  title="Karte wählen"
		>
		  <img
			src="/img/icons/map.svg"
			alt="Karte wählen"
			style={{ width: "20px", height: "20px" }}
		  />
		</button>
        <button
		  className="topbar--button"
		  onClick={onEndTurn}
		  title="Zug beenden"
		>
		  <img
			src="/img/icons/clock.svg"
			alt="Zug beenden"
			style={{ width: "20px", height: "20px" }}
		  />
		</button>
        <button
		  className="topbar--button"
		  onClick={onToggleForm}
		  style={{ marginLeft: '1rem' }}
		  title="Neuer Charakter"
		>
		  <img
			src="/img/icons/group.svg"
			alt="Neuer Charakter"
			style={{ width: "20px", height: "20px" }}
		  />
		</button>
		<button
		  className="topbar--button"
		  style={{ marginLeft: '1rem' }}
		  onClick={() => {
			const confirmReset = window.confirm("Möchtest du den Spielstand wirklich zurücksetzen?");
			if (confirmReset) {
			  localStorage.removeItem("tabletopGame");
			  window.location.reload();
			}
		  }}
		  title="Spielstand zurücksetzen"
		>
		  <img
			src="/img/icons/erase.svg"
			alt="Spielstand zurücksetzen"
			style={{ width: "20px", height: "20px" }}
		  />
		</button>
      </div>
    </div>
  );
}