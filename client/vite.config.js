import { defineConfig } from "vite";
import path from 'path';

const dirs = [
    'components',
    'constants',
    'model'
];

export default defineConfig({
    build: {
        assetsDir: './',
        outDir: '../dist',
        emptyOutDir: '../dist'
    },
    resolve: {
        alias: dirs.map(
            dir => ({
                find: `./${dir}`,
                replacement: path.resolve(__dirname, `${dir}`)
            })
        )
    }
});