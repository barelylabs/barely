'use client';

import Confetti from 'react-confetti'

const ConfettiRain = () => {
  const w = window.innerWidth;
  const h = 1.2 * window.innerHeight;

  return <Confetti
    width={w} height={h} recycle={false} tweenDuration={10000} numberOfPieces={1500} />
}

export { ConfettiRain as ConfettiRain }
