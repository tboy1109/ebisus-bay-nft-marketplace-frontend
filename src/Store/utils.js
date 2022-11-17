export const initEntityState = (initialValue, loading = true) => ({
  loading,
  data: initialValue,
  loadFailed: false,
  canceler: null,
});

export const entityLoadingStarted = (state, canceler) => ({
  ...state,
  canceler,
  loading: true,
  loadFailed: false,
});

export const entityLoadingSucceeded = (state, data) => ({
  ...state,
  data,
  loading: false,
  loadFailed: false,
  canceler: null,
});

export const entityLoadingFailed = (state) => ({
  ...state,
  loading: false,
  loadFailed: true,
  canceler: null,
});

export const handleSelection = (selectedIds, selectId, singleSelect = false) => {
  const selected = new Set(selectedIds || []);

  if (singleSelect) return new Set([selectId]);

  if (selected.has(selectId)) {
    selected.delete(selectId);
  } else {
    selected.add(selectId);
  }

  return selected;
};

export const shuffleArray = (array) => {
  let shuffeled = array;

  for (let i = shuffeled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffeled[i], shuffeled[j]] = [shuffeled[j], shuffeled[i]];
  }

  return shuffeled;
};

export function dataURItoBlob(dataURI, type) {
  // convert base64 to raw binary data held in a string
  let byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  // let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  let bb = new Blob([ab], { type: type });
  return bb;
}
