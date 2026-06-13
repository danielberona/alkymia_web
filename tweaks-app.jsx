/* ============================================================
   ALKYMIA — Tweaks panel
   Drives CSS variables via window.applyTweaks (defined in app.js)
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "ambar",
  "headline": "editorial",
  "cursor": true,
  "motion": 70
}/*EDITMODE-END*/;

function AlkymiaTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    if (window.applyTweaks) window.applyTweaks(t);
  }, [t.accent, t.headline, t.cursor, t.motion]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Paleta" />
      <TweakRadio
        label="Acento"
        value={t.accent === 'brasa' ? 'Brasa' : 'Ámbar'}
        options={['Ámbar', 'Brasa']}
        onChange={(v) => setTweak('accent', v === 'Brasa' ? 'brasa' : 'ambar')}
      />

      <TweakSection label="Tipografía" />
      <TweakRadio
        label="Titulares"
        value={t.headline === 'alt' ? 'Moderna' : 'Editorial'}
        options={['Editorial', 'Moderna']}
        onChange={(v) => setTweak('headline', v === 'Moderna' ? 'alt' : 'editorial')}
      />

      <TweakSection label="Movimiento" />
      <TweakSlider
        label="Intensidad"
        value={t.motion}
        min={0} max={100} step={10} unit="%"
        onChange={(v) => setTweak('motion', v)}
      />
      <TweakToggle
        label="Cursor dorado"
        value={t.cursor}
        onChange={(v) => setTweak('cursor', v)}
      />
    </TweaksPanel>
  );
}

(function mountTweaks() {
  const el = document.getElementById('tweaks-root');
  if (!el || !window.ReactDOM) return;
  ReactDOM.createRoot(el).render(<AlkymiaTweaks />);
})();
