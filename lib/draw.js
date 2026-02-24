export function drawGrid(ctx, width, height, size = 50) {
  ctx.strokeStyle = "#ccc";
  for (let x = 0; x < width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function drawCharacters(ctx, characters, options = {}) {
  const {
    selectedId,
    tempPosition,
    currentCharacter,
    attackMode,
    isAlive = () => true,
    showMoveRadius = false,
    showAttackRadius = false,
  } = options;

  characters.forEach((char) => {
    const { x, y, color, hp, maxHp, id, move, range } = char;
    const isDead = hp <= 0;

    const drawX = id === selectedId && tempPosition ? tempPosition.x : x;
    const drawY = id === selectedId && tempPosition ? tempPosition.y : y;

    ctx.save();

    if (isDead) {
      ctx.globalAlpha = 0.3;
    }

    if (showMoveRadius && isAlive(char)) {
      const originX = drawX;
      const originY = drawY;
      const radius = (char.remainingMove !== undefined ? char.remainingMove : move) * 50;
      if (radius > 0) {
        const isCurrent = id === currentCharacter?.id;
        ctx.beginPath();
        ctx.arc(originX, originY, radius, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? "rgba(0, 255, 0, 0.15)" : "rgba(0, 180, 0, 0.08)";
        ctx.fill();

        ctx.strokeStyle = isCurrent ? "rgba(0, 200, 0, 0.8)" : "rgba(0, 140, 0, 0.6)";
        ctx.lineWidth = isCurrent ? 2 : 1.2;
        ctx.stroke();
      }
    }

	if (showAttackRadius && attackMode && id === currentCharacter?.id && !char.hasAttacked && isAlive(char)) {
	  ctx.beginPath();
	  ctx.arc(drawX, drawY, range * 50, 0, Math.PI * 2);
	  ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
	  ctx.fill();

	  ctx.strokeStyle = "rgba(200, 0, 0, 0.8)";
	  ctx.lineWidth = 2;
	  ctx.stroke();
	}

    if (char.facing && isAlive(char)) {
      const angle = Math.atan2(char.facing.y, char.facing.x);
      ctx.save();
      ctx.translate(drawX, drawY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(-8, 8);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(drawX, drawY, 20, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();

    const hpBarWidth = 40;
    const hpBarHeight = 5;
    const hpRatio = hp / maxHp;

    ctx.fillStyle = "#000";
    ctx.fillRect(drawX - hpBarWidth / 2, drawY + 25, hpBarWidth, hpBarHeight);
    ctx.fillStyle = isDead ? "#666" : "#0f0";
    ctx.fillRect(drawX - hpBarWidth / 2, drawY + 25, hpBarWidth * hpRatio, hpBarHeight);

    ctx.restore();
  });
}
