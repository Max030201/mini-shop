export const getBasePath = () => {
  if (typeof window === 'undefined' || !window.location || !window.location.hostname) {
    return '';
  }
  
  return window.location.hostname === 'max030201.github.io' ? '/mini-shop' : '';
};

export const getImagePath = (imagePath) => {
  const basePath = getBasePath();
  
  if (!imagePath) {
    return `${basePath}/`;
  }
  
  const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${basePath}/${cleanImagePath}`;
};

export const getBackgroundImage = (imagePath) => {
  const imageUrl = getImagePath(imagePath);
  return `url(${imageUrl})`;
};