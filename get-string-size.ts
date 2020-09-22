function getStringByteSize(str: string) {
  return new Blob([str]).size;
}

export { getStringByteSize };
