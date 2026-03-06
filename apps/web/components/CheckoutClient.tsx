"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatVND } from "@/lib/products";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button }   from "@/components/ui/button";
import {
  User, Phone, MapPin, FileText, Package, CheckCircle2,
  ChevronRight, Truck, ShieldCheck, ShoppingBag, ArrowLeft,
  ChevronDown, Banknote, Check, Flower2,
} from "lucide-react";

// ─── Vietnamese Address Data ──────────────────────────────────────────────────

const PROVINCES = [
  { id: "HN",  name: "Hà Nội" },
  { id: "HCM", name: "TP. Hồ Chí Minh" },
  { id: "DN",  name: "Đà Nẵng" },
  { id: "HP",  name: "Hải Phòng" },
  { id: "CT",  name: "Cần Thơ" },
  { id: "BD",  name: "Bình Dương" },
  { id: "BH",  name: "Đồng Nai" },
  { id: "LD",  name: "Lâm Đồng" },
  { id: "KH",  name: "Khánh Hòa" },
  { id: "QB",  name: "Quảng Bình" },
  { id: "NT",  name: "Ninh Thuận" },
  { id: "AG",  name: "An Giang" },
  { id: "VT",  name: "Bà Rịa – Vũng Tàu" },
  { id: "HG",  name: "Hậu Giang" },
  { id: "TH",  name: "Thanh Hóa" },
];

const DISTRICTS: Record<string, { id: string; name: string }[]> = {
  HN: [
    { id: "HN-BD", name: "Quận Ba Đình" },
    { id: "HN-HK", name: "Quận Hoàn Kiếm" },
    { id: "HN-DD", name: "Quận Đống Đa" },
    { id: "HN-CG", name: "Quận Cầu Giấy" },
    { id: "HN-TL", name: "Quận Tây Hồ" },
    { id: "HN-HM", name: "Quận Hai Bà Trưng" },
    { id: "HN-TT", name: "Huyện Thanh Trì" },
    { id: "HN-GE", name: "Huyện Gia Lâm" },
  ],
  HCM: [
    { id: "HCM-Q1",  name: "Quận 1" },
    { id: "HCM-Q3",  name: "Quận 3" },
    { id: "HCM-Q7",  name: "Quận 7" },
    { id: "HCM-BT",  name: "Quận Bình Thạnh" },
    { id: "HCM-GV",  name: "Quận Gò Vấp" },
    { id: "HCM-PN",  name: "Quận Phú Nhuận" },
    { id: "HCM-TB",  name: "Quận Tân Bình" },
    { id: "HCM-TD",  name: "TP. Thủ Đức" },
  ],
  DN: [
    { id: "DN-HC",  name: "Quận Hải Châu" },
    { id: "DN-ST",  name: "Quận Sơn Trà" },
    { id: "DN-NK",  name: "Quận Ngũ Hành Sơn" },
    { id: "DN-LCC", name: "Quận Liên Chiểu" },
    { id: "DN-TK",  name: "Quận Thanh Khê" },
  ],
  HP: [
    { id: "HP-HB", name: "Quận Hồng Bàng" },
    { id: "HP-LB", name: "Quận Lê Chân" },
    { id: "HP-NA", name: "Quận Ngô Quyền" },
    { id: "HP-KA", name: "Quận Kiến An" },
    { id: "HP-DT", name: "Quận Đồ Sơn" },
  ],
  CT: [
    { id: "CT-NK", name: "Quận Ninh Kiều" },
    { id: "CT-BC", name: "Quận Bình Thủy" },
    { id: "CT-CR", name: "Quận Cái Răng" },
    { id: "CT-OM", name: "Quận Ô Môn" },
  ],
  BD: [
    { id: "BD-TDM", name: "TP. Thủ Dầu Một" },
    { id: "BD-TA",  name: "TP. Thuận An" },
    { id: "BD-DX",  name: "TP. Dĩ An" },
    { id: "BD-BC",  name: "TP. Bến Cát" },
  ],
  BH: [
    { id: "BH-BD",  name: "TP. Biên Hòa" },
    { id: "BH-LK",  name: "TP. Long Khánh" },
    { id: "BH-VC",  name: "Huyện Vĩnh Cửu" },
    { id: "BH-TN",  name: "Huyện Thống Nhất" },
  ],
  LD: [
    { id: "LD-DL", name: "TP. Đà Lạt" },
    { id: "LD-BL", name: "TP. Bảo Lộc" },
    { id: "LD-LC", name: "Huyện Lạc Dương" },
    { id: "LD-DD", name: "Huyện Đơn Dương" },
  ],
  KH: [
    { id: "KH-NT", name: "TP. Nha Trang" },
    { id: "KH-CR", name: "TP. Cam Ranh" },
    { id: "KH-DK", name: "Huyện Diên Khánh" },
    { id: "KH-KS", name: "Huyện Khánh Sơn" },
  ],
  QB: [
    { id: "QB-DH", name: "TP. Đồng Hới" },
    { id: "QB-BT", name: "Huyện Bố Trạch" },
    { id: "QB-QN", name: "Huyện Quảng Ninh" },
    { id: "QB-TH", name: "Huyện Tuyên Hóa" },
  ],
  NT: [
    { id: "NT-PG", name: "TP. Phan Rang – Tháp Chàm" },
    { id: "NT-NT", name: "Huyện Ninh Thuận" },
    { id: "NT-NH", name: "Huyện Ninh Hải" },
  ],
  AG: [
    { id: "AG-LX", name: "TP. Long Xuyên" },
    { id: "AG-CT", name: "TP. Châu Đốc" },
    { id: "AG-AT", name: "Huyện An Phú" },
  ],
  VT: [
    { id: "VT-VT", name: "TP. Vũng Tàu" },
    { id: "VT-BR", name: "TP. Bà Rịa" },
    { id: "VT-CG", name: "Huyện Châu Đức" },
    { id: "VT-XM", name: "Huyện Xuyên Mộc" },
  ],
  HG: [
    { id: "HG-VT", name: "TP. Vị Thanh" },
    { id: "HG-LB", name: "TX. Long Mỹ" },
    { id: "HG-CL", name: "Huyện Châu Thành" },
  ],
  TH: [
    { id: "TH-TH", name: "TP. Thanh Hóa" },
    { id: "TH-SM", name: "TX. Sầm Sơn" },
    { id: "TH-BT", name: "Huyện Bỉm Sơn" },
    { id: "TH-HH", name: "Huyện Hà Trung" },
  ],
};

const WARDS: Record<string, { id: string; name: string }[]> = {
  "HN-BD":  [
    { id: "w-1",  name: "Phường Phúc Xá" },
    { id: "w-2",  name: "Phường Trúc Bạch" },
    { id: "w-3",  name: "Phường Vĩnh Phúc" },
    { id: "w-4",  name: "Phường Cống Vị" },
    { id: "w-5",  name: "Phường Liễu Giai" },
    { id: "w-6",  name: "Phường Quán Thánh" },
    { id: "w-7",  name: "Phường Ngọc Hà" },
    { id: "w-8",  name: "Phường Điện Biên" },
    { id: "w-9",  name: "Phường Đội Cấn" },
  ],
  "HN-HK":  [
    { id: "w-10", name: "Phường Hàng Bạc" },
    { id: "w-11", name: "Phường Hàng Bồ" },
    { id: "w-12", name: "Phường Hàng Đào" },
    { id: "w-13", name: "Phường Hàng Gai" },
    { id: "w-14", name: "Phường Lý Thái Tổ" },
    { id: "w-15", name: "Phường Phan Chu Trinh" },
    { id: "w-16", name: "Phường Tràng Tiền" },
  ],
  "HN-DD":  [
    { id: "w-20", name: "Phường Cát Linh" },
    { id: "w-21", name: "Phường Kim Liên" },
    { id: "w-22", name: "Phường Quốc Tử Giám" },
    { id: "w-23", name: "Phường Văn Miếu" },
    { id: "w-24", name: "Phường Ô Chợ Dừa" },
    { id: "w-25", name: "Phường Khâm Thiên" },
  ],
  "HN-CG":  [
    { id: "w-30", name: "Phường Dịch Vọng" },
    { id: "w-31", name: "Phường Mai Dịch" },
    { id: "w-32", name: "Phường Nghĩa Đô" },
    { id: "w-33", name: "Phường Trung Hòa" },
    { id: "w-34", name: "Phường Quan Hoa" },
    { id: "w-35", name: "Phường Yên Hòa" },
  ],
  "HN-TL":  [
    { id: "w-40", name: "Phường Bưởi" },
    { id: "w-41", name: "Phường Nhật Tân" },
    { id: "w-42", name: "Phường Quảng An" },
    { id: "w-43", name: "Phường Tứ Liên" },
    { id: "w-44", name: "Phường Xuân La" },
    { id: "w-45", name: "Phường Yên Phụ" },
  ],
  "HN-HM":  [
    { id: "w-50", name: "Phường Bạch Đằng" },
    { id: "w-51", name: "Phường Đống Mác" },
    { id: "w-52", name: "Phường Lê Đại Hành" },
    { id: "w-53", name: "Phường Minh Khai" },
    { id: "w-54", name: "Phường Nguyễn Du" },
  ],
  "HN-TT":  [
    { id: "w-60", name: "Xã Đại Kim" },
    { id: "w-61", name: "Xã Định Công" },
    { id: "w-62", name: "Xã Hoàng Liệt" },
    { id: "w-63", name: "Xã Tương Mai" },
    { id: "w-64", name: "Xã Yên Sở" },
  ],
  "HN-GE":  [
    { id: "w-70", name: "Thị trấn Trâu Quỳ" },
    { id: "w-71", name: "Xã Bát Tràng" },
    { id: "w-72", name: "Xã Đông Anh" },
    { id: "w-73", name: "Xã Kiêu Kỵ" },
    { id: "w-74", name: "Xã Phù Đổng" },
  ],
  "HCM-Q1": [
    { id: "w-80", name: "Phường Bến Nghé" },
    { id: "w-81", name: "Phường Bến Thành" },
    { id: "w-82", name: "Phường Cầu Ông Lãnh" },
    { id: "w-83", name: "Phường Đa Kao" },
    { id: "w-84", name: "Phường Nguyễn Thái Bình" },
    { id: "w-85", name: "Phường Phạm Ngũ Lão" },
    { id: "w-86", name: "Phường Tân Định" },
  ],
  "HCM-Q3": [
    { id: "w-90", name: "Phường 1" },
    { id: "w-91", name: "Phường 2" },
    { id: "w-92", name: "Phường 3" },
    { id: "w-93", name: "Phường 4" },
    { id: "w-94", name: "Phường 5" },
    { id: "w-95", name: "Phường 6" },
    { id: "w-96", name: "Phường 14" },
  ],
  "HCM-Q7": [
    { id: "w-100", name: "Phường Bình Thuận" },
    { id: "w-101", name: "Phường Tân Hưng" },
    { id: "w-102", name: "Phường Tân Kiểng" },
    { id: "w-103", name: "Phường Tân Phong" },
    { id: "w-104", name: "Phường Tân Quy" },
    { id: "w-105", name: "Phường Phú Mỹ" },
  ],
  "HCM-BT": [
    { id: "w-110", name: "Phường 1" },
    { id: "w-111", name: "Phường 2" },
    { id: "w-112", name: "Phường 3" },
    { id: "w-113", name: "Phường 5" },
    { id: "w-114", name: "Phường 6" },
    { id: "w-115", name: "Phường 11" },
    { id: "w-116", name: "Phường 14" },
    { id: "w-117", name: "Phường 22" },
    { id: "w-118", name: "Phường 25" },
    { id: "w-119", name: "Phường 27" },
  ],
  "HCM-GV": [
    { id: "w-120", name: "Phường 1" },
    { id: "w-121", name: "Phường 3" },
    { id: "w-122", name: "Phường 5" },
    { id: "w-123", name: "Phường 7" },
    { id: "w-124", name: "Phường 9" },
    { id: "w-125", name: "Phường 11" },
    { id: "w-126", name: "Phường 16" },
  ],
  "HCM-PN": [
    { id: "w-130", name: "Phường 1" },
    { id: "w-131", name: "Phường 2" },
    { id: "w-132", name: "Phường 3" },
    { id: "w-133", name: "Phường 4" },
    { id: "w-134", name: "Phường 8" },
    { id: "w-135", name: "Phường 13" },
    { id: "w-136", name: "Phường 15" },
  ],
  "HCM-TB": [
    { id: "w-140", name: "Phường 1" },
    { id: "w-141", name: "Phường 2" },
    { id: "w-142", name: "Phường 3" },
    { id: "w-143", name: "Phường 4" },
    { id: "w-144", name: "Phường 5" },
    { id: "w-145", name: "Phường 6" },
    { id: "w-146", name: "Phường 7" },
    { id: "w-147", name: "Phường 8" },
    { id: "w-148", name: "Phường 11" },
    { id: "w-149", name: "Phường 12" },
    { id: "w-150", name: "Phường 14" },
    { id: "w-151", name: "Phường 15" },
  ],
  "HCM-TD": [
    { id: "w-160", name: "Phường An Bình" },
    { id: "w-161", name: "Phường An Khánh" },
    { id: "w-162", name: "Phường An Phú" },
    { id: "w-163", name: "Phường Bình Chiểu" },
    { id: "w-164", name: "Phường Bình Thọ" },
    { id: "w-165", name: "Phường Hiệp Bình Chánh" },
    { id: "w-166", name: "Phường Hiệp Phú" },
    { id: "w-167", name: "Phường Linh Đông" },
    { id: "w-168", name: "Phường Long Bình" },
    { id: "w-169", name: "Phường Long Thạnh Mỹ" },
    { id: "w-170", name: "Phường Phú Hữu" },
    { id: "w-171", name: "Phường Tam Bình" },
    { id: "w-172", name: "Phường Thảo Điền" },
    { id: "w-173", name: "Phường Thủ Đức" },
    { id: "w-174", name: "Phường Trường Thọ" },
  ],
  "DN-HC": [
    { id: "w-180", name: "Phường Bình Hiên" },
    { id: "w-181", name: "Phường Hải Châu I" },
    { id: "w-182", name: "Phường Hải Châu II" },
    { id: "w-183", name: "Phường Nam Dương" },
    { id: "w-184", name: "Phường Thanh Bình" },
    { id: "w-185", name: "Phường Thuận Phước" },
  ],
  "DN-ST": [
    { id: "w-190", name: "Phường An Hải Bắc" },
    { id: "w-191", name: "Phường An Hải Đông" },
    { id: "w-192", name: "Phường An Hải Tây" },
    { id: "w-193", name: "Phường Mân Thái" },
    { id: "w-194", name: "Phường Phước Mỹ" },
    { id: "w-195", name: "Phường Thọ Quang" },
  ],
  "DN-NK": [
    { id: "w-200", name: "Phường Hòa Hải" },
    { id: "w-201", name: "Phường Hòa Quý" },
    { id: "w-202", name: "Phường Khuê Mỹ" },
    { id: "w-203", name: "Phường Mỹ An" },
  ],
  "DN-LCC": [
    { id: "w-210", name: "Phường Hòa Khánh Bắc" },
    { id: "w-211", name: "Phường Hòa Khánh Nam" },
    { id: "w-212", name: "Phường Hòa Minh" },
    { id: "w-213", name: "Phường Hòa Hiệp Bắc" },
    { id: "w-214", name: "Phường Hòa Hiệp Nam" },
  ],
  "DN-TK": [
    { id: "w-220", name: "Phường An Khê" },
    { id: "w-221", name: "Phường Chính Gián" },
    { id: "w-222", name: "Phường Hòa Khê" },
    { id: "w-223", name: "Phường Tam Thuận" },
    { id: "w-224", name: "Phường Thạc Gián" },
    { id: "w-225", name: "Phường Tân Chính" },
    { id: "w-226", name: "Phường Xuân Hà" },
  ],
  "HP-HB": [
    { id: "w-230", name: "Phường Hoàng Văn Thụ" },
    { id: "w-231", name: "Phường Minh Khai" },
    { id: "w-232", name: "Phường Phan Bội Châu" },
    { id: "w-233", name: "Phường Sở Dầu" },
    { id: "w-234", name: "Phường Thượng Lý" },
  ],
  "HP-LB": [
    { id: "w-240", name: "Phường An Biên" },
    { id: "w-241", name: "Phường Cát Bi" },
    { id: "w-242", name: "Phường Hàng Kênh" },
    { id: "w-243", name: "Phường Lam Sơn" },
    { id: "w-244", name: "Phường Niệm Nghĩa" },
    { id: "w-245", name: "Phường Vĩnh Niệm" },
  ],
  "HP-NA": [
    { id: "w-250", name: "Phường Cầu Đất" },
    { id: "w-251", name: "Phường Đông Khê" },
    { id: "w-252", name: "Phường Gia Viên" },
    { id: "w-253", name: "Phường Lê Lợi" },
    { id: "w-254", name: "Phường Máy Chai" },
    { id: "w-255", name: "Phường Vạn Mỹ" },
  ],
  "HP-KA": [
    { id: "w-260", name: "Phường Phú Xuân" },
    { id: "w-261", name: "Phường Tràng Minh" },
    { id: "w-262", name: "Phường Văn Đẩu" },
    { id: "w-263", name: "Phường Quán Trữ" },
  ],
  "HP-DT": [
    { id: "w-270", name: "Phường Ngọc Hải" },
    { id: "w-271", name: "Phường Ngọc Xuyên" },
    { id: "w-272", name: "Phường Vạn Hương" },
    { id: "w-273", name: "Phường Vạn Sơn" },
  ],
  "CT-NK": [
    { id: "w-280", name: "Phường An Bình" },
    { id: "w-281", name: "Phường An Cư" },
    { id: "w-282", name: "Phường An Hội" },
    { id: "w-283", name: "Phường An Nghiệp" },
    { id: "w-284", name: "Phường Cái Khế" },
    { id: "w-285", name: "Phường Tân An" },
    { id: "w-286", name: "Phường Thới Bình" },
  ],
  "CT-BC": [
    { id: "w-290", name: "Phường An Thới" },
    { id: "w-291", name: "Phường Bình Thủy" },
    { id: "w-292", name: "Phường Long Hòa" },
    { id: "w-293", name: "Phường Trà An" },
    { id: "w-294", name: "Phường Trà Nóc" },
  ],
  "CT-CR": [
    { id: "w-300", name: "Phường Ba Láng" },
    { id: "w-301", name: "Phường Hưng Phú" },
    { id: "w-302", name: "Phường Lê Bình" },
    { id: "w-303", name: "Phường Phú Thứ" },
    { id: "w-304", name: "Phường Tân Phú" },
  ],
  "CT-OM": [
    { id: "w-310", name: "Phường Châu Văn Liêm" },
    { id: "w-311", name: "Phường Long Hưng" },
    { id: "w-312", name: "Phường Phước Thới" },
    { id: "w-313", name: "Phường Thới Long" },
    { id: "w-314", name: "Phường Trường Lạc" },
  ],
  "BD-TDM": [
    { id: "w-320", name: "Phường Chánh Nghĩa" },
    { id: "w-321", name: "Phường Định Hòa" },
    { id: "w-322", name: "Phường Hiệp An" },
    { id: "w-323", name: "Phường Hiệp Thành" },
    { id: "w-324", name: "Phường Phú Cường" },
    { id: "w-325", name: "Phường Phú Hòa" },
    { id: "w-326", name: "Phường Tân An" },
  ],
  "BD-TA": [
    { id: "w-330", name: "Phường An Phú" },
    { id: "w-331", name: "Phường An Thạnh" },
    { id: "w-332", name: "Phường Bình Chuẩn" },
    { id: "w-333", name: "Phường Bình Hòa" },
    { id: "w-334", name: "Phường Lái Thiêu" },
    { id: "w-335", name: "Phường Thuận Giao" },
    { id: "w-336", name: "Phường Vĩnh Phú" },
  ],
  "BD-DX": [
    { id: "w-340", name: "Phường An Bình" },
    { id: "w-341", name: "Phường Bình An" },
    { id: "w-342", name: "Phường Đông Hòa" },
    { id: "w-343", name: "Phường Tân Bình" },
    { id: "w-344", name: "Phường Tân Đông Hiệp" },
  ],
  "BD-BC": [
    { id: "w-350", name: "Phường An Điền" },
    { id: "w-351", name: "Phường An Tây" },
    { id: "w-352", name: "Phường Hòa Lợi" },
    { id: "w-353", name: "Phường Mỹ Phước" },
    { id: "w-354", name: "Phường Tân Định" },
  ],
  "BH-BD": [
    { id: "w-360", name: "Phường An Bình" },
    { id: "w-361", name: "Phường Bình Đa" },
    { id: "w-362", name: "Phường Hòa Bình" },
    { id: "w-363", name: "Phường Long Bình" },
    { id: "w-364", name: "Phường Quang Vinh" },
    { id: "w-365", name: "Phường Tam Hòa" },
    { id: "w-366", name: "Phường Trảng Dài" },
    { id: "w-367", name: "Phường Trung Dũng" },
  ],
  "BH-LK": [
    { id: "w-370", name: "Phường Bảo Vinh" },
    { id: "w-371", name: "Phường Suối Tre" },
    { id: "w-372", name: "Phường Xuân An" },
    { id: "w-373", name: "Phường Xuân Bình" },
    { id: "w-374", name: "Phường Xuân Hòa" },
  ],
  "BH-VC": [
    { id: "w-380", name: "Thị trấn Vĩnh An" },
    { id: "w-381", name: "Xã Bình Hòa" },
    { id: "w-382", name: "Xã Mã Đà" },
    { id: "w-383", name: "Xã Tân An" },
    { id: "w-384", name: "Xã Thạnh Phú" },
  ],
  "BH-TN": [
    { id: "w-390", name: "Xã Gia Tân 1" },
    { id: "w-391", name: "Xã Gia Tân 2" },
    { id: "w-392", name: "Xã Hưng Lộc" },
    { id: "w-393", name: "Xã Quang Trung" },
    { id: "w-394", name: "Xã Xuân Thiện" },
  ],
  "LD-DL": [
    { id: "w-400", name: "Phường 1" },
    { id: "w-401", name: "Phường 2" },
    { id: "w-402", name: "Phường 3" },
    { id: "w-403", name: "Phường 4" },
    { id: "w-404", name: "Phường 5" },
    { id: "w-405", name: "Phường 6" },
    { id: "w-406", name: "Phường 7" },
    { id: "w-407", name: "Phường 8" },
    { id: "w-408", name: "Phường 9" },
    { id: "w-409", name: "Phường 10" },
    { id: "w-410", name: "Phường 11" },
    { id: "w-411", name: "Phường 12" },
    { id: "w-412", name: "Xã Xuân Trường" },
  ],
  "LD-BL": [
    { id: "w-420", name: "Phường 1" },
    { id: "w-421", name: "Phường 2" },
    { id: "w-422", name: "Phường B'Lao" },
    { id: "w-423", name: "Phường Lộc Phát" },
    { id: "w-424", name: "Phường Lộc Sơn" },
    { id: "w-425", name: "Phường Lộc Tiến" },
  ],
  "LD-LC": [
    { id: "w-430", name: "Thị trấn Lạc Dương" },
    { id: "w-431", name: "Xã Đa Nhim" },
    { id: "w-432", name: "Xã Lát" },
    { id: "w-433", name: "Xã Đa Sar" },
  ],
  "LD-DD": [
    { id: "w-440", name: "Thị trấn Dran" },
    { id: "w-441", name: "Xã Ka Đô" },
    { id: "w-442", name: "Xã Lạc Lâm" },
    { id: "w-443", name: "Xã Lạc Xuân" },
    { id: "w-444", name: "Xã Tu Tra" },
  ],
  "KH-NT": [
    { id: "w-450", name: "Phường Lộc Thọ" },
    { id: "w-451", name: "Phường Phước Hòa" },
    { id: "w-452", name: "Phường Phương Sài" },
    { id: "w-453", name: "Phường Tân Lập" },
    { id: "w-454", name: "Phường Vạn Thắng" },
    { id: "w-455", name: "Phường Vĩnh Hải" },
    { id: "w-456", name: "Phường Vĩnh Nguyên" },
    { id: "w-457", name: "Phường Xương Huân" },
  ],
  "KH-CR": [
    { id: "w-460", name: "Phường Ba Ngòi" },
    { id: "w-461", name: "Phường Cam Linh" },
    { id: "w-462", name: "Phường Cam Nghĩa" },
    { id: "w-463", name: "Phường Cam Phúc Bắc" },
    { id: "w-464", name: "Phường Cam Thuận" },
  ],
  "KH-DK": [
    { id: "w-470", name: "Thị trấn Diên Khánh" },
    { id: "w-471", name: "Xã Diên An" },
    { id: "w-472", name: "Xã Diên Bình" },
    { id: "w-473", name: "Xã Diên Đồng" },
    { id: "w-474", name: "Xã Diên Sơn" },
    { id: "w-475", name: "Xã Diên Toàn" },
  ],
  "KH-KS": [
    { id: "w-480", name: "Thị trấn Tô Hạp" },
    { id: "w-481", name: "Xã Ba Cụm Bắc" },
    { id: "w-482", name: "Xã Sơn Bình" },
    { id: "w-483", name: "Xã Sơn Hiệp" },
  ],
  "QB-DH": [
    { id: "w-490", name: "Phường Bắc Lý" },
    { id: "w-491", name: "Phường Đức Ninh" },
    { id: "w-492", name: "Phường Đồng Mỹ" },
    { id: "w-493", name: "Phường Đồng Phú" },
    { id: "w-494", name: "Phường Hải Đình" },
    { id: "w-495", name: "Phường Nam Lý" },
  ],
  "QB-BT": [
    { id: "w-500", name: "Thị trấn Hoàn Lão" },
    { id: "w-501", name: "Xã Cự Nẫm" },
    { id: "w-502", name: "Xã Đại Trạch" },
    { id: "w-503", name: "Xã Hải Trạch" },
  ],
  "QB-QN": [
    { id: "w-510", name: "Thị trấn Quán Hàu" },
    { id: "w-511", name: "Xã An Ninh Đông" },
    { id: "w-512", name: "Xã Duy Ninh" },
    { id: "w-513", name: "Xã Gia Ninh" },
    { id: "w-514", name: "Xã Hàm Ninh" },
  ],
  "QB-TH": [
    { id: "w-520", name: "Thị trấn Đồng Lê" },
    { id: "w-521", name: "Xã Cao Quảng" },
    { id: "w-522", name: "Xã Đồng Hóa" },
    { id: "w-523", name: "Xã Thuận Hóa" },
    { id: "w-524", name: "Xã Văn Hóa" },
  ],
  "NT-PG": [
    { id: "w-530", name: "Phường Bảo An" },
    { id: "w-531", name: "Phường Đài Sơn" },
    { id: "w-532", name: "Phường Đô Vinh" },
    { id: "w-533", name: "Phường Kinh Dinh" },
    { id: "w-534", name: "Phường Mỹ Bình" },
    { id: "w-535", name: "Phường Mỹ Đông" },
    { id: "w-536", name: "Phường Mỹ Hải" },
  ],
  "NT-NT": [
    { id: "w-540", name: "Xã Mỹ Sơn" },
    { id: "w-541", name: "Xã Nhơn Sơn" },
    { id: "w-542", name: "Xã Phước Sơn" },
  ],
  "NT-NH": [
    { id: "w-550", name: "Thị trấn Khánh Hải" },
    { id: "w-551", name: "Xã Hộ Hải" },
    { id: "w-552", name: "Xã Nhơn Hải" },
    { id: "w-553", name: "Xã Tri Hải" },
  ],
  "AG-LX": [
    { id: "w-560", name: "Phường Bình Đức" },
    { id: "w-561", name: "Phường Bình Khánh" },
    { id: "w-562", name: "Phường Đông Xuyên" },
    { id: "w-563", name: "Phường Mỹ Bình" },
    { id: "w-564", name: "Phường Mỹ Hòa" },
    { id: "w-565", name: "Phường Mỹ Thới" },
    { id: "w-566", name: "Phường Mỹ Xuyên" },
  ],
  "AG-CT": [
    { id: "w-570", name: "Phường Châu Phú A" },
    { id: "w-571", name: "Phường Châu Phú B" },
    { id: "w-572", name: "Phường Núi Sam" },
    { id: "w-573", name: "Phường Vĩnh Mỹ" },
    { id: "w-574", name: "Phường Vĩnh Ngươn" },
  ],
  "AG-AT": [
    { id: "w-580", name: "Thị trấn An Phú" },
    { id: "w-581", name: "Xã Đa Phước" },
    { id: "w-582", name: "Xã Long Bình" },
    { id: "w-583", name: "Xã Phú Hội" },
    { id: "w-584", name: "Xã Phú Hữu" },
  ],
  "VT-VT": [
    { id: "w-590", name: "Phường 1" },
    { id: "w-591", name: "Phường 2" },
    { id: "w-592", name: "Phường 3" },
    { id: "w-593", name: "Phường 4" },
    { id: "w-594", name: "Phường 5" },
    { id: "w-595", name: "Phường Rạch Dừa" },
    { id: "w-596", name: "Phường Thắng Nhất" },
    { id: "w-597", name: "Phường Thắng Nhì" },
    { id: "w-598", name: "Phường Thắng Tam" },
  ],
  "VT-BR": [
    { id: "w-600", name: "Phường Phước Hiệp" },
    { id: "w-601", name: "Phường Phước Hưng" },
    { id: "w-602", name: "Phường Phước Nguyên" },
    { id: "w-603", name: "Phường Phước Trung" },
    { id: "w-604", name: "Phường Tân Hòa" },
    { id: "w-605", name: "Phường Tân Phước" },
  ],
  "VT-CG": [
    { id: "w-610", name: "Thị trấn Ngãi Giao" },
    { id: "w-611", name: "Xã Bình Ba" },
    { id: "w-612", name: "Xã Kim Long" },
    { id: "w-613", name: "Xã Nghĩa Thành" },
    { id: "w-614", name: "Xã Quảng Thành" },
  ],
  "VT-XM": [
    { id: "w-620", name: "Thị trấn Phước Bửu" },
    { id: "w-621", name: "Xã Bàu Lâm" },
    { id: "w-622", name: "Xã Hòa Bình" },
    { id: "w-623", name: "Xã Hòa Hiệp" },
    { id: "w-624", name: "Xã Xuyên Mộc" },
  ],
  "HG-VT": [
    { id: "w-630", name: "Phường 1" },
    { id: "w-631", name: "Phường 3" },
    { id: "w-632", name: "Phường 4" },
    { id: "w-633", name: "Phường 5" },
    { id: "w-634", name: "Phường 7" },
    { id: "w-635", name: "Xã Vị Tân" },
    { id: "w-636", name: "Xã Vị Thắng" },
  ],
  "HG-LB": [
    { id: "w-640", name: "Phường Bình Thạnh" },
    { id: "w-641", name: "Phường Long Bình" },
    { id: "w-642", name: "Phường Thuận An" },
    { id: "w-643", name: "Phường Trà Lồng" },
    { id: "w-644", name: "Phường Vĩnh Thuận" },
  ],
  "HG-CL": [
    { id: "w-650", name: "Thị trấn Ngã Sáu" },
    { id: "w-651", name: "Xã Đông Phú" },
    { id: "w-652", name: "Xã Đông Thạnh" },
    { id: "w-653", name: "Xã Phú An" },
    { id: "w-654", name: "Xã Phú Hữu" },
  ],
  "TH-TH": [
    { id: "w-660", name: "Phường An Hưng" },
    { id: "w-661", name: "Phường Ba Đình" },
    { id: "w-662", name: "Phường Điện Biên" },
    { id: "w-663", name: "Phường Đông Cương" },
    { id: "w-664", name: "Phường Đông Hải" },
    { id: "w-665", name: "Phường Đông Sơn" },
    { id: "w-666", name: "Phường Đông Thọ" },
    { id: "w-667", name: "Phường Hàm Rồng" },
    { id: "w-668", name: "Phường Lam Sơn" },
    { id: "w-669", name: "Phường Nam Ngạn" },
    { id: "w-670", name: "Phường Ngọc Trạo" },
    { id: "w-671", name: "Phường Phú Sơn" },
    { id: "w-672", name: "Phường Tân Sơn" },
    { id: "w-673", name: "Phường Trường Thi" },
  ],
  "TH-SM": [
    { id: "w-680", name: "Phường Bắc Sơn" },
    { id: "w-681", name: "Phường Quảng Cư" },
    { id: "w-682", name: "Phường Quảng Tiến" },
    { id: "w-683", name: "Phường Trung Sơn" },
    { id: "w-684", name: "Phường Trường Sơn" },
  ],
  "TH-BT": [
    { id: "w-690", name: "Phường Ba Đình" },
    { id: "w-691", name: "Phường Bắc Sơn" },
    { id: "w-692", name: "Phường Đông Sơn" },
    { id: "w-693", name: "Phường Lam Sơn" },
    { id: "w-694", name: "Phường Ngọc Trạo" },
  ],
  "TH-HH": [
    { id: "w-700", name: "Thị trấn Kim Tân" },
    { id: "w-701", name: "Xã Hà Bắc" },
    { id: "w-702", name: "Xã Hà Bình" },
    { id: "w-703", name: "Xã Hà Châu" },
    { id: "w-704", name: "Xã Hà Giang" },
    { id: "w-705", name: "Xã Hà Tiến" },
    { id: "w-706", name: "Xã Hà Toại" },
  ],
};

// ─── Flower Thumbnail ─────────────────────────────────────────────────────────

function FlowerThumb({ gradient, petals }: { gradient: string; petals: number }) {
  const pts = [
    { x: 18, y: 20, s: 26, r: 15 }, { x: 72, y: 12, s: 18, r: -20 },
    { x: 50, y: 60, s: 30, r: 30 }, { x:  8, y: 60, s: 16, r: 45 },
    { x: 82, y: 52, s: 22, r: -10 },
  ].slice(0, Math.min(petals, 5));

  return (
    <div
      className="relative w-[72px] h-[84px] rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: gradient }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {pts.map(({ x, y, s, r }, i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${r}) scale(${s / 40})`} opacity={0.18}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse key={a} cx="0" cy="-11" rx="4.5" ry="11" fill="white" transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="0" r="4" fill="rgba(255,240,245,0.9)" />
          </g>
        ))}
      </svg>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 65%, rgba(255,235,240,0.4) 0%, transparent 55%)" }}
      />
    </div>
  );
}

// ─── Reusable UI Atoms ────────────────────────────────────────────────────────

function FieldLabel({ icon, children, required }: { icon: ReactNode; children: ReactNode; required?: boolean }) {
  return (
    <label className="flex items-center gap-2 mb-2">
      <span className="text-pink-300/70 flex-shrink-0">{icon}</span>
      <span className="text-[11px] tracking-[0.18em] uppercase font-medium" style={{ color: "var(--hanami-rose)" }}>
        {children}
      </span>
      {required && <span className="text-pink-400 text-xs leading-none">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
      {msg}
    </p>
  );
}

function StyledSelect({
  value, onChange, disabled, placeholder, children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-all duration-200 font-sans cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          borderColor: value ? "rgba(236,72,153,0.4)" : "oklch(0.91 0.033 350)",
          background: disabled ? "oklch(0.965 0.018 350)" : "white",
          color: value ? "var(--hanami-deep)" : "oklch(0.52 0.07 350)",
          boxShadow: value ? "0 0 0 3px rgba(249,168,212,0.15)" : "none",
        }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
        style={{ color: value ? "var(--hanami-pink)" : "oklch(0.68 0.08 352)" }}
      />
    </div>
  );
}

// ─── Payment Method Card ──────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    sublabel: "COD — Kiểm tra hàng trước khi thanh toán",
    icon: <Banknote size={18} />,
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    sublabel: "Nhận thông tin tài khoản qua SMS / email",
    icon: <Package size={18} />,
  },
];

// ─── Order Success View ───────────────────────────────────────────────────────

function SuccessView({ name }: { name: string }) {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center py-20 animate-fade-up"
      style={{ background: "var(--hanami-ivory)" }}
    >
      {/* Decorative flower ring */}
      <div className="relative mb-8">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 40% 40%, var(--hanami-blush) 0%, var(--hanami-pale) 60%, white 100%)",
            boxShadow: "0 0 0 8px rgba(249,168,212,0.15), 0 0 0 16px rgba(236,72,153,0.03)",
          }}
        >
          <CheckCircle2 size={46} style={{ color: "var(--hanami-rose)" }} strokeWidth={1.5} />
        </div>
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div
            key={deg}
            className="absolute w-3 h-5 rounded-full opacity-50"
            style={{
              background: "var(--hanami-soft)",
              top: "50%", left: "50%",
              transformOrigin: "0 -52px",
              transform: `rotate(${deg}deg) translateY(-52px)`,
            }}
          />
        ))}
      </div>

      <h1
        className="font-display text-4xl sm:text-5xl font-light mb-3 animate-fade-up-1"
        style={{ color: "var(--hanami-deep)" }}
      >
        Đơn hàng đã được đặt!
      </h1>
      <p className="text-base mb-2 animate-fade-up-2" style={{ color: "var(--hanami-rose)" }}>
        Cảm ơn bạn, <span className="font-medium">{name}</span> ✿
      </p>
      <p className="text-sm max-w-sm leading-7 animate-fade-up-2" style={{ color: "oklch(0.52 0.07 350)" }}>
        Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 24 giờ.
        Đèn hoa của bạn sẽ được đóng gói cẩn thận và gửi đến bạn sớm nhất có thể.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-10 animate-fade-up-3">
        <Link
          href="/shop"
          className="px-8 py-3.5 rounded-full text-[11px] tracking-[0.25em] uppercase font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)", boxShadow: "0 4px 24px rgba(249,168,212,0.50)" }}
        >
          <ShoppingBag size={13} />
          Tiếp tục mua sắm
        </Link>
        <Link
          href="/"
          className="px-8 py-3.5 rounded-full text-[11px] tracking-[0.25em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors border"
          style={{ borderColor: "rgba(249,168,212,0.50)", color: "var(--hanami-rose)" }}
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

// ─── Empty Cart View ──────────────────────────────────────────────────────────

function EmptyCartView() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center py-20"
      style={{ background: "var(--hanami-ivory)" }}
    >
      <svg viewBox="0 0 80 80" className="w-20 h-20 mb-6 opacity-20" fill="none">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="40" cy="18" rx="6" ry="18" fill="var(--hanami-rose)" transform={`rotate(${a} 40 40)`} />
        ))}
        <circle cx="40" cy="40" r="8" fill="var(--hanami-blush)" />
      </svg>
      <h2 className="font-display text-3xl font-light mb-3" style={{ color: "var(--hanami-deep)" }}>
        Giỏ hàng đang trống
      </h2>
      <p className="text-sm mb-8" style={{ color: "oklch(0.52 0.07 350)" }}>
        Hãy thêm sản phẩm vào giỏ trước khi thanh toán.
      </p>
      <Link
        href="/shop"
        className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.25em] uppercase font-medium text-white hover:opacity-90 transition-opacity"
        style={{ background: "linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)" }}
      >
        <ShoppingBag size={13} />
        Khám phá bộ sưu tập
      </Link>
    </div>
  );
}

// ─── Checkout Form ────────────────────────────────────────────────────────────

interface FormState {
  name:          string;
  phone:         string;
  province:      string;
  district:      string;
  ward:          string;
  addressDetail: string;
  note:          string;
  payment:       string;
}

const INIT: FormState = {
  name: "", phone: "", province: "", district: "", ward: "",
  addressDetail: "", note: "", payment: "cod",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim() || f.name.trim().length < 2)
    e.name = "Vui lòng nhập họ và tên (ít nhất 2 ký tự)";
  if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(f.phone.trim()))
    e.phone = "Số điện thoại không hợp lệ (10 chữ số, bắt đầu 03 / 05 / 07 / 08 / 09)";
  if (!f.province)
    e.province = "Vui lòng chọn tỉnh / thành phố";
  if (!f.district)
    e.district = "Vui lòng chọn quận / huyện";
  if (!f.ward)
    e.ward = "Vui lòng chọn phường / xã";
  if (!f.addressDetail.trim() || f.addressDetail.trim().length < 5)
    e.addressDetail = "Vui lòng nhập địa chỉ chi tiết (ít nhất 5 ký tự)";
  return e;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CheckoutClient() {
  const { items, cartTotal, clearCart } = useCart();

  const [form,      setForm]      = useState<FormState>(INIT);
  const [errors,    setErrors]    = useState<Errors>({});
  const [touched,   setTouched]   = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [placing,   setPlacing]   = useState(false);

  const districts = useMemo(() => DISTRICTS[form.province] ?? [], [form.province]);
  const wards     = useMemo(() => WARDS[form.district]     ?? [], [form.district]);

  // Cascade resets
  useEffect(() => { setForm((f) => ({ ...f, district: "", ward: "" })); }, [form.province]);
  useEffect(() => { setForm((f) => ({ ...f, ward: "" }));               }, [form.district]);

  // Live validation for touched fields
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate(form));
    }
  }, [form, touched]);

  const SHIPPING_FEE = cartTotal >= 1_000_000 ? 0 : 30_000;
  const DISCOUNT     = 0;
  const totalToPay   = cartTotal + SHIPPING_FEE - DISCOUNT;

  const set = (key: keyof FormState) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const touch = (key: keyof FormState) => () =>
    setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(INIT).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormState, boolean>
    );
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1400)); // simulate API
    clearCart();
    setPlacing(false);
    setSubmitted(true);
  };

  if (items.length === 0 && !submitted) return <EmptyCartView />;
  if (submitted) return <SuccessView name={form.name} />;

  const provinceName = PROVINCES.find((p) => p.id === form.province)?.name ?? "";
  const districtName = districts.find((d) => d.id === form.district)?.name ?? "";
  const wardName     = wards.find((w) => w.id === form.ward)?.name ?? "";

  return (
    <div className="min-h-screen pb-20 pt-[76px]" style={{ background: "var(--hanami-ivory)" }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div
        className="border-b border-pink-100"
        style={{ background: "white" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] tracking-wide text-pink-400/60 mb-4">
            <Link href="/"    className="hover:text-pink-500 transition-colors">Trang chủ</Link>
            <ChevronRight size={11} />
            <Link href="/shop" className="hover:text-pink-500 transition-colors">Cửa hàng</Link>
            <ChevronRight size={11} />
            <span style={{ color: "var(--hanami-rose)" }}>Thanh toán</span>
          </nav>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/shop"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-pink-50 transition-colors"
                style={{ borderColor: "rgba(236,72,153,0.25)", color: "var(--hanami-rose)" }}
              >
                <ArrowLeft size={15} />
              </Link>
              <div>
                <h1
                  className="font-display text-3xl sm:text-4xl font-light"
                  style={{ color: "var(--hanami-deep)" }}
                >
                  Thanh toán
                </h1>
                <p className="text-xs text-pink-400/50 mt-0.5">
                  {items.length} sản phẩm · {formatVND(cartTotal)}
                </p>
              </div>
            </div>

            {/* Trust badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "oklch(0.52 0.07 350)" }}>
              <ShieldCheck size={15} style={{ color: "var(--hanami-soft)" }} />
              Thanh toán an toàn & bảo mật
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-6 items-start"
      >
        {/* ════════════════════════════════════════════════════════════════════
            LEFT — Order Information Form
            ════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Section heading */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(236,72,153,0.1)" }}
            >
              <FileText size={14} style={{ color: "var(--hanami-rose)" }} />
            </div>
            <h2
              className="font-display text-2xl font-medium"
              style={{ color: "var(--hanami-deep)" }}
            >
              Thông tin đơn hàng
            </h2>
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-2xl border border-pink-100/80 p-6 sm:p-8 shadow-sm"
            style={{ boxShadow: "0 2px 20px rgba(249,168,212,0.10)" }}
          >
            {/* ── Row: Name ───────────────────────────────────────────────── */}
            <div className="mb-5">
              <FieldLabel icon={<User size={13} />} required>
                Họ và tên
              </FieldLabel>
              <Input
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                onBlur={touch("name")}
                className="rounded-xl h-12 text-sm transition-all duration-200"
                style={{
                  borderColor: errors.name && touched.name ? "rgb(239,68,68)" : undefined,
                  boxShadow: errors.name && touched.name ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                }}
              />
              <FieldError msg={touched.name ? errors.name : undefined} />
            </div>

            {/* ── Row: Phone ──────────────────────────────────────────────── */}
            <div className="mb-5">
              <FieldLabel icon={<Phone size={13} />} required>
                Số điện thoại
              </FieldLabel>
              <Input
                type="tel"
                placeholder="0901 234 567"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value.replace(/\s/g, ""))}
                onBlur={touch("phone")}
                maxLength={10}
                className="rounded-xl h-12 text-sm"
                style={{
                  borderColor: errors.phone && touched.phone ? "rgb(239,68,68)" : undefined,
                  boxShadow: errors.phone && touched.phone ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                }}
              />
              <FieldError msg={touched.phone ? errors.phone : undefined} />
            </div>

            {/* ── Divider ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "var(--hanami-blush)" }} />
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--hanami-soft)" }}>
                <MapPin size={10} />
                Địa chỉ giao hàng
              </div>
              <div className="flex-1 h-px" style={{ background: "var(--hanami-blush)" }} />
            </div>

            {/* ── Row: Province + District ─────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel icon={<MapPin size={13} />} required>
                  Tỉnh / Thành phố
                </FieldLabel>
                <div style={{ outline: errors.province && touched.province ? "3px solid rgba(239,68,68,0.12)" : undefined, borderRadius: 12 }}>
                  <StyledSelect
                    value={form.province}
                    onChange={(v) => { set("province")(v); touch("province")(); }}
                    placeholder="Chọn tỉnh / thành phố"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </StyledSelect>
                </div>
                <FieldError msg={touched.province ? errors.province : undefined} />
              </div>

              <div>
                <FieldLabel icon={<MapPin size={13} />} required>
                  Quận / Huyện
                </FieldLabel>
                <div style={{ outline: errors.district && touched.district ? "3px solid rgba(239,68,68,0.12)" : undefined, borderRadius: 12 }}>
                  <StyledSelect
                    value={form.district}
                    onChange={(v) => { set("district")(v); touch("district")(); }}
                    disabled={!form.province}
                    placeholder={form.province ? "Chọn quận / huyện" : "Chọn tỉnh trước"}
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </StyledSelect>
                </div>
                <FieldError msg={touched.district ? errors.district : undefined} />
              </div>
            </div>

            {/* ── Row: Ward ───────────────────────────────────────────────── */}
            <div className="mb-5">
              <FieldLabel icon={<MapPin size={13} />} required>
                Phường / Xã
              </FieldLabel>
              <div style={{ outline: errors.ward && touched.ward ? "3px solid rgba(239,68,68,0.12)" : undefined, borderRadius: 12 }}>
                <StyledSelect
                  value={form.ward}
                  onChange={(v) => { set("ward")(v); touch("ward")(); }}
                  disabled={!form.district}
                  placeholder={form.district ? "Chọn phường / xã" : "Chọn quận trước"}
                >
                  {wards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </StyledSelect>
              </div>
              <FieldError msg={touched.ward ? errors.ward : undefined} />
            </div>

            {/* ── Row: Address Detail ─────────────────────────────────────── */}
            <div className="mb-5">
              <FieldLabel icon={<MapPin size={13} />} required>
                Địa chỉ chi tiết
              </FieldLabel>
              <Input
                type="text"
                placeholder="Số nhà, tên đường, tòa nhà..."
                value={form.addressDetail}
                onChange={(e) => set("addressDetail")(e.target.value)}
                onBlur={touch("addressDetail")}
                className="rounded-xl h-12 text-sm"
                style={{
                  borderColor: errors.addressDetail && touched.addressDetail ? "rgb(239,68,68)" : undefined,
                  boxShadow: errors.addressDetail && touched.addressDetail ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                }}
              />
              <FieldError msg={touched.addressDetail ? errors.addressDetail : undefined} />

              {/* Address preview */}
              {wardName && (
                <p
                  className="mt-2 text-[11px] leading-5 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(236,72,153,0.04)", color: "oklch(0.52 0.07 350)", border: "1px solid rgba(236,72,153,0.1)" }}
                >
                  <span className="text-pink-300 mr-1">✦</span>
                  {form.addressDetail ? `${form.addressDetail}, ` : ""}{wardName}, {districtName}, {provinceName}
                </p>
              )}
            </div>

            {/* ── Row: Note ───────────────────────────────────────────────── */}
            <div>
              <FieldLabel icon={<FileText size={13} />}>
                Ghi chú đơn hàng
              </FieldLabel>
              <Textarea
                placeholder="Yêu cầu đặc biệt, thời gian giao hàng mong muốn, lời nhắn tặng quà..."
                value={form.note}
                onChange={(e) => set("note")(e.target.value)}
                className="rounded-xl text-sm resize-none"
                rows={3}
              />
              <p className="mt-1 text-[10px]" style={{ color: "oklch(0.68 0.08 352)" }}>
                Không bắt buộc · Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn
              </p>
            </div>
          </div>

          {/* Trust indicators (mobile-only, below form) */}
          <div className="flex lg:hidden items-center justify-center gap-6 py-2">
            {[
              { icon: <ShieldCheck size={14} />, label: "Thanh toán an toàn" },
              { icon: <Truck size={14} />,       label: "Giao hàng toàn quốc" },
              { icon: <Flower2 size={14} />,     label: "Hàng thủ công chính hãng" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px]" style={{ color: "oklch(0.52 0.07 350)" }}>
                <span style={{ color: "var(--hanami-soft)" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT — Order Summary (Sticky)
            ════════════════════════════════════════════════════════════════════ */}
        <div className="lg:sticky lg:top-28 space-y-4">

          {/* Section heading */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(236,72,153,0.1)" }}
            >
              <ShoppingBag size={14} style={{ color: "var(--hanami-rose)" }} />
            </div>
            <h2 className="font-display text-2xl font-medium" style={{ color: "var(--hanami-deep)" }}>
              Đơn hàng của bạn
            </h2>
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-2xl border border-pink-100/80 overflow-hidden"
            style={{ boxShadow: "0 2px 20px rgba(249,168,212,0.10)" }}
          >
            {/* ── Product List ─────────────────────────────────────────────── */}
            <div className="p-5 space-y-3">
              {items.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex gap-4 items-start p-3 rounded-xl transition-colors hover:bg-pink-50/40"
                  style={{ border: "1px solid rgba(236,72,153,0.08)" }}
                >
                  <FlowerThumb gradient={product.gradient} petals={product.petals} />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className="font-display text-base leading-snug mb-0.5 truncate"
                      style={{ color: "var(--hanami-deep)" }}
                    >
                      {product.nameVi}
                    </p>
                    <p className="text-[10px] tracking-wide mb-2" style={{ color: "oklch(0.68 0.08 352)" }}>
                      {product.nameEn}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] px-2.5 py-0.5 rounded-full"
                        style={{ background: "var(--hanami-pale)", color: "var(--hanami-rose)" }}
                      >
                        x{qty}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--hanami-rose)" }}>
                        {formatVND(product.price * qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Price Breakdown ──────────────────────────────────────────── */}
            <div
              className="px-5 py-4 space-y-2.5"
              style={{ borderTop: "1px dashed rgba(249,168,212,0.35)", background: "rgba(253,245,240,0.4)" }}
            >
              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "oklch(0.52 0.07 350)" }}>Tổng cộng</span>
                <span style={{ color: "var(--hanami-deep)" }}>{formatVND(cartTotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1.5" style={{ color: "oklch(0.52 0.07 350)" }}>
                  <Truck size={12} className="opacity-60" />
                  Phí vận chuyển
                </span>
                {SHIPPING_FEE === 0 ? (
                  <span className="text-emerald-600 text-xs font-medium">Miễn phí</span>
                ) : (
                  <span style={{ color: "var(--hanami-deep)" }}>{formatVND(SHIPPING_FEE)}</span>
                )}
              </div>
              {SHIPPING_FEE > 0 && (
                <p className="text-[10px] pl-5" style={{ color: "oklch(0.68 0.08 352)" }}>
                  Miễn phí vận chuyển cho đơn hàng từ {formatVND(1_000_000)}
                </p>
              )}

              {/* Discount */}
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: "oklch(0.52 0.07 350)" }}>Giảm giá</span>
                <span style={{ color: DISCOUNT > 0 ? "var(--hanami-rose)" : "oklch(0.52 0.07 350)" }}>
                  {DISCOUNT > 0 ? `– ${formatVND(DISCOUNT)}` : "—"}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: "rgba(236,72,153,0.15)" }} />

              {/* Total */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium" style={{ color: "var(--hanami-deep)" }}>
                  Tổng thanh toán
                </span>
                <span
                  className="font-display text-2xl font-semibold"
                  style={{ color: "var(--hanami-rose)" }}
                >
                  {formatVND(totalToPay)}
                </span>
              </div>
            </div>

            {/* ── Payment Method ───────────────────────────────────────────── */}
            <div
              className="px-5 py-4"
              style={{ borderTop: "1px solid rgba(236,72,153,0.1)" }}
            >
              <p
                className="text-[10px] tracking-[0.2em] uppercase mb-3 font-medium"
                style={{ color: "var(--hanami-rose)" }}
              >
                Phương thức thanh toán
              </p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => {
                  const active = form.payment === m.id;
                  return (
                    <label
                      key={m.id}
                      className="flex items-start gap-3 rounded-xl p-3.5 cursor-pointer transition-all duration-200 select-none"
                      style={{
                        border: `1.5px solid ${active ? "rgba(236,72,153,0.45)" : "rgba(249,168,212,0.25)"}`,
                        background: active ? "rgba(236,72,153,0.04)" : "transparent",
                        boxShadow: active ? "0 0 0 3px rgba(249,168,212,0.15)" : "none",
                      }}
                    >
                      {/* Custom radio */}
                      <div className="mt-0.5 flex-shrink-0">
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={active}
                          onChange={() => set("payment")(m.id)}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                          style={{
                            borderColor: active ? "var(--hanami-pink)" : "oklch(0.68 0.08 352)",
                          }}
                        >
                          {active && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: "var(--hanami-pink)" }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Icon + text */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active ? "rgba(236,72,153,0.1)" : "oklch(0.965 0.018 350)",
                          color: active ? "var(--hanami-rose)" : "oklch(0.52 0.07 350)",
                        }}
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium leading-tight"
                          style={{ color: active ? "var(--hanami-deep)" : "oklch(0.38 0.14 352)" }}
                        >
                          {m.label}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: "oklch(0.68 0.08 352)" }}>
                          {m.sublabel}
                        </p>
                      </div>
                      {active && (
                        <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--hanami-pink)" }} />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Place Order Button ───────────────────────────────────────── */}
            <div className="px-5 pb-5 pt-2">
              <button
                type="submit"
                disabled={placing}
                className="w-full h-[54px] rounded-full text-[11px] tracking-[0.3em] uppercase font-medium text-white flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden disabled:opacity-80"
                style={{
                  background: placing
                    ? "linear-gradient(135deg, #f9a8d4 0%, #f472b6 100%)"
                    : "linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)",
                  boxShadow: placing ? "none" : "0 6px 28px rgba(236,72,153,0.35)",
                }}
              >
                {/* Shimmer effect */}
                {!placing && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                      animation: "shimmer-sweep 2.5s ease-in-out infinite",
                    }}
                  />
                )}

                {placing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Package size={14} />
                    Đặt hàng ngay
                    <ChevronRight size={14} />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] mt-3 flex items-center justify-center gap-1.5" style={{ color: "oklch(0.68 0.08 352)" }}>
                <ShieldCheck size={11} style={{ color: "var(--hanami-soft)" }} />
                Thông tin của bạn được bảo mật tuyệt đối
              </p>
            </div>
          </div>

          {/* Trust indicators (desktop) */}
          <div className="hidden lg:grid grid-cols-3 gap-2">
            {[
              { icon: <ShieldCheck size={14} />, label: "Bảo mật" },
              { icon: <Truck size={14} />,       label: "Toàn quốc" },
              { icon: <Flower2 size={14} />,     label: "Thủ công" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-center"
                style={{ background: "white", border: "1px solid rgba(236,72,153,0.1)" }}
              >
                <span style={{ color: "var(--hanami-soft)" }}>{icon}</span>
                <span className="text-[10px] tracking-wide" style={{ color: "oklch(0.52 0.07 350)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
