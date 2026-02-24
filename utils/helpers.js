export function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getCharacterByCoords(x, y, characters) {
  return characters.find((char) => {
    const dx = char.x - x;
    const dy = char.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 20;
  });
}

export function calculateDamage(attacker, defender) {
  return Math.max(0, attacker.atk - defender.def);
}