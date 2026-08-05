import {
  addDoc,
  collection,
  doc,
  endAt,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAt,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { create } from "zustand";
import { firestore } from "../config/firebase";

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromDisplayName: string;
  toUid: string;
  toDisplayName: string;
  status: "pending" | "accepted" | "declined";
  createdAt: number;
}

export interface FriendSummary {
  uid: string;
  displayName: string;
}

export interface UserSearchResult {
  uid: string;
  displayName: string;
}

const MAX_SEARCH_RESULTS = 10;

// There's no `friends` subcollection to keep in sync on both sides — an
// accepted friendRequest document *is* the friendship. Each user's friends
// list is just "every request I'm a party to that's accepted", read as two
// queries (one per role) and merged, rather than needing a Cloud Function to
// mirror the relationship into both users' documents.
function friendFromRequest(request: FriendRequest, myUid: string): FriendSummary {
  return request.fromUid === myUid
    ? { uid: request.toUid, displayName: request.toDisplayName }
    : { uid: request.fromUid, displayName: request.fromDisplayName };
}

function requestFromDoc(id: string, data: Record<string, unknown>): FriendRequest {
  return {
    id,
    fromUid: data.fromUid as string,
    fromDisplayName: data.fromDisplayName as string,
    toUid: data.toUid as string,
    toDisplayName: data.toDisplayName as string,
    status: data.status as FriendRequest["status"],
    createdAt: data.createdAt as number,
  };
}

interface FriendsStore {
  friends: FriendSummary[];
  incomingRequests: FriendRequest[];
  searchResults: UserSearchResult[];
  searching: boolean;

  // Sets up live listeners for this user's friends + incoming requests.
  // Returns an unsubscribe function — call it from the screen's effect
  // cleanup so listeners don't leak across mounts.
  subscribe: (uid: string) => Unsubscribe;
  searchUsers: (uid: string, term: string) => Promise<void>;
  // Resolves false if a request already exists between these two users
  // (pending or accepted) instead of creating a duplicate.
  sendFriendRequest: (
    fromUid: string,
    fromDisplayName: string,
    toUser: UserSearchResult
  ) => Promise<boolean>;
  respondToRequest: (requestId: string, accept: boolean) => Promise<void>;
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  incomingRequests: [],
  searchResults: [],
  searching: false,

  subscribe: (uid) => {
    const sentQuery = query(
      collection(firestore, "friendRequests"),
      where("fromUid", "==", uid),
      where("status", "==", "accepted")
    );
    const receivedQuery = query(
      collection(firestore, "friendRequests"),
      where("toUid", "==", uid),
      where("status", "==", "accepted")
    );
    const incomingQuery = query(
      collection(firestore, "friendRequests"),
      where("toUid", "==", uid),
      where("status", "==", "pending")
    );

    let sentAccepted: FriendRequest[] = [];
    let receivedAccepted: FriendRequest[] = [];

    function recomputeFriends() {
      const all = [...sentAccepted, ...receivedAccepted];
      set({ friends: all.map((request) => friendFromRequest(request, uid)) });
    }

    const unsubSent = onSnapshot(sentQuery, (snapshot) => {
      sentAccepted = snapshot.docs.map((d) => requestFromDoc(d.id, d.data()));
      recomputeFriends();
    });
    const unsubReceived = onSnapshot(receivedQuery, (snapshot) => {
      receivedAccepted = snapshot.docs.map((d) => requestFromDoc(d.id, d.data()));
      recomputeFriends();
    });
    const unsubIncoming = onSnapshot(incomingQuery, (snapshot) => {
      set({
        incomingRequests: snapshot.docs.map((d) => requestFromDoc(d.id, d.data())),
      });
    });

    return () => {
      unsubSent();
      unsubReceived();
      unsubIncoming();
      set({ friends: [], incomingRequests: [] });
    };
  },

  searchUsers: async (uid, term) => {
    const prefix = term.trim().toLowerCase();
    if (!prefix) {
      set({ searchResults: [], searching: false });
      return;
    }
    set({ searching: true });
    // Classic Firestore "starts with" trick: displayNameLower in
    // [prefix, prefix + highest-codepoint-char) is exactly the set of
    // strings that start with prefix. Guests are excluded from search
    // entirely — no display name is reserved for them, so there's nothing
    // meaningful to add.
    const usersQuery = query(
      collection(firestore, "users"),
      where("isGuest", "==", false),
      orderBy("displayNameLower"),
      startAt(prefix),
      endAt(prefix + ""),
      limit(MAX_SEARCH_RESULTS)
    );
    const snapshot = await getDocs(usersQuery);
    const results = snapshot.docs
      .map((d) => ({ uid: d.id, displayName: d.data().displayName as string }))
      .filter((result) => result.uid !== uid);
    set({ searchResults: results, searching: false });
  },

  sendFriendRequest: async (fromUid, fromDisplayName, toUser) => {
    const existingQueries = await Promise.all(
      [
        query(
          collection(firestore, "friendRequests"),
          where("fromUid", "==", fromUid),
          where("toUid", "==", toUser.uid)
        ),
        query(
          collection(firestore, "friendRequests"),
          where("fromUid", "==", toUser.uid),
          where("toUid", "==", fromUid)
        ),
      ].map((q) => getDocs(q))
    );
    const alreadyExists = existingQueries.some((snapshot) =>
      snapshot.docs.some((d) => d.data().status !== "declined")
    );
    if (alreadyExists) {
      return false;
    }

    await addDoc(collection(firestore, "friendRequests"), {
      fromUid,
      fromDisplayName,
      toUid: toUser.uid,
      toDisplayName: toUser.displayName,
      status: "pending",
      createdAt: Date.now(),
    });
    return true;
  },

  respondToRequest: async (requestId, accept) => {
    await updateDoc(doc(firestore, "friendRequests", requestId), {
      status: accept ? "accepted" : "declined",
    });
    set({
      incomingRequests: get().incomingRequests.filter((request) => request.id !== requestId),
    });
  },
}));
