import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// GitHub Pages(https://s73827-bit.github.io/popo_petsalon/)는 하위 경로에서 서빙되므로
// 빌드할 때만 base를 저장소 이름으로 둔다. 자체 도메인을 연결하면 base를 '/'로 바꾼다.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/popo_petsalon/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
      },
    },
  },
}));
