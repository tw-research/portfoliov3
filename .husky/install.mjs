// Production installs omit development dependencies, including Husky.
if (process.env.NODE_ENV !== "production" && process.env.CI !== "true") {
  const { default: husky } = await import("husky");
  husky();
}
