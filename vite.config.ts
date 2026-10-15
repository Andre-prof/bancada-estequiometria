import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'./',plugins:[react()],build:{outDir:'docs',emptyOutDir:true},server:{host:'127.0.0.1',port:5174,fs:{allow:['.','../bancada/node_modules']}}});
