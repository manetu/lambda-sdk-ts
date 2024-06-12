import nodeResolve from "@rollup/plugin-node-resolve";

export default {
    plugins: [
        nodeResolve(), // <-- this allows npm modules to be added to bundle
    ],
};
