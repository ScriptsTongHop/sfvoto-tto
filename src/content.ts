import { MEDIA_URLS } from './lib/assets';
import type { AppearanceCategory, DetailId, ProjectInfoShape } from './lib/sceneMachine';

export const projectInfo: ProjectInfoShape = {
  name: 'Cấu tạo ô tô điện',
  author: 'Chí Hiếu',
  authorRole: 'Tác giả, thiết kế và thực hiện dự án',
  school: '',
  className: '',
  teacher: '',
  year: '2026',
  version: '1.0',
  purpose:
    'Dự án học tập giới thiệu cấu tạo và nguyên lý hoạt động cơ bản của ô tô điện.',
  mediaCredit:
    'Hình ảnh và video: kho lưu trữ veyra-interactive-car (tác giả amirmushichge, GitHub), bản v1.0.0. Giữ nguyên giấy phép và ghi nguồn theo kho lưu trữ gốc.',
  fontCredit:
    'Phông chữ: Space Grotesk (thiết kế bởi Florian Karsten), giấy phép SIL Open Font License 1.1, cung cấp qua Google Fonts.',
  techCredit: 'Công nghệ: React, Vite, TypeScript.',
  toolsCredit:
    'Công cụ hỗ trợ: Google AI Studio (dựng giao diện) và Claude của Anthropic (hỗ trợ soạn nội dung và câu lệnh).',
  references: [],
  disclaimer:
    'Nội dung mang tính giáo dục, trình bày ở mức khái niệm. Hình ảnh chỉ minh họa, không phải sơ đồ kỹ thuật của một mẫu xe cụ thể.',
  copyrightNote:
    'Mã nguồn và nội dung chữ của dự án thuộc về tác giả. Hình ảnh và video thuộc về tác giả gốc theo giấy phép của kho lưu trữ.',
};

export const siteContent = {
  header: {
    wordmark: 'Ô TÔ ĐIỆN',
    projectTag: 'Dự án cấu tạo',
    studyLabel: 'Dự án học tập',
    aboutButton: 'Giới thiệu và ghi công',
    aboutAriaLabel: 'Mở hộp thoại giới thiệu và ghi công dự án',
  },
  hero: {
    title: 'Ô tô điện, nhìn từ bên trong.',
    subtitlePrimary: 'Khám phá cấu tạo bên dưới lớp vỏ.',
    subtitleSecondary: 'Chọn một điểm để bắt đầu.',
    caption:
      'Hình ảnh mang tính minh họa, không phải sơ đồ kỹ thuật của một mẫu xe cụ thể.',
  },
  stage: {
    overviewImageAlt:
      'Hình ảnh minh họa ngoại thất ô tô điện ở góc nhìn ba phần tư phía trước',
    mediaError: 'Không tải được hình ảnh. Vui lòng thử lại.',
    retryButton: 'Thử lại',
    loadingText: 'Đang tải hình ảnh xe...',
    ariaLiveOverview: 'Đang ở góc nhìn tổng quan ô tô điện.',
    ariaLiveEnteringDrive: 'Đang mở màn hình chi tiết hệ truyền động điện.',
    ariaLiveEnteringBattery: 'Đang mở màn hình chi tiết pin cao áp.',
    ariaLiveDetailDrive: 'Đã vào màn hình chi tiết hệ truyền động điện.',
    ariaLiveDetailBattery: 'Đã vào màn hình chi tiết pin cao áp.',
    ariaLiveReturning: 'Đang quay lại góc nhìn tổng quan.',
    ariaLivePaintOpened: 'Đã mở bảng chọn màu sơn thân xe.',
    ariaLiveWheelsOpened: 'Đã mở bảng chọn mâm xe.',
    ariaLiveAppearanceClosed: 'Đã đóng bảng chọn ngoại thất và khôi phục xe gốc.',
  },
  footer: {
    items: [
      {
        id: 'drive',
        title: 'Truyền động điện',
        summary: 'Động cơ, biến tần và hộp giảm tốc đưa lực kéo xuống bánh xe.',
      },
      {
        id: 'battery',
        title: 'Pin cao áp',
        summary: 'Cụm pin lithium-ion lưu trữ năng lượng, được BMS giám sát.',
      },
      {
        id: 'charging',
        title: 'Sạc và phụ trợ',
        summary: 'Bộ sạc, cổng sạc và bộ đổi điện DC-DC cấp điện cho xe.',
      },
      {
        id: 'regen',
        title: 'Phanh tái sinh',
        summary:
          'Động cơ đóng vai máy phát để thu hồi một phần năng lượng khi giảm tốc.',
      },
    ],
    barBrand: 'Ô tô điện — Dự án học tập',
    sceneNotes: {
      overview: 'Góc nhìn tổng quan ngoại thất và bốn điểm khám phá tương tác.',
      drive: 'Màn hình chi tiết hệ truyền động điện từ biến tần đến bánh xe.',
      battery: 'Màn hình chi tiết cụm pin cao áp, làm mát và hệ thống sạc.',
    },
  },
  credits: {
    text: 'Dự án thực hiện bởi Chí Hiếu · Hình ảnh và video: veyra-interactive-car (amirmushichge, GitHub)',
    buttonLabel: 'Giới thiệu và ghi công',
  },
  aboutDialog: {
    title: 'Giới thiệu và ghi công',
    closeLabel: 'Đóng',
    closeAriaLabel: 'Đóng hộp thoại giới thiệu và ghi công',
    sections: {
      about: 'Về dự án',
      author: 'Thực hiện bởi',
      media: 'Hình ảnh và video',
      font: 'Phông chữ',
      techAndTools: 'Công nghệ và công cụ',
      references: 'Nguồn tham khảo kiến thức',
      disclaimer: 'Lưu ý',
      copyright: 'Bản quyền',
    },
  },
} as const;

export interface HotspotConfig {
  id: 'drive' | 'battery' | 'paint' | 'wheels';
  label: string;
  ariaLabel: string;
  x: number; // Phần trăm theo chiều ngang mặt phẳng ảnh
  y: number; // Phần trăm theo chiều dọc mặt phẳng ảnh
  kind: 'detail' | 'appearance';
  detailId?: DetailId;
  appearanceCategory?: AppearanceCategory;
}

export const hotspotsConfig: readonly HotspotConfig[] = [
  {
    id: 'drive',
    label: 'Động cơ và truyền động',
    ariaLabel: 'Xem động cơ và truyền động',
    x: 25,
    y: 48,
    kind: 'detail',
    detailId: 'drive',
  },
  {
    id: 'battery',
    label: 'Pin cao áp',
    ariaLabel: 'Xem pin cao áp',
    x: 64,
    y: 72,
    kind: 'detail',
    detailId: 'battery',
  },
  {
    id: 'paint',
    label: 'Màu sơn',
    ariaLabel: 'Mở lựa chọn màu sơn thân xe',
    x: 55,
    y: 51,
    kind: 'appearance',
    appearanceCategory: 'paint',
  },
  {
    id: 'wheels',
    label: 'Mâm xe',
    ariaLabel: 'Mở lựa chọn mâm xe',
    x: 48,
    y: 71,
    kind: 'appearance',
    appearanceCategory: 'wheels',
  },
];

export interface AppearanceOption {
  id: string;
  label: string;
  url: string;
  swatchColor?: string;
}

export interface AppearanceCategoryConfig {
  id: AppearanceCategory;
  title: string;
  hint: string;
  closeLabel: string;
  options: readonly AppearanceOption[];
}

export const appearanceMenus: Record<AppearanceCategory, AppearanceCategoryConfig> = {
  paint: {
    id: 'paint',
    title: 'Màu sơn thân xe',
    hint: 'Chọn một màu để quan sát ngoại thất. Đóng bảng để quay lại xe gốc.',
    closeLabel: 'Đóng bảng màu sơn',
    options: [
      {
        id: 'studio-silver',
        label: 'Bạc studio',
        url: MEDIA_URLS.exterior,
        swatchColor: '#b7c2cc',
      },
      {
        id: 'electric-green',
        label: 'Xanh điện',
        url: MEDIA_URLS.paintElectricGreen,
        swatchColor: '#81c742',
      },
      {
        id: 'lime-green',
        label: 'Xanh chanh',
        url: MEDIA_URLS.paintLimeGreen,
        swatchColor: '#c2de3e',
      },
      {
        id: 'sky-blue',
        label: 'Xanh da trời',
        url: MEDIA_URLS.paintSkyBlue,
        swatchColor: '#5da6d8',
      },
      {
        id: 'graphite',
        label: 'Xám than',
        url: MEDIA_URLS.paintGraphite,
        swatchColor: '#3f474e',
      },
    ],
  },
  wheels: {
    id: 'wheels',
    title: 'Kiểu mâm xe',
    hint: 'Chọn một mẫu mâm để quan sát tỉ lệ bánh xe. Đóng bảng để quay lại xe gốc.',
    closeLabel: 'Đóng bảng mâm xe',
    options: [
      {
        id: 'multi-spoke',
        label: 'Nhiều chấu',
        url: MEDIA_URLS.exterior,
      },
      {
        id: 'aero-disc',
        label: 'Đĩa khí động học',
        url: MEDIA_URLS.wheelsAero,
      },
      {
        id: 'forged-sport',
        label: 'Rèn thể thao',
        url: MEDIA_URLS.wheelsForged,
      },
    ],
  },
};

export interface DetailPartConfig {
  id: string;
  numberLabel: string;
  name: string;
  summary: string;
  x: number; // Phần trăm trên ảnh chi tiết
  y: number;
}

export interface AuxiliaryCardConfig {
  id: string;
  title: string;
  description: string;
}

export interface DetailScreenConfig {
  id: DetailId;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  backLabel: string;
  didYouKnowTitle: string;
  didYouKnowText: string;
  quiz: {
    openLabel: string;
    closeLabel: string;
    question: string;
    answer: string;
  };
  parts: readonly DetailPartConfig[];
  auxiliarySection?: {
    title: string;
    cards: readonly AuxiliaryCardConfig[];
  };
}

export const detailScreens: Record<DetailId, DetailScreenConfig> = {
  drive: {
    id: 'drive',
    title: 'Hệ truyền động điện',
    description: 'Chuyển điện năng từ pin thành chuyển động của bánh xe.',
    imageUrl: MEDIA_URLS.driveDetail,
    imageAlt:
      'Hình ảnh minh họa mặt cắt hệ truyền động điện gồm động cơ điện, biến tần và hộp giảm tốc',
    backLabel: 'Quay lại',
    didYouKnowTitle: 'Bạn có biết?',
    didYouKnowText:
      'Khi nhả ga hoặc đạp phanh nhẹ, động cơ có thể đổi vai thành máy phát để nạp lại một phần năng lượng cho pin (phanh tái sinh).',
    quiz: {
      openLabel: 'Câu hỏi nhanh',
      closeLabel: 'Ẩn đáp án',
      question: 'Vì sao xe điện thường chỉ cần hộp giảm tốc một cấp?',
      answer:
        'Động cơ điện cho mô-men lớn ngay từ tốc độ thấp và hoạt động hiệu quả trong dải tốc độ quay rộng, nên không cần nhiều cấp số.',
    },
    parts: [
      {
        id: 'motor',
        numberLabel: '1',
        name: 'Động cơ điện (Electric motor)',
        summary:
          'Biến điện năng thành cơ năng. Gồm stator (cuộn dây đứng yên tạo từ trường quay) và rotor (phần quay, truyền mô-men xoắn). Người lái cảm nhận xe êm và chân ga phản hồi gần như tức thì.',
        x: 33,
        y: 52,
      },
      {
        id: 'inverter',
        numberLabel: '2',
        name: 'Biến tần (Inverter)',
        summary:
          'Pin cấp điện một chiều (DC) còn động cơ ba pha dùng điện xoay chiều (AC). Biến tần đổi DC thành AC và điều chỉnh tần số, điện áp để điều khiển tốc độ và mô-men của động cơ.',
        x: 42,
        y: 34,
      },
      {
        id: 'reduction-gear',
        numberLabel: '3',
        name: 'Hộp giảm tốc (Reduction gear)',
        summary:
          'Động cơ quay rất nhanh; cặp bánh răng giảm tốc độ quay và tăng mô-men truyền đến bánh xe. Hầu hết xe điện chỉ cần hộp giảm tốc một cấp, không cần ly hợp và hộp số nhiều cấp như xe xăng.',
        x: 50,
        y: 57,
      },
    ],
  },
  battery: {
    id: 'battery',
    title: 'Pin cao áp',
    description: 'Nơi lưu trữ năng lượng cho toàn bộ xe, thường đặt dưới sàn.',
    imageUrl: MEDIA_URLS.batteryDetail,
    imageAlt:
      'Hình ảnh minh họa cụm pin cao áp đặt dưới sàn xe cùng hệ thống quản lý và làm mát pin',
    backLabel: 'Quay lại',
    didYouKnowTitle: 'Bạn có biết?',
    didYouKnowText:
      'Pin điện áp cao là bộ phận đắt và nặng nhất của xe điện, nên cách bố trí và bảo vệ pin ảnh hưởng lớn đến an toàn và độ ổn định.',
    quiz: {
      openLabel: 'Câu hỏi nhanh',
      closeLabel: 'Ẩn đáp án',
      question: 'BMS có nhiệm vụ chính là gì?',
      answer:
        'Giám sát và bảo vệ pin: theo dõi điện áp, dòng điện, nhiệt độ và cân bằng các cell.',
    },
    parts: [
      {
        id: 'battery-pack',
        numberLabel: '1',
        name: 'Cụm pin (Battery pack)',
        summary:
          'Nhiều cell lithium-ion ghép thành module, nhiều module ghép thành pack điện áp cao. Đặt dưới sàn giúp hạ thấp trọng tâm và xe ổn định hơn.',
        x: 49,
        y: 38,
      },
      {
        id: 'bms',
        numberLabel: '2',
        name: 'Hệ thống quản lý pin BMS (Battery Management System)',
        summary:
          'Giám sát điện áp, dòng điện và nhiệt độ của các nhóm cell, cân bằng các cell và bảo vệ pin khỏi sạc quá mức hoặc xả quá sâu.',
        x: 32,
        y: 50,
      },
      {
        id: 'thermal-management',
        numberLabel: '3',
        name: 'Làm mát pin (Thermal management)',
        summary:
          'Pin làm việc tốt trong một khoảng nhiệt độ nhất định; hệ thống làm mát (thường bằng chất lỏng) giữ nhiệt độ ổn định khi chạy và khi sạc.',
        x: 43,
        y: 53,
      },
    ],
    auxiliarySection: {
      title: 'Sạc và phụ trợ',
      cards: [
        {
          id: 'charging-port',
          title: 'Cổng sạc',
          description: 'Nơi nối xe với nguồn điện.',
        },
        {
          id: 'obc',
          title: 'Bộ sạc trên xe OBC (On-Board Charger)',
          description:
            'Đổi điện xoay chiều AC từ ổ sạc thành điện một chiều DC để nạp pin. Sạc nhanh DC cấp điện một chiều trực tiếp nên không cần qua OBC.',
        },
        {
          id: 'dc-dc',
          title: 'Bộ đổi điện DC-DC',
          description:
            'Hạ điện áp cao của pin xuống 12V để cấp cho đèn, màn hình và hệ thống điều khiển.',
        },
      ],
    },
  },
};

export interface EnergyNodeConfig {
  id: string;
  label: string;
  highlightIn: readonly DetailId[];
}

export const energyFlowConfig = {
  title: 'Dòng năng lượng',
  regenLabel: 'Phanh tái sinh',
  ariaDescriptions: {
    drive:
      'Sơ đồ dòng năng lượng: Trạm sạc, Cổng sạc, OBC, Pin cao áp, làm nổi bật đoạn Biến tần, Động cơ, Hộp giảm tốc dẫn tới Bánh xe, kèm mũi tên ngược Phanh tái sinh từ Bánh xe về Pin cao áp.',
    battery:
      'Sơ đồ dòng năng lượng: Trạm sạc, làm nổi bật đoạn Cổng sạc, OBC, Pin cao áp, tiếp tới Biến tần, Động cơ, Hộp giảm tốc, Bánh xe, kèm mũi tên ngược Phanh tái sinh từ Bánh xe về Pin cao áp.',
  } as Record<DetailId, string>,
  nodes: [
    { id: 'station', label: 'Trạm sạc', highlightIn: [] },
    { id: 'port', label: 'Cổng sạc', highlightIn: ['battery'] },
    { id: 'obc', label: 'OBC', highlightIn: ['battery'] },
    { id: 'battery', label: 'Pin cao áp', highlightIn: ['battery'] },
    { id: 'inverter', label: 'Biến tần', highlightIn: ['drive'] },
    { id: 'motor', label: 'Động cơ', highlightIn: ['drive'] },
    { id: 'gear', label: 'Hộp giảm tốc', highlightIn: ['drive'] },
    { id: 'wheels', label: 'Bánh xe', highlightIn: [] },
  ] as readonly EnergyNodeConfig[],
};
