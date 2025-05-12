import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import babel from "@rollup/plugin-babel";

export default {
  input: "src/cartogram.js",
  output: [
    {
      file: "dist/cartogram.umd.js",
      format: "umd",
      name: "Cartogram",
      sourcemap: true,
      globals: {
        d3: "d3",
      },
    },
    {
      file: "dist/cartogram.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  external: ["d3"],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-env"],
    }),
    terser(),
  ],
};
