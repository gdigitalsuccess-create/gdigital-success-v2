'use client';
import { useRef, useState, useEffect } from 'react';

type Props = {
  file: File;
  aspect: number; // largeur/hauteur — 1=carré, 3=bannière
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

const DISPLAY = 320; // taille de la zone d'affichage (toujours carrée)

export default function CropModal({ file, aspect, onConfirm, onCancel }: Props) {
  const CROP_W = DISPLAY;
  const CROP_H = Math.round(DISPLAY / aspect);
  const CROP_Y0 = Math.round((DISPLAY - CROP_H) / 2); // centré verticalement

  const imgNative = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [fitScale, setFitScale] = useState(1);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // position de l'image dans le display
  const posRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const dragging = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    const img = new Image();
    img.onload = () => {
      imgNative.current = img;
      // Échelle pour voir la PHOTO ENTIÈRE dans la zone DISPLAY×DISPLAY
      const fit = Math.min(DISPLAY / img.naturalWidth, DISPLAY / img.naturalHeight);
      const initX = (DISPLAY - img.naturalWidth * fit) / 2;
      const initY = (DISPLAY - img.naturalHeight * fit) / 2;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setFitScale(fit);
      scaleRef.current = fit;
      setScale(fit);
      posRef.current = { x: initX, y: initY };
      setPos({ x: initX, y: initY });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    lastPtr.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPtr.current.x;
    const dy = e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    const next = { x: posRef.current.x + dx, y: posRef.current.y + dy };
    posRef.current = next;
    setPos({ ...next });
  }

  function onPointerUp() { dragging.current = false; }

  function onScaleChange(v: number) {
    scaleRef.current = v;
    setScale(v);
  }

  function handleConfirm() {
    const img = imgNative.current;
    if (!img || natural.w === 0) return;

    // Crop box dans display : x=0, y=CROP_Y0, w=CROP_W, h=CROP_H
    // Image dans display : x=pos.x, y=pos.y, w=natural.w*scale, h=natural.h*scale

    // Convertir la zone crop en coordonnées image originale
    const srcX = (0 - pos.x) / scale;
    const srcY = (CROP_Y0 - pos.y) / scale;
    const srcW = CROP_W / scale;
    const srcH = CROP_H / scale;

    // Clamper aux bornes de l'image
    const clampX = Math.max(0, srcX);
    const clampY = Math.max(0, srcY);
    const clampW = Math.min(natural.w - clampX, srcW + Math.min(0, srcX));
    const clampH = Math.min(natural.h - clampY, srcH + Math.min(0, srcY));

    // Destination dans l'output (pour gérer les bords noirs si image trop petite)
    const dstX = Math.max(0, -srcX) * (CROP_W / srcW);
    const dstY = Math.max(0, -srcY) * (CROP_H / srcH);
    const dstW = clampW * (CROP_W / srcW);
    const dstH = clampH * (CROP_H / srcH);

    const outW = 1200;
    const outH = Math.round(1200 / aspect);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, outW, outH);
    if (clampW > 0 && clampH > 0) {
      ctx.drawImage(
        img,
        clampX, clampY, clampW, clampH,
        (dstX / CROP_W) * outW, (dstY / CROP_H) * outH,
        (dstW / CROP_W) * outW, (dstH / CROP_H) * outH,
      );
    }
    canvas.toBlob(b => { if (b) onConfirm(b); }, 'image/jpeg', 0.92);
  }

  const displayedW = natural.w * scale;
  const displayedH = natural.h * scale;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, width: DISPLAY + 48, maxWidth: '100%' }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>
          Recadrer la photo
        </p>

        {/* Zone d'affichage — toujours carrée */}
        <div
          style={{ width: DISPLAY, height: DISPLAY, background: '#0a0a14', position: 'relative', margin: '0 auto 8px', borderRadius: 8, overflow: 'hidden', cursor: 'grab', userSelect: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* Image complète repositionnable */}
          {imgSrc && natural.w > 0 && (
            <img
              src={imgSrc}
              draggable={false}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: displayedW,
                height: displayedH,
                display: 'block',
                pointerEvents: 'none',
                touchAction: 'none',
                userSelect: 'none',
              }}
            />
          )}

          {/* Zone sombre au-dessus du crop */}
          {CROP_Y0 > 0 && (
            <div style={{ position: 'absolute', left: 0, top: 0, width: DISPLAY, height: CROP_Y0, background: 'rgba(0,0,0,0.62)', pointerEvents: 'none' }} />
          )}
          {/* Zone sombre en-dessous du crop */}
          {CROP_Y0 + CROP_H < DISPLAY && (
            <div style={{ position: 'absolute', left: 0, top: CROP_Y0 + CROP_H, width: DISPLAY, height: DISPLAY - CROP_Y0 - CROP_H, background: 'rgba(0,0,0,0.62)', pointerEvents: 'none' }} />
          )}

          {/* Bordure de la zone de recadrage */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: CROP_Y0,
            width: CROP_W,
            height: CROP_H,
            border: '2px solid rgba(0,207,255,0.9)',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}>
            {/* Coins */}
            {[
              { top: -3, left: -3 } as React.CSSProperties,
              { top: -3, right: -3 } as React.CSSProperties,
              { bottom: -3, left: -3 } as React.CSSProperties,
              { bottom: -3, right: -3 } as React.CSSProperties,
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 10, height: 10, background: '#00CFFF', borderRadius: 2, ...s }} />
            ))}
          </div>
        </div>

        <p style={{ color: '#888', fontSize: 11, textAlign: 'center', margin: '0 0 12px' }}>
          Glissez pour repositionner · utilisez le zoom pour recadrer
        </p>

        {/* Bouton retour fit (voir photo entière) */}
        <button
          onClick={() => {
            scaleRef.current = fitScale;
            setScale(fitScale);
            const x = (DISPLAY - natural.w * fitScale) / 2;
            const y = (DISPLAY - natural.h * fitScale) / 2;
            posRef.current = { x, y };
            setPos({ x, y });
          }}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#aaa', fontSize: 12, cursor: 'pointer' }}
        >
          Voir la photo entière
        </button>

        <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>Zoom</label>
        <input
          type="range"
          min={fitScale * 0.5}
          max={Math.min(fitScale * 8, 6)}
          step={0.001}
          value={scale}
          onChange={e => onScaleChange(parseFloat(e.target.value))}
          style={{ width: '100%', marginBottom: 16, accentColor: '#00CFFF' }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '10px', border: '1px solid #444', background: 'transparent', color: '#ccc', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            Annuler
          </button>
          <button onClick={handleConfirm}
            style={{ flex: 1, padding: '10px', background: '#00CFFF', border: 'none', color: '#000', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
