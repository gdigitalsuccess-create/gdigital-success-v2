'use client';
import { useRef, useState, useEffect } from 'react';

type Props = {
  file: File;
  aspect: number; // largeur/hauteur — 1 = carré, 3 = bannière
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

const PREVIEW_W = 320;

export default function CropModal({ file, aspect, onConfirm, onCancel }: Props) {
  const PREVIEW_H = Math.round(PREVIEW_W / aspect);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [minScale, setMinScale] = useState(1);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const min = Math.max(PREVIEW_W / img.naturalWidth, PREVIEW_H / img.naturalHeight);
      const initScale = Math.max(min, 1);
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      setMinScale(min);
      scaleRef.current = initScale;
      setScale(initScale);
      const cx = (PREVIEW_W - img.naturalWidth * initScale) / 2;
      const cy = (PREVIEW_H - img.naturalHeight * initScale) / 2;
      posRef.current = { x: cx, y: cy };
      setPos({ x: cx, y: cy });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, PREVIEW_H]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
    ctx.drawImage(img, pos.x, pos.y, imgSize.w * scale, imgSize.h * scale);
  }, [scale, pos, imgSize, PREVIEW_H]);

  function clamp(x: number, y: number, s: number) {
    const sw = imgSize.w * s;
    const sh = imgSize.h * s;
    return {
      x: Math.min(0, Math.max(PREVIEW_W - sw, x)),
      y: Math.min(0, Math.max(PREVIEW_H - sh, y)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    const newPos = clamp(posRef.current.x + dx, posRef.current.y + dy, scaleRef.current);
    posRef.current = newPos;
    setPos(newPos);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  function onScaleChange(v: number) {
    scaleRef.current = v;
    setScale(v);
    const newPos = clamp(posRef.current.x, posRef.current.y, v);
    posRef.current = newPos;
    setPos(newPos);
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(b => { if (b) onConfirm(b); }, 'image/jpeg', 0.92);
  }

  const isCircle = aspect === 1;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#1a1a2e', borderRadius: 16, padding: 24, width: PREVIEW_W + 48, maxWidth: '100%' }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>
          Recadrer la photo
        </p>

        {/* Zone de preview avec drag */}
        <div
          style={{
            width: PREVIEW_W,
            height: PREVIEW_H,
            borderRadius: isCircle ? '50%' : 8,
            overflow: 'hidden',
            cursor: 'grab',
            margin: '0 auto 8px',
            boxShadow: `0 0 0 3px rgba(0,207,255,0.5)`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <canvas
            ref={canvasRef}
            width={PREVIEW_W}
            height={PREVIEW_H}
            style={{ display: 'block', touchAction: 'none' }}
          />
        </div>

        <p style={{ color: '#888', fontSize: 12, textAlign: 'center', margin: '0 0 14px' }}>
          Glissez pour repositionner
        </p>

        <label style={{ color: '#aaa', fontSize: 12, display: 'block', marginBottom: 4 }}>
          Zoom
        </label>
        <input
          type="range"
          min={minScale}
          max={Math.min(minScale * 4, 8)}
          step={0.01}
          value={scale}
          onChange={e => onScaleChange(parseFloat(e.target.value))}
          style={{ width: '100%', marginBottom: 18, accentColor: '#00CFFF' }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px', border: '1px solid #444', background: 'transparent', color: '#ccc', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            style={{ flex: 1, padding: '10px', background: '#00CFFF', border: 'none', color: '#000', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
