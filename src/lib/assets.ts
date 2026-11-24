// Đường dẫn gốc chứa toàn bộ hình ảnh và video từ kho lưu trữ công khai
export const ASSET_BASE =
  'https://raw.githubusercontent.com/amirmushichge/veyra-interactive-car/v1.0.0/public/media/';

export const MEDIA_URLS = {
  exterior: `${ASSET_BASE}exterior-polished.png`,
  hoodForward: `${ASSET_BASE}hood-hover-forward.mp4`,
  hoodReverse: `${ASSET_BASE}hood-hover-reverse.mp4`,
  batteryForward: `${ASSET_BASE}battery-hover-forward.mp4`,
  batteryReverse: `${ASSET_BASE}battery-hover-reverse.mp4`,
  driveDetail: `${ASSET_BASE}drive-blue.png`,
  batteryDetail: `${ASSET_BASE}battery-blue.png`,
  paintElectricGreen: `${ASSET_BASE}config/electric-green.png`,
  paintLimeGreen: `${ASSET_BASE}config/lime-green.png`,
  paintSkyBlue: `${ASSET_BASE}config/sky-blue.png`,
  paintGraphite: `${ASSET_BASE}config/graphite.png`,
  wheelsAero: `${ASSET_BASE}config/wheels-aero.png`,
  wheelsForged: `${ASSET_BASE}config/wheels-forged.png`,
} as const;

export const STAGE_ASPECT_WIDTH = 1672;
export const STAGE_ASPECT_HEIGHT = 941;

// Tải trước và giải mã ảnh để tránh nháy khung hình khi chuyển đổi ngoại thất hoặc chi tiết
export function loadAndDecodeImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
        resolve(img);
      } catch {
        // Vẫn trả về ảnh nếu trình duyệt đã tải xong nhưng decode() bị bỏ qua
        resolve(img);
      }
    };
    img.onerror = () => {
      reject(new Error(`Không tải được tài nguyên: ${url}`));
    };
    img.src = url;
  });
}
