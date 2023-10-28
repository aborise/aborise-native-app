export const filterHeaders = (headers: Record<string, string>, omit: string[] = []) => {
  const filteredHeaders = { ...headers };
  omit.forEach((key) => {
    delete filteredHeaders[key];
  });
  return filteredHeaders;
};
