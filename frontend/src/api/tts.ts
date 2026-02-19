export const speakText = async (text: string): Promise<Blob> => {
  const formData = new FormData();
  formData.append('text', text);

  const response = await fetch('http://127.0.0.1:5000/tts', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS Error ${response.status}: ${error}`);
  }

  const blob = await response.blob();
  if (blob.size === 0) throw new Error('Empty audio received');
  return blob;
};