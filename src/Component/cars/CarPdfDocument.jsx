import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image
} from "@react-pdf/renderer";

// تسجيل الخط (تأكد من وجود الملف في مجلد public/fonts)
Font.register({
  family: "ArabicFont",
  src: "/fonts/Cairo-Regular.ttf"
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "ArabicFont",
    direction: "rtl",
    backgroundColor: "#ffffff"
  },
  // الهيدر (العنوان والشعار)
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#2c6d2c",
    paddingBottom: 15,
    marginBottom: 20
  },
  title: { fontSize: 22, color: "#2c6d2c", fontWeight: "bold" },
  qrCode: { width: 70, height: 70 },

  // قسم الصورة والمعلومات الأساسية
  mainInfo: { flexDirection: "row-reverse", marginBottom: 20, gap: 20 },
  carImage: { width: "50%", height: 180, borderRadius: 8, objectFit: "cover" },
  basicDetails: { width: "50%", justifyContent: "center" },
  priceTag: {
    fontSize: 18,
    color: "#e40d0d",
    marginBottom: 10,
    fontWeight: "bold"
  },

  // الجداول والمعلومات الفنية
  sectionTitle: {
    fontSize: 16,
    backgroundColor: "#f4f4f4",
    padding: 5,
    paddingRight: 10,
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
    borderRightWidth: 4,
    borderRightColor: "#2c6d2c"
  },
  grid: { flexDirection: "row-reverse", flexWrap: "wrap", marginBottom: 15 },
  gridItem: { width: "33%", marginBottom: 8, paddingRight: 5 },
  label: { fontSize: 10, color: "#777" },
  value: { fontSize: 12, color: "#222" },

  // الوصف والميزات
  description: {
    fontSize: 11,
    color: "#555",
    marginBottom: 15,
    textAlign: "right",
    lineHeight: 1.5
  },
  featureList: { fontSize: 10, color: "#444", marginBottom: 5 }
});

const CarPdfDocument = ({ car }) => {
  // دالة لتحويل أسماء الأنواع من الإنجليزية للعربية
  const translate = (val) => {
    const dict = {
      automatic: "أوتوماتيك",
      normal: "عادي",
      gasoline: "بنزين",
      diesel: "ديزل",
      electricity: "كهرباء",
      Hybrid: "هايبرد",
      available: "متوفرة",
      sold: "تم البيع",
      km: "كم",
      mi: "ميل"
    };
    return dict[val] || val;
  };

  const getSafeImageUrl = (url) => {
    if (!url) return null;
    // يقوم الكود أدناه باستبدال آخر نقطة وما بعدها بـ .jpg
    return url.replace(/\.[^/.]+$/, ".jpg");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* الهيدر: اسم السيارة والـ QR */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {car.brand} {car.model}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              سنة الصنع: {car.year} | {car.bodyType}
            </Text>
          </View>
          {car.qrCode && (
            <Image
              style={styles.qrCode}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${car.qrCode}`}
            />
          )}
        </View>

        {/* القسم الرئيسي: الصورة والسعر */}
        <View style={styles.mainInfo}>
          {car.images && car.images[0] && (
            <Image
              style={styles.carImage}
              src={getSafeImageUrl(car.images[0])}
            />
          )}
          <View style={styles.basicDetails}>
            <Text style={styles.priceTag}>
              السعر: {car.price.toLocaleString()} $
            </Text>
            <Text style={styles.value}>الحالة: {translate(car.status)}</Text>
            <Text style={styles.value}>اللون: {car.color}</Text>
            <Text style={styles.value}>
              المسافة: {car.mileage.value} {translate(car.mileage.unit)}
            </Text>
          </View>
        </View>

        {/* بيانات المحرك */}
        <Text style={styles.sectionTitle}>مواصفات المحرك والأداء</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>ناقل الحركة</Text>
            <Text style={styles.value}>
              {translate(car.engine.transmission)}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>نوع الوقود</Text>
            <Text style={styles.value}>{translate(car.engine.fulType)}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>قوة الحصان</Text>
            <Text style={styles.value}>{car.engine.horsepower} hp</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>السعة (CC)</Text>
            <Text style={styles.value}>{car.engine.capacityCC}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>السعة (لتر)</Text>
            <Text style={styles.value}>{car.engine.capacityLitre} L</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>السلندرات</Text>
            <Text style={styles.value}>{car.engine.cylinders}</Text>
          </View>
        </View>

        {/* الوصف */}
        <Text style={styles.sectionTitle}>وصف السيارة</Text>
        <Text style={styles.description}>
          {car.description || "لا يوجد وصف متاح لهذه السيارة."}
        </Text>

        {/* الميزات */}
        <View style={{ flexDirection: "row-reverse", gap: 20 }}>
          <View style={{ width: "33%" }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>
              ميزات الأمان
            </Text>
            {car.safetyFeatures.map((f, i) => (
              <Text key={i} style={styles.featureList}>
                • {f}
              </Text>
            ))}
          </View>
          <View style={{ width: "33%" }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>
              الراحة والرفاهية
            </Text>
            {car.comfortFeatures.map((f, i) => (
              <Text key={i} style={styles.featureList}>
                • {f}
              </Text>
            ))}
          </View>
          <View style={{ width: "33%" }}>
            <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>
              التكنولوجيا
            </Text>
            {car.techFeatures.map((f, i) => (
              <Text key={i} style={styles.featureList}>
                • {f}
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CarPdfDocument;
