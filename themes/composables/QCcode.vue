<template>
  <canvas ref="qrCanvas"></canvas>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import QCode from 'qrcode-generator';

const props = defineProps<{
  value: string;
  size: number;
}>();

const qrCanvas = ref<HTMLCanvasElement | null>(null);

const generateQRCode = () => {
  if (!props.value || !qrCanvas.value) return;
  const qr = QCode(0, 'H');
  qr.addData(props.value);
  qr.make();

  const canvas = qrCanvas.value;
  const context = canvas.getContext('2d');
  canvas.width = props.size;
  canvas.height = props.size;

  const tiles = qr.getModuleCount();
  const tileSize = props.size / tiles;

  for (let row = 0; row < tiles; row++) {
    for (let col = 0; col < tiles; col++) {
      context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
      context.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }
};

// 监听 value 的变化，生成新的二维码
watch(() => props.value, generateQRCode, { immediate: true });

// 确保在挂载后生成二维码
onMounted(() => {
  generateQRCode();
});
</script>
