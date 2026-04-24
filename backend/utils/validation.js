const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

export const validateData = (data) => {
  const validEntries = [];
  const invalidEntries = [];

  for (const entry of data) {
    if (typeof entry !== 'string') {
      invalidEntries.push(String(entry));
      continue;
    }

    const trimmed = entry.trim();

    if (trimmed === '') {
      invalidEntries.push(entry);
      continue;
    }

    if (!EDGE_PATTERN.test(trimmed)) {
      invalidEntries.push(entry);
      continue;
    }

    const [parent, child] = trimmed.split('->');

    if (parent === child) {
      invalidEntries.push(entry);
      continue;
    }

    validEntries.push(trimmed);
  }

  return { validEntries, invalidEntries };
};
