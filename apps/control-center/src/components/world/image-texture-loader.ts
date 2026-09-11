type ImageFactory = () => HTMLImageElement;

export async function loadDataUriImage(
  dataUri: string,
  createImage: ImageFactory = () => new Image(),
): Promise<HTMLImageElement> {
  const image = createImage();
  image.decoding = 'async';

  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to decode approved OC3 world artwork'));
  });

  image.src = dataUri;

  if (typeof image.decode === 'function') {
    try {
      await image.decode();
      return image;
    } catch {
      // Some browsers reject decode() for data URIs even though the normal
      // image load path succeeds. Fall through to the onload/onerror promise.
    }
  }

  await loaded;
  return image;
}
