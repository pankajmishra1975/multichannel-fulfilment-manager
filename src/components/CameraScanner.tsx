import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length) {
          setCameras(devices);
          startScanner(devices[0].id);
        } else {
          setError("No cameras found on this device.");
        }
      })
      .catch(err => {
        setError("Error accessing camera. Please ensure permissions are granted.");
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = (cameraId: string) => {
    if (scannerRef.current) {
      stopScanner().then(() => start(cameraId));
    } else {
      start(cameraId);
    }
  };

  const start = (cameraId: string) => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;
    html5QrCode.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 150 }
      },
      (decodedText) => {
        if (decodedText) {
          // Play a slight beep? The scanner console does that anyway
          onScan(decodedText);
          onClose(); // Auto close on successful scan
        }
      },
      (errorMessage) => {
        // parse error, usually just means no QR found yet
      }
    ).then(() => {
      setIsScanning(true);
    }).catch(err => {
      setError("Failed to start scanner.");
    });
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch(e) {}
      scannerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <Camera className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-sm">Quick Camera Scan</h3>
          </div>
          <button title="Close camera" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-black relative">
          {error ? (
            <div className="text-rose-400 text-sm text-center py-10 font-medium">
              {error}
            </div>
          ) : (
            <div id="reader" className="w-full rounded overflow-hidden"></div>
          )}
          
          {isScanning && !error && (
            <div className="absolute top-8 left-0 right-0 text-center">
              <span className="bg-indigo-600/80 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Scanning...
              </span>
            </div>
          )}
        </div>
        
        {cameras.length > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Switch Camera:</span>
            {cameras.map(cam => (
              <button 
                key={cam.id}
                onClick={() => startScanner(cam.id)}
                className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] rounded hover:border-indigo-400 whitespace-nowrap"
              >
                {cam.label || 'Camera ' + cam.id.slice(0,4)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
