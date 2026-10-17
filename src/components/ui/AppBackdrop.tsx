'use client'

import ShapeWaves from './ShapeWaves'

export default function AppBackdrop() {
  return (
    <div 
      className="fixed inset-0 -z-50 pointer-events-none overflow-hidden h-screen w-screen"
      style={{ backgroundColor: '#F97316' }}
    >
      <ShapeWaves
        text="Engineering monk"
        fontFamily='Geist, "Geist Sans", system-ui, sans-serif'
        fontWeight={500}
        textSize={0.49}
        shapes="mixed"
        cellSize={10}
        dotSize={0.75}
        color="#000000"
        hoverColor="#161414"
        backgroundColor="#F97316"
        speed={1}
        scale={1}
        contrast={1}
        brightness={0.4}
        flow={0}
        direction={0}
        fade={0.25}
        interactive={true}
        splashRadius={40}
        splashStrength={0.4}
        glow={0.35}
        intro={true}
        introDuration={1.6}
        paused={false}
      />
    </div>
  )
}
