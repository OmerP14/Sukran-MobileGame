import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, SPACING } from "../src/constants/theme";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Amaç",
    body: "4 oyuncu (1 gerçek oyuncu, 3 bot) 52 kartlık desteyle oynar. Her oyuncuya 13 kart dağıtılır. Amaç, aynı değere sahip 4 kartı toplamaktır (örn. 4 Papaz).",
  },
  {
    title: "Kart isteme",
    body: 'Sıra sende iken bir rakip, bir kart değeri ve 1-4 arası bir adet seçip "Kart İste" dersin. İstediğin karttan kendi elinde bulunması şart değildir.',
  },
  {
    title: "Kartların verilmesi",
    body: 'Rakipte istediğin sayı kadar (veya daha fazla) o karttan varsa, tam istediğin sayı kadar kart sana verilir. Rakipte yeterli kart yoksa hiç kart verilmez, yalnızca "Yok" cevabı gösterilir.',
  },
  {
    title: "Sıra kime geçer?",
    body: 'İstek başarılıysa Şükran aşaması başlar. "Yok" cevabı gelirse sıra doğrudan istek yapılan oyuncuya geçer.',
  },
  {
    title: "Şükran",
    body: "Başarılı bir istekten sonra ekranda ŞÜKRAN butonu belirir. Süre dolmadan basarsan sıran devam eder ve yeniden kart isteyebilirsin. Basmazsan sıra, kartları verdiğin oyuncuya geçer.",
  },
  {
    title: "Dörtlü tamamlama",
    body: "Elinde aynı değerden 4 kart oluştuğunda bu kartlar otomatik olarak elinden çıkar ve senin tamamladığın setlere eklenir.",
  },
  {
    title: "Oyunun bitişi",
    body: "13 farklı kart değerinin tamamı birileri tarafından tamamlandığında oyun biter. En çok dörtlü toplayan oyuncu kazanır. Eşitlik varsa birden fazla kazanan olabilir.",
  },
];

export default function RulesScreen() {
  return (
    <GradientBackground edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },
  section: {
    gap: SPACING.xs,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
    paddingLeft: SPACING.sm,
  },
  title: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 16,
  },
  body: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});
