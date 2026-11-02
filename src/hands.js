// Reference-led photographic cutouts. Each limb stays independent so it can breathe,
// part for the river, and keep the left-history/right-writing interaction intact.
// The mechanical hand is shown as a glass shell over a living circuit board.
export function createHands() {
  const left = document.querySelector('#hand-art-left');
  const right = document.querySelector('#hand-art-right');
  let gesture = null;
  return {
    setGesture(value) { gesture = value; },
    update({menuAmount, clock}) {
      const breath = Math.sin(clock * .72) * 4;
      const roll = Math.sin(clock * .54) * .35;
      for (const [el, direction] of [[left, -1], [right, 1]]) {
        const out = (1 - menuAmount) * direction * 110;
        let dx = 0, dy = 0;
        if (gesture?.kind === 'paddle') { dx = direction * Math.max(0, gesture.dy) * .65; dy = -Math.max(0, gesture.dy) * .22; }
        else if (gesture?.side === (direction < 0 ? 'left' : 'right')) { dx = gesture.dx; dy = gesture.dy * .25; }
        el.style.transform = `translate3d(calc(${out}% + ${dx}px), calc(-50% + ${breath + (1 - menuAmount) * 45 + dy}px), 0) rotate(${roll * direction}deg)`;
        el.style.opacity = Math.min(1, menuAmount * 1.6).toFixed(3);
        el.style.visibility = menuAmount > .02 ? 'visible' : 'hidden';
        el.disabled = document.body.dataset.screen !== 'menu';
      }
    },
    setLefty(value) {
      left.querySelector('img').src = `assets/hand-${value?'right-natural':'left-graphite'}-v2.png`;
      right.querySelector('img').src = `assets/hand-${value?'left-graphite':'right-natural'}-v2.png`;
      left.classList.toggle('mirrored', value);
      right.classList.toggle('mirrored', value);
      left.classList.toggle('is-mech', !value);
      right.classList.toggle('is-mech', value);
    }
  };
}
