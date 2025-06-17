export const getEllipsisTxt = (str: string, n: number = 6): string => {
  if (str) {
    return `${str.substr(0, n)}...${str.substr(str.length - n, str.length)}`;
  }
  return "";
};
