export const APT_DECIMALS = 8;

export const convertAmountFromHumanReadableToOnChain = (value: number, decimal: number) => {
  return value * Math.pow(10, decimal);
};

export const convertAmountFromOnChainToHumanReadable = (value: number, decimal: number) => {
  return value / Math.pow(10, decimal);
};

export function truncateAddress(address: string) {
  return `${address?.slice(0, 4)}...${address?.slice(-4)}`;
}

function stripAddress(address: string) {
  return address.replace(/^0x0*/, "");
}

export function compareAddress(a: string, b: string) {
  return stripAddress(a) === stripAddress(b);
}

