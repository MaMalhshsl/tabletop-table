import React from "react";
import { useDraggable } from "../utils/useDraggable";

export default function CharacterCard({ char, onClose }) {
	const dragRef = useDraggable();

	return (
		<div className="glassmorphic window" ref={dragRef} style={{ cursor: "move" }}>
			<h3>{char.name}</h3>
			<p>HP: {char.hp} / {char.maxHp}</p>
			<p>Angriff: {char.atk}</p>
			<p>Verteidigung: {char.def}</p>
			<p>Bewegung: {char.move}</p>
			<p>Reichweite: {char.range}</p>
			<button className="glass-button" onClick={onClose}>Schließen</button>
		</div>
	);
}
