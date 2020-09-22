function base64ToFile(
  imageDataUrl: string,
  fileName: string = new Date().getTime().toString(),
  lastModified: number = new Date().getTime()
) {
  const byteString = atob(imageDataUrl.split(',')[1]);
  const mimeString = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], fileName, {
    type: mimeString,
    lastModified
  });
}

function fileToBase64(file: File | Blob): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export { base64ToFile, fileToBase64 };
