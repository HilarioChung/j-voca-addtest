import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'fs'

const buildTime = new Date().toISOString();

// 빌드 시 version.json을 생성하여 클라이언트에서 새 버전 감지에 사용
function versionFile() {
  return {
    name: 'version-file',
    writeBundle() {
      writeFileSync('dist/version.json', JSON.stringify({ build: buildTime }));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), versionFile()],
  base: '/j-voca-addtest/',
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
})
