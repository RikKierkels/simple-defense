export const generateId = () => {
  const id = () => {
    return Math.random()
      .toString(36)
      .substring(2, 15);
  };

  return id() + id();
};
