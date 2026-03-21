import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync } from 'fs'

// 빌드 시 sw.js에 타임스탬프를 주입하여 매 배포마다 SW 업데이트를 트리거
function swTimestamp() {
  return {
    name: 'sw-timestamp',
    writeBundle() {
      const path = 'dist/sw.js';
      const content = readFileSync(path, 'utf-8');
      writeFileSync(path, `// build: ${new Date().toISOString()}\n${content}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), swTimestamp()],
  base: '/j-voca/',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
