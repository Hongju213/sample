import testData from '../dev/testData.json';

let localItems = [...testData.sampleItems];

export async function fetchSampleItems(params = {}) {
  return getPage(localItems, params);
}

export async function fetchSampleItemById(id) {
  return localItems.find(item => item.id === Number(id)) ?? null;
}

export async function createSampleItem(payload) {
  const now = new Date().toISOString();
  const item = {
    id: Math.max(0, ...localItems.map(row => row.id)) + 1,
    ...payload,
    createdAt: now,
    updatedAt: now
  };

  localItems = [item, ...localItems];
  return item;
}

export async function updateSampleItem(id, payload) {
  const now = new Date().toISOString();

  localItems = localItems.map(item =>
    item.id === id ? { ...item, ...payload, updatedAt: now } : item
  );

  return localItems.find(item => item.id === id) ?? null;
}

export async function deleteSampleItem(id) {
  localItems = localItems.filter(item => item.id !== id);
}

export async function fetchCurrentUser() {
  return testData.currentUser;
}

// Keep this shape close to Spring Page so the screen state flow stays realistic.
function getPage(items, params = {}) {
  const page = params.page ?? 0;
  const size = params.size ?? 10;
  const keyword = params.keyword?.toLowerCase();
  const status = params.status;
  const filtered = items.filter(item => {
    const matchesKeyword = keyword
      ? item.title.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword)
      : true;
    const matchesStatus = status ? item.status === status : true;
    return matchesKeyword && matchesStatus;
  });
  const content = filtered.slice(page * size, page * size + size);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));

  return {
    content,
    totalElements: filtered.length,
    totalPages,
    size,
    number: page,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0
  };
}
