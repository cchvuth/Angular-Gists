function getSemiRandomStr() {
  return String(Math.floor(Math.random() * Math.floor(Math.random() * Date.now())));
}

export { getSemiRandomStr };
