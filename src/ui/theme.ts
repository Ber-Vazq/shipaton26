export const COLORS = {
  bg: "#0A0A0A",
  accent: "#33FF66", // phosphor green — change to '#FFB000' for amber if you prefer
  dim: "#1A1A1A", // slightly lighter black for cards/boxes
  muted: "#3A3A3A", // inactive text, dividers
  text: "#CCCCCC", // body text
  textBright: "#FFFFFF",
  danger: "#FF5C5C",
};

export const FONT = {
  mono: "JetBrainsMono",
  monoBold: "JetBrainsMonoBold",
  size: {
    sm: 12,
    md: 14,
    lg: 18,
    xl: 32,
    timer: 64, // the big countdown digits
  },
};

export const TERMINAL = {
  // ASCII-style bracket markers for list items
  marker: (n: number) => `[${n}]`,
  checkbox: (done: boolean) => (done ? "[x]" : "[ ]"),
  prompt: "> ",
  cursor: "_",
};
