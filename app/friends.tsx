import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS, FONTS, RADIUS, SPACING } from "../src/constants/theme";
import { useFriendsStore, type UserSearchResult } from "../src/store/friends-store";
import { useProfileStore } from "../src/store/profile-store";

export default function FriendsScreen() {
  const profile = useProfileStore((state) => state.profile);
  const friends = useFriendsStore((state) => state.friends);
  const incomingRequests = useFriendsStore((state) => state.incomingRequests);
  const searchResults = useFriendsStore((state) => state.searchResults);
  const searching = useFriendsStore((state) => state.searching);
  const subscribe = useFriendsStore((state) => state.subscribe);
  const searchUsers = useFriendsStore((state) => state.searchUsers);
  const sendFriendRequest = useFriendsStore((state) => state.sendFriendRequest);
  const respondToRequest = useFriendsStore((state) => state.respondToRequest);

  const [term, setTerm] = useState("");
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }
    return subscribe(profile.uid);
  }, [profile, subscribe]);

  useEffect(() => {
    if (!profile) {
      return;
    }
    const timer = setTimeout(() => searchUsers(profile.uid, term), 300);
    return () => clearTimeout(timer);
  }, [term, profile, searchUsers]);

  if (!profile) {
    return <GradientBackground />;
  }

  async function handleSendRequest(result: UserSearchResult) {
    setFeedback(null);
    const sent = await sendFriendRequest(profile!.uid, profile!.displayName, result);
    if (sent) {
      setSentTo((prev) => [...prev, result.uid]);
    } else {
      setFeedback("Zaten bir isteğiniz var ya da arkadaşsınız.");
    }
  }

  return (
    <GradientBackground edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Arkadaş Ekle">
          <TextInput
            value={term}
            onChangeText={setTerm}
            placeholder="Kullanıcı adı ara…"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
          {feedback && <Text style={styles.feedbackText}>{feedback}</Text>}
          {searching && <Text style={styles.helperText}>Aranıyor…</Text>}
          {!searching &&
            term.trim().length > 0 &&
            searchResults.map((result) => {
              const alreadySent = sentTo.includes(result.uid);
              const alreadyFriend = friends.some((f) => f.uid === result.uid);
              return (
                <View key={result.uid} style={styles.row}>
                  <Text style={styles.rowName}>{result.displayName}</Text>
                  <Pressable
                    style={[styles.addButton, (alreadySent || alreadyFriend) && styles.addButtonDone]}
                    onPress={() => handleSendRequest(result)}
                    disabled={alreadySent || alreadyFriend}
                  >
                    <Text style={styles.addButtonText}>
                      {alreadyFriend ? "Arkadaş" : alreadySent ? "Gönderildi" : "İstek Gönder"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          {!searching && term.trim().length > 0 && searchResults.length === 0 && (
            <Text style={styles.helperText}>Kimse bulunamadı.</Text>
          )}
        </Section>

        {incomingRequests.length > 0 && (
          <Section title="Gelen İstekler">
            {incomingRequests.map((request) => (
              <View key={request.id} style={styles.row}>
                <Text style={styles.rowName}>{request.fromDisplayName}</Text>
                <View style={styles.requestActions}>
                  <Pressable
                    style={styles.declineButton}
                    onPress={() => respondToRequest(request.id, false)}
                  >
                    <Text style={styles.declineButtonText}>Reddet</Text>
                  </Pressable>
                  <Pressable
                    style={styles.acceptButton}
                    onPress={() => respondToRequest(request.id, true)}
                  >
                    <Text style={styles.acceptButtonText}>Kabul Et</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </Section>
        )}

        <Section title="Arkadaşlarım">
          {friends.length === 0 ? (
            <Text style={styles.helperText}>Henüz arkadaşın yok.</Text>
          ) : (
            friends.map((friend) => (
              <View key={friend.uid} style={styles.row}>
                <Text style={styles.rowName}>{friend.displayName}</Text>
              </View>
            ))
          )}
        </Section>
      </ScrollView>
    </GradientBackground>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  section: {
    gap: SPACING.sm,
    backgroundColor: COLORS.panel,
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.goldBright,
    fontFamily: FONTS.heading,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  feedbackText: {
    color: "#F0A99E",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  rowName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.gold,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  addButtonDone: {
    backgroundColor: COLORS.slate,
  },
  addButtonText: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.headingBold,
    fontSize: 12,
  },
  requestActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  acceptButton: {
    backgroundColor: COLORS.mint,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  acceptButtonText: {
    color: COLORS.feltBottom,
    fontFamily: FONTS.headingBold,
    fontSize: 12,
  },
  declineButton: {
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  declineButtonText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
