// Hero art helper. Inside a <Canvas>, u(14) means "14 design pixels",
// scaled to the width the canvas actually has on screen.
export const u = (n: number) => `calc(var(--u) * ${n})`;
