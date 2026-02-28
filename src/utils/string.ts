export const snakeConcat = (s1: string, s2: string) => {
  const normalize = (str: string) => str.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return `${normalize(s1)}_${normalize(s2)}`;
};
