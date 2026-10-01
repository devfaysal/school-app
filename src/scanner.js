import { Html5Qrcode } from 'html5-qrcode';

let scannerInstance = null;

export const scanner = {
  isScanning: false,

  async start(elementId, onScanSuccess, onScanError) {
    if (this.isScanning) {
      await this.stop();
    }

    try {
      scannerInstance = new Html5Qrcode(elementId);
      this.isScanning = true;

      const qrConfig = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrEdge = Math.floor(minEdge * 0.7);
          return { width: qrEdge, height: qrEdge };
        },
        aspectRatio: 1.0
      };

      await scannerInstance.start(
        { facingMode: 'environment' },
        qrConfig,
        (decodedText, decodedResult) => {
          if (navigator.vibrate) {
            try { navigator.vibrate([80, 40, 80]); } catch {}
          }
          if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
        },
        (error) => {
          if (onScanError) onScanError(error);
        }
      );
    } catch (err) {
      this.isScanning = false;
      scannerInstance = null;
      throw err;
    }
  },

  async stop() {
    if (scannerInstance && this.isScanning) {
      try {
        await scannerInstance.stop();
        scannerInstance.clear();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      } finally {
        this.isScanning = false;
        scannerInstance = null;
      }
    }
  }
};
