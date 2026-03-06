// ─── API product shape (returned by GET /products) ──────────────────────────

export interface ApiProduct {
  _id:            string;
  slug:           string;
  nameVi:         string;
  nameEn:         string;
  price:          number;
  originalPrice?: number;
  tag?:           string;
  gradient?:      string;
  imageUrl?:      string;
  petals:         number;
}

export interface ApiSpec { label: string; value: string }

export interface ApiProductDetail extends ApiProduct {
  stock:         number;
  isActive:      boolean;
  descriptionVi: string[];
  descriptionEn: string[];
  specs:         ApiSpec[];
}

// ─── Minimal cart product (used by cart context & drawer) ────────────────────

export interface CartProduct {
  id:        string;
  nameVi:    string;
  nameEn:    string;
  price:     number;
  gradient?: string;
  imageUrl?: string;
  petals:    number;
}

// ─── Shared product catalogue ──────────────────────────────────────────────
// Single source of truth for product data used across homepage ShopSection,
// /shop listing page, and /shop/[id] detail pages.

export interface Spec    { label: string; value: string }
export interface Product {
  id:             string;
  nameVi:         string;
  nameEn:         string;
  price:          number;
  originalPrice?: number;
  tag?:           "New" | "Bestseller" | "Seasonal" | "Exclusive" | "Limited";
  gradient:       string;
  descriptionEn:  string[];
  descriptionVi:  string[];
  specs:          Spec[];
  petals:         number;
}

export const PRODUCTS: Product[] = [
  {
    id: "night-rose",
    nameVi: "Đêm Hoa Hồng",
    nameEn: "Night Rose Lamp",
    price: 890_000,
    tag: "Bestseller",
    gradient: "radial-gradient(ellipse at 50% 35%, #fff0f5 0%, #fce4ec 18%, #f9a8d4 38%, #ec4899 62%, #be185d 82%, #4a0d28 100%)",
    descriptionEn: [
      "The Night Rose is our most beloved creation — a single preserved garden rose encased in hand-blown glass, its petals catching warm golden light to cast rose-tinted shadows across any room.",
      "Each lamp is unique. No two roses bloom the same way, and no two lamps tell the same story. Yours arrives in a signature Hanami box with a handwritten note.",
      "Ideal as a wedding centerpiece, bedside companion, or timeless anniversary gift.",
    ],
    descriptionVi: [
      "Đêm Hoa Hồng là tác phẩm được yêu thích nhất của chúng tôi — một bông hoa hồng vườn được bảo quản nguyên vẹn, đặt trong bình thủy tinh thổi bằng tay, những cánh hoa phản chiếu ánh sáng vàng ấm áp, tạo ra những bóng hồng lãng mạn khắp căn phòng.",
      "Mỗi chiếc đèn đều độc nhất vô nhị. Không có hai bông hoa nào nở giống nhau, và không có hai chiếc đèn nào kể cùng một câu chuyện. Sản phẩm của bạn sẽ được giao trong hộp Hanami đặc trưng kèm tấm thiệp viết tay.",
      "Lý tưởng làm trung tâm bàn tiệc cưới, người bạn đồng hành bên đầu giường, hay món quà kỷ niệm bất biến.",
    ],
    specs: [
      { label: "Height",      value: "24 cm" },
      { label: "Diameter",    value: "14 cm" },
      { label: "Material",    value: "Preserved rose · hand-blown glass · brass base" },
      { label: "Light",       value: "Warm white LED, USB-C rechargeable, 10h life" },
      { label: "Colour temp", value: "2700K" },
    ],
    petals: 8,
  },
  {
    id: "cherry-eternal",
    nameVi: "Anh Đào Vĩnh Cửu",
    nameEn: "Eternal Cherry",
    price: 1_200_000,
    originalPrice: 1_400_000,
    tag: "Seasonal",
    gradient: "radial-gradient(circle at 40% 28%, #fff9c4 0%, #fce4ec 22%, #f48fb1 48%, #c2185b 73%, #4a0d28 100%)",
    descriptionEn: [
      "Inspired by fleeting cherry blossoms at peak bloom, Eternal Cherry captures twelve individually preserved sakura blossoms in a wide-mouth lantern that glows like a full moon.",
      "Petals are arranged by hand over three sessions, ensuring perfect layering before the glass is sealed. No two arrangements are identical.",
      "A beloved choice for outdoor garden ceremonies and rustic-chic receptions.",
    ],
    descriptionVi: [
      "Lấy cảm hứng từ những cánh hoa anh đào thoáng qua khi đua nở, Anh Đào Vĩnh Cửu giam giữ mười hai bông hoa sakura được bảo quản riêng lẻ trong chiếc đèn lồng miệng rộng tỏa sáng như trăng rằm.",
      "Các cánh hoa được xếp bằng tay qua ba buổi, đảm bảo sự chồng lớp hoàn hảo trước khi đóng kính. Không có hai bộ sắp xếp nào giống nhau.",
      "Lựa chọn yêu thích cho các buổi lễ ngoài vườn và tiệc cưới phong cách đồng quê.",
    ],
    specs: [
      { label: "Height",      value: "28 cm" },
      { label: "Diameter",    value: "18 cm" },
      { label: "Material",    value: "Preserved sakura · recycled glass · iron stand" },
      { label: "Light",       value: "Warm amber LED, battery AA×3, 12h life" },
      { label: "Colour temp", value: "2400K" },
    ],
    petals: 12,
  },
  {
    id: "sunset-peony",
    nameVi: "Mẫu Đơn Hoàng Hôn",
    nameEn: "Sunset Peony",
    price: 1_450_000,
    tag: "New",
    gradient: "radial-gradient(ellipse at 55% 42%, #ffe0b2 0%, #fce4ec 22%, #f48fb1 46%, #e91e8c 66%, #880e4f 85%, #3d0b22 100%)",
    descriptionEn: [
      "Three full-bloom peonies preserved at peak beauty. The Sunset Peony radiates warmth — a gradient of amber, blush, and deep rose that mirrors golden-hour light perfectly.",
      "Its generous form makes it a natural statement piece for bridal tables, mantelpieces, or entrance halls.",
      "Available in our signature soft-touch packaging with a luxury ribbon tie.",
    ],
    descriptionVi: [
      "Ba bông mẫu đơn nở rộ được bảo quản ở vẻ đẹp đỉnh cao. Mẫu Đơn Hoàng Hôn tỏa ra hơi ấm — một dải màu hổ phách, hồng phấn và đỏ hoa hồng đậm phản chiếu hoàn hảo ánh sáng giờ vàng.",
      "Dáng vẻ rộng rãi của nó khiến nó trở thành điểm nhấn tự nhiên cho bàn cô dâu, lò sưởi, hay sảnh vào.",
      "Có sẵn trong bao bì mềm mại đặc trưng của chúng tôi với dải ruy băng cao cấp.",
    ],
    specs: [
      { label: "Height",      value: "32 cm" },
      { label: "Diameter",    value: "20 cm" },
      { label: "Material",    value: "Preserved peonies · borosilicate glass · matte gold base" },
      { label: "Light",       value: "Dual-tone LED (warm/cool), USB-C, 8h life" },
      { label: "Colour temp", value: "2700–4000K adjustable" },
    ],
    petals: 10,
  },
  {
    id: "moonlit-magnolia",
    nameVi: "Mộc Lan Trăng Sáng",
    nameEn: "Moonlit Magnolia",
    price: 980_000,
    gradient: "linear-gradient(155deg, #fffde7 0%, #fce4ec 32%, #f9a8d4 60%, #ec4899 80%, #be185d 100%)",
    descriptionEn: [
      "Three magnolia blooms hover within frosted glass, their ivory petals edged in the softest blush. When lit, the Moonlit Magnolia casts a diffused, dreamlike glow — like moonlight through curtain lace.",
      "The frosted glass finish is our most subtle option, perfect for minimalist or Japandi-styled interiors.",
      "A quiet luxury for those who prefer whispered beauty over bold statement.",
    ],
    descriptionVi: [
      "Ba bông mộc lan lơ lửng trong bình thủy tinh mờ, những cánh hoa ngà trắng viền hồng phấn nhẹ nhàng. Khi thắp sáng, Mộc Lan Trăng Sáng tỏa ra ánh hào quang lan tỏa như mơ — như ánh trăng xuyên qua rèm ren.",
      "Lớp hoàn thiện thủy tinh mờ là lựa chọn tinh tế nhất của chúng tôi, hoàn hảo cho nội thất tối giản hoặc phong cách Japandi.",
      "Vẻ sang trọng thầm lặng cho những ai thích vẻ đẹp thì thầm hơn những tuyên bố táo bạo.",
    ],
    specs: [
      { label: "Height",      value: "26 cm" },
      { label: "Diameter",    value: "15 cm" },
      { label: "Material",    value: "Preserved magnolia · frosted glass · silver-tone base" },
      { label: "Light",       value: "Neutral white LED, USB-C rechargeable, 9h life" },
      { label: "Colour temp", value: "3000K" },
    ],
    petals: 6,
  },
  {
    id: "night-dahlia",
    nameVi: "Thược Dược Đêm",
    nameEn: "Night Dahlia",
    price: 1_350_000,
    tag: "Exclusive",
    gradient: "radial-gradient(circle at 50% 48%, #fdf0f5 0%, #f9a8d4 28%, #e91e8c 52%, #880e4f 72%, #160712 100%)",
    descriptionEn: [
      "The Night Dahlia is our most dramatic lamp — a single prize dahlia bloom suspended in deep smoked glass. By day it appears as shadowed petals; by night it blazes like a pink star.",
      "Made in a limited run of 30 per month. Each is numbered and signed by its artisan.",
      "For the couple who wants their centerpiece to be truly unforgettable.",
    ],
    descriptionVi: [
      "Thược Dược Đêm là chiếc đèn ấn tượng nhất của chúng tôi — một bông thược dược giải thưởng được treo trong bình thủy tinh hun khói đậm. Ban ngày trông như những cánh hoa bóng tối; ban đêm bùng cháy như ngôi sao hồng.",
      "Được sản xuất với số lượng giới hạn 30 chiếc mỗi tháng. Mỗi chiếc đều được đánh số và ký tên bởi nghệ nhân của nó.",
      "Dành cho cặp đôi muốn vật trang trí trung tâm của họ thực sự không thể quên.",
    ],
    specs: [
      { label: "Height",      value: "30 cm" },
      { label: "Diameter",    value: "16 cm" },
      { label: "Material",    value: "Preserved dahlia · smoked borosilicate glass · blackened brass" },
      { label: "Light",       value: "Deep warm LED, wireless charging, 7h life" },
      { label: "Colour temp", value: "2200K" },
    ],
    petals: 9,
  },
  {
    id: "pink-lotus",
    nameVi: "Hoa Sen Hồng",
    nameEn: "Pink Lotus",
    price: 1_650_000,
    tag: "Limited",
    gradient: "radial-gradient(ellipse at 50% 58%, #fce4ec 0%, #f9a8d4 25%, #e91e8c 50%, #880e4f 75%, #2d0a1f 100%)",
    descriptionEn: [
      "The Pink Lotus floats in a wide shallow vessel filled with crystal resin that mimics still water. The lotus — symbol of purity and love — rises from light beneath, turning your table into a reflective garden pond.",
      "Requiring over 14 hours of work to complete, the resin base is custom-poured around your chosen lotus.",
      "An heirloom piece, designed to be passed between generations.",
    ],
    descriptionVi: [
      "Hoa Sen Hồng nổi trên chiếc chậu rộng nông chứa đầy nhựa pha lê mô phỏng mặt nước tĩnh lặng. Bông sen — biểu tượng của sự trong sáng và tình yêu — nở rộ trong ánh sáng bên dưới, biến bàn của bạn thành hồ sen phản chiếu.",
      "Cần hơn 14 giờ làm việc để hoàn thành, đế nhựa được đổ tùy chỉnh quanh bông sen bạn chọn.",
      "Một tác phẩm gia truyền, được thiết kế để truyền qua nhiều thế hệ.",
    ],
    specs: [
      { label: "Height",      value: "18 cm" },
      { label: "Diameter",    value: "26 cm" },
      { label: "Material",    value: "Preserved lotus · crystal resin · glass vessel · copper base" },
      { label: "Light",       value: "Upward-facing warm LED strip, USB-C, 6h life" },
      { label: "Colour temp", value: "2500K" },
    ],
    petals: 11,
  },
  {
    id: "lavender-glow",
    nameVi: "Hoa Oải Hương",
    nameEn: "Lavender Glow",
    price: 1_100_000,
    gradient: "radial-gradient(ellipse at 42% 25%, #fdf2f8 0%, #fce4ec 22%, #f9a8d4 45%, #d946ef 65%, #9333ea 83%, #4a0d28 100%)",
    descriptionEn: [
      "The Lavender Glow weaves preserved lavender stems and blush roses in a tall column lamp. The scent lingers faintly — a living memory of a French garden wedding.",
      "A combination of mauve, rose, and deep amber creates an unusually warm purple-pink light that flatters every skin tone.",
      "Especially popular for evening receptions and candlelit dinners.",
    ],
    descriptionVi: [
      "Hoa Oải Hương đan xen các cành oải hương được bảo quản và hoa hồng phấn trong chiếc đèn cột cao. Mùi thơm còn thoang thoảng — một ký ức sống động về đám cưới vườn Pháp.",
      "Sự kết hợp của màu tím nhạt, hồng và hổ phách đậm tạo ra ánh sáng tím-hồng ấm áp bất thường, tôn lên mọi làn da.",
      "Đặc biệt phổ biến cho các buổi tiệc tối và bữa tối nến.",
    ],
    specs: [
      { label: "Height",      value: "34 cm" },
      { label: "Diameter",    value: "12 cm" },
      { label: "Material",    value: "Preserved lavender & rose · tall glass column · antique brass" },
      { label: "Light",       value: "Warm white LED strip, USB-C rechargeable, 10h life" },
      { label: "Colour temp", value: "2700K" },
    ],
    petals: 7,
  },
  {
    id: "wedding-duo",
    nameVi: "Bộ Đôi Cưới",
    nameEn: "Wedding Duo Set",
    price: 2_200_000,
    tag: "Bestseller",
    gradient: "linear-gradient(135deg, #fff5f8 0%, #fce4ec 18%, #f9a8d4 33%, #ec4899 50%, #c2185b 65%, #831843 80%, #3d0b22 100%)",
    descriptionEn: [
      "Two matching lamps, hand-paired from a single flower harvest so their colors and forms mirror each other perfectly. The Wedding Duo is designed to flank your ceremony arch or sweetheart table.",
      "Each pair is accompanied by a hand-calligraphed pairing certificate noting the flower variety, harvest date, and the artisan who made them.",
      "The most gifted item in our collection. A story that begins on your wedding day and lasts forever.",
    ],
    descriptionVi: [
      "Hai chiếc đèn đôi, được ghép thủ công từ một vụ thu hoạch hoa để màu sắc và hình dáng của chúng phản chiếu nhau hoàn hảo. Bộ Đôi Cưới được thiết kế để đứng hai bên vòm lễ hoặc bàn sweetheart của bạn.",
      "Mỗi cặp được kèm theo một chứng chỉ ghép đôi viết bằng bút lông, ghi giống hoa, ngày thu hoạch và tên nghệ nhân tạo ra chúng.",
      "Món quà được tặng nhiều nhất trong bộ sưu tập của chúng tôi. Một câu chuyện bắt đầu vào ngày cưới của bạn và kéo dài mãi mãi.",
    ],
    specs: [
      { label: "Height",      value: "24 cm each" },
      { label: "Diameter",    value: "14 cm each" },
      { label: "Material",    value: "Matched preserved blooms · hand-blown glass · twin brass bases" },
      { label: "Light",       value: "Synchronised warm LED, USB-C per lamp, 10h life" },
      { label: "Colour temp", value: "2700K" },
    ],
    petals: 8,
  },
];

export const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const TAG_STYLES: Record<string, string> = {
  Bestseller: "bg-rose-100 text-rose-700 border-rose-200",
  New:        "bg-pink-100 text-pink-700 border-pink-200",
  Seasonal:   "bg-amber-50  text-amber-700 border-amber-200",
  Exclusive:  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  Limited:    "bg-red-50   text-red-600   border-red-200",
};
