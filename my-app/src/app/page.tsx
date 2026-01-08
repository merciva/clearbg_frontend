"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Background States
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [bgImage, setBgImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setProcessedImage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const backendURL = "https://handy-sammy-cinnamonic.ngrok-free.dev"

    try {
      const response = await fetch(`${backendURL}/process-image`, {
        method: "POST",
        body: formData,
      });
      const blob = await response.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Failed to process image. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgImage(URL.createObjectURL(file));
      setBgColor("transparent"); // Clear color if image is chosen
    }
  };

  // Helper to merge images for download
  const handleDownload = async () => {
    if (!processedImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.crossOrigin = "anonymous";
    img.src = processedImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw Background Color
      if (bgColor && bgColor !== "transparent") {
        ctx!.fillStyle = bgColor;
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Draw Background Image (Scaled to fit)
      if (bgImage) {
        const bg = new Image();
        bg.src = bgImage;
        bg.onload = () => {
          // Draw bg first
          ctx!.drawImage(bg, 0, 0, canvas.width, canvas.height);
          // Then draw subject
          ctx!.drawImage(img, 0, 0);
          triggerDownload(canvas);
        };
      } else {
        // Just draw subject
        ctx!.drawImage(img, 0, 0);
        triggerDownload(canvas);
      }
    };
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    const link = document.createElement("a");
    link.download = "final-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Magic Background Remover
      </h1>

      {/* Upload Box */}
      {!originalImage && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-lg h-64 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-800 transition"
        >
          <p className="text-xl text-slate-300">Click to Upload Image</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
      )}

      {loading && <p className="mt-8 text-blue-400 animate-pulse">Processing... please wait...</p>}

      {/* Editor Interface */}
      {processedImage && (
        <div className="w-full max-w-6xl flex gap-8 mt-4">

          {/* Left: Toolbar */}
          <div className="w-64 bg-slate-800 p-6 rounded-xl space-y-6 h-fit">
            <div>
              <h3 className="font-bold mb-3">Background Color</h3>
              <div className="flex flex-wrap gap-2">
                {['transparent', '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#facc15'].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setBgColor(c); setBgImage(null); }}
                    className={`w-8 h-8 rounded-full border-2 ${bgColor === c ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: c === 'transparent' ? 'gray' : c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Background Image</h3>
              <button
                onClick={() => bgInputRef.current?.click()}
                className="w-full py-2 bg-slate-700 rounded hover:bg-slate-600 text-sm"
              >
                Upload Background
              </button>
              <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button
                onClick={() => { setOriginalImage(null); setProcessedImage(null); }}
                className="w-full py-2 mb-2 bg-slate-600 rounded hover:bg-slate-500"
              >
                Start Over
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-2 bg-blue-600 rounded hover:bg-blue-500 font-bold"
              >
                Download Result
              </button>
            </div>
          </div>

          {/* Right: The Canvas (Preview) */}
          <div className="flex-1 flex justify-center bg-slate-800/50 rounded-xl p-8 border border-slate-700">

            {/* The Stacking Magic */}
            <div
              className="relative rounded-lg overflow-hidden shadow-2xl"
              style={{ maxHeight: '70vh' }}
            >
              {/* Layer 1: The Background (Color or Image) */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300"
                style={{
                  backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
                  backgroundImage: bgImage ? `url(${bgImage})` : bgColor === 'transparent' ? "url('https://res.cloudinary.com/dexdumfqy/image/upload/v1601664188/transparent-bg.jpg')" : 'none'
                }}
              />

              {/* Layer 2: The Processed Image */}
              <img
                src={processedImage}
                alt="Processed"
                className="relative z-10 max-h-[70vh] w-auto object-contain"
              />
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
