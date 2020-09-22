import { ArrayChanges } from '../models/array-changes';
import { deepCopy } from './deep-copy';
function filterArrNoValue(arr: Array<any>) {
  return arr.filter((item) => {
    const stringified = JSON.stringify(item);
    return item != null && item !== '' && item.value !== '' && item.name !== '' && stringified !== '{}';
  });
}
function groupArrayChanges(originalArr: Array<any>, updatedArr: Array<any>): ArrayChanges {
  const result: ArrayChanges = JSON.parse('{"update": [], "insert": [], "delete": []}');
  // Remove unchanged
  const { original, updated } = simplifyArrayChanges(deepCopy(originalArr || []), deepCopy(updatedArr) || []);

  // Nothing to update
  if (original.length === 0 && updated.length === 0) return undefined;

  // Get reusable ids to inject them later
  const reservedIds: Array<number> = original.map((item) => item.id);

  // Filter empty
  const updatedFiltered = filterArrNoValue(updated);

  // Group
  if (original.length < updatedFiltered.length) {
    const excess = updatedFiltered.length - original.length;
    result.insert.push(...updatedFiltered.splice(-1 * excess, excess).map((item) => (item = { ...item, id: undefined })));
    delete result.delete;
  } else if (original.length > updatedFiltered.length) {
    const lack = original.length - updatedFiltered.length;
    result.delete.push(...original.splice(-1 * lack, lack).map((item) => (item = { id: reservedIds.pop() })));
    delete result.insert;
  } else {
    delete result.insert;
    delete result.delete;
  }

  result.update.push(
    ...updatedFiltered.map((item) => {
      item.id = reservedIds.shift();
      return item;
    })
  );

  if (result.update.length === 0) delete result.update;
  return JSON.stringify(result) !== '{}' ? result : undefined;
}

function simplifyArrayChanges(originalArr: Array<any>, updatedArr: Array<any>) {
  const sameMap = [];

  // Check and mark dirty
  for (let i = 0; i < updatedArr.length; i++) {
    if (!originalArr[i]) break;
    else if (JSON.stringify(updatedArr[i]) === JSON.stringify(originalArr[i])) {
      sameMap[i] = true;
    }
  }

  // Removing unchanged items
  while (sameMap.length > 0) {
    const index = sameMap.length - 1;
    if (sameMap.pop()) {
      originalArr.splice(index, 1);
      updatedArr.splice(index, 1);
    }
  }

  // Return changed items
  return {
    original: originalArr,
    updated: updatedArr
  };
}

export { filterArrNoValue, groupArrayChanges, simplifyArrayChanges };
