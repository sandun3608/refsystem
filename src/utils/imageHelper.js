/**
 * Utility to compress images before storing in localStorage or sending to backend.
 * Keeps file sizes tiny (~20-40KB instead of 2-10MB), preventing QuotaExceededError.
 */
export const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.7) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(e.target.result); // fallback to raw string if image fails to decode
      };
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};
