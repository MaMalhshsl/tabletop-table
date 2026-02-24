import React, { useState } from "react";
import '../glass.css'; 
import { useDraggable } from "../utils/useDraggable";

export default function CharacterForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [hp, setHp] = useState(10);
  const [attackType, setAttackType] = useState("melee");
  const [attack, setAttack] = useState(5);
  const [defense, setDefense] = useState(2);
  const [move, setMove] = useState(3);
  const [range, setRange] = useState(1);
  const [color, setColor] = useState("#00AAFF");
  const dragRef = useDraggable();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      name, 
      hp, 
      maxHp: hp,
      atk: attack,
      def: defense,
      move, 
      range, 
      color, 
      attackType, 
      x: 100,
      y: 100
    });
  };

  return (
    <form className="glassmorphic window" ref={dragRef} style={{ cursor: "move" }} onSubmit={handleSubmit}>

	  <h3>Neuer Charakter</h3>

	  <div className="form-group">
		<label>Name</label>
		<input value={name} onChange={e => setName(e.target.value)} required />
	  </div>

	  <div className="form-group">
		<label>HP</label>
		<input type="number" value={hp} onChange={e => setHp(Number(e.target.value))} />
	  </div>

	  <div className="form-group">
		<label>Typ</label>
		<select value={attackType} onChange={e => setAttackType(e.target.value)}>
		  <option value="melee">Nahkampf</option>
		  <option value="ranged">Fernkampf</option>
		  <option value="magic">Magie</option>
		</select>
	  </div>

	  <div className="form-group">
		<label>Angriff</label>
		<input type="number" value={attack} onChange={e => setAttack(Number(e.target.value))} />
	  </div>

	  <div className="form-group">
		<label>Verteidigung</label>
		<input type="number" value={defense} onChange={e => setDefense(Number(e.target.value))} />
	  </div>

	  <div className="form-group">
		<label>Bewegung</label>
		<input type="number" value={move} onChange={e => setMove(Number(e.target.value))} />
	  </div>

	  <div className="form-group">
		<label>Reichweite</label>
		<input type="number" value={range} onChange={e => setRange(Number(e.target.value))} />
	  </div>

	  <div className="form-group">
		<label>Farbe</label>
		<input type="color" value={color} onChange={e => setColor(e.target.value)} />
	  </div>

	  <div className="form-button-container">
		<button className="glass-button" type="submit"><span>Erstellen</span></button>
		<button className="glass-button" type="button" onClick={onCancel}><span>Abbrechen</span></button>
	  </div>
	</form>
  );
}