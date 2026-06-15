import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Loader2, Upload, X } from "lucide-react";

type Area = { x: number; y: number; width: number; height: number };

async function getCroppedDataUrl(
  src: string,
  crop: Area,
  outW: number,
  outH: number,
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function ImageCropUpload({
  value,
  onChange,
  label = "প্রোফাইল ছবি",
  aspect = 1,
  round = true,
  outputWidth = 400,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  aspect?: number;
  round?: boolean;
  outputWidth?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const outputHeight = Math.round(outputWidth / aspect);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setAreaPixels(pixels);
  }, []);

  const confirm = async () => {
    if (!src || !areaPixels) return;
    setBusy(true);
    try {
      const dataUrl = await getCroppedDataUrl(src, areaPixels, outputWidth, outputHeight);
      onChange(dataUrl);
      setSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            className={`border border-border object-cover ${round ? "h-16 w-16 rounded-2xl" : "h-16 w-28 rounded-xl"}`}
          />
        ) : (
          <div
            className={`grid place-items-center border border-dashed border-border text-xs text-muted-foreground ${round ? "h-16 w-16 rounded-2xl" : "h-16 w-28 rounded-xl"}`}
          >
            নেই
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-primary"
        >
          <Upload className="h-4 w-4" /> ছবি আপলোড
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>

      {src && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-semibold">ছবি ক্রোপ করুন</span>
            <button onClick={() => setSrc(null)} aria-label="বন্ধ করুন">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={round ? "round" : "rect"}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="space-y-3 px-4 py-4">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <button
              onClick={confirm}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl gradient-emerald py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              ছবি সেট করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
