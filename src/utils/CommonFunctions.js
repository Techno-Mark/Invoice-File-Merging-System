exports.formattedDate = () => {
  const now = new Date();
  const formattedDate = now
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')
    .replace(/:/g, '-');

  return formattedDate;
};
