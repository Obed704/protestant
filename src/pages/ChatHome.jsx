// src/pages/ChatHome.jsx
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import EnhancedHeader from "../components/header.jsx";
import Footer from "../components/footer.jsx";
import { createSocket } from "../utils/socket.js";
import {
  Search,
  Users,
  MessageCircle,
  Send,
  ArrowLeft,
  Reply,
  Forward,
  X,
  CheckCircle,
  RefreshCw,
  Bell,
  BellOff,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_CHAT = `${API_BASE_URL}/api/chat`;
const API_USERS = `${API_BASE_URL}/api/users`;

/* ---------------- Helpers ---------------- */

const strId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    const any = v._id || v.id || v.userId;
    if (any) return strId(any);
    try {
      return String(v);
    } catch {
      return "";
    }
  }
  return String(v);
};

const makeKey = (type, id) => `${type}:${String(id)}`;

const loadJSON = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

const absUrl = (url, base) => {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  return `${base}${s.startsWith("/") ? s : `/${s}`}`;
};

const formatTime = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const initialsOf = (nameOrEmail = "") => {
  const s = String(nameOrEmail || "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

// ProfilePage-style avatar (square, border, fallback initials)
function Avatar({ label, src, size = 40 }) {
  const [broken, setBroken] = useState(false);
  const initials = initialsOf(label);

  const box = { width: size, height: size };

  return (
    <div
      className="rounded-2xl overflow-hidden border bg-gray-100 shrink-0"
      style={box}
      title={label || ""}
    >
      {src && !broken ? (
        <img
          src={src}
          alt={label || "avatar"}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
          {initials}
        </div>
      )}
    </div>
  );
}

// tiny silent wav (browser may block autoplay until user interacts)
const BEEP =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export default function ChatHome() {
  const { user, token, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const myId = strId(user?._id || user?.id);

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  /* ---------------- Sidebar data ---------------- */
  const [dms, setDms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  // show skeleton only on first load
  const [sidebarReady, setSidebarReady] = useState(false);
  const [sidebarRefreshing, setSidebarRefreshing] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  /* ---------------- Active chat + messages ---------------- */
  const [active, setActive] = useState(null); // { type:"dm"|"group", id, title, meta }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  /* ---------------- Composer ---------------- */
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  /* ---------------- Forward modal ---------------- */
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [forwardTargets, setForwardTargets] = useState([]); // {type,id,title,avatarSrc?}
  const [targetSearch, setTargetSearch] = useState("");

  /* ---------------- Socket ---------------- */
  const socketRef = useRef(null);
  const activeRef = useRef(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const dmsRef = useRef([]);
  useEffect(() => {
    dmsRef.current = dms;
  }, [dms]);

  /* ---------------- Unread / Needs reply / Toast / Notifications ---------------- */
  const [unread, setUnread] = useState(() => loadJSON("chat_unread_v3", {}));
  const [needsReply, setNeedsReply] = useState(() =>
    loadJSON("chat_needsreply_v3", {})
  );
  const [muted, setMuted] = useState(
    () => localStorage.getItem("chat_muted_v3") === "1"
  );
  const [toast, setToast] = useState(null); // { key, title, text, openTo:{type,id} }

  const [notifEnabled, setNotifEnabled] = useState(() => {
    return (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    );
  });

  const beepRef = useRef(null);
  useEffect(() => {
    beepRef.current = new Audio(BEEP);
  }, []);

  useEffect(() => saveJSON("chat_unread_v3", unread), [unread]);
  useEffect(() => saveJSON("chat_needsreply_v3", needsReply), [needsReply]);
  useEffect(
    () => localStorage.setItem("chat_muted_v3", muted ? "1" : "0"),
    [muted]
  );

  const playBeep = useCallback(() => {
    if (muted) return;
    const a = beepRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play();
    } catch {}
  }, [muted]);

  const requestNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") {
      alert("Browser notifications not supported.");
      return;
    }
    try {
      const p = await Notification.requestPermission();
      setNotifEnabled(p === "granted");
    } catch {}
  }, []);

  const pushBrowserNotification = useCallback(
    (title, body, openTo) => {
      if (!notifEnabled || typeof Notification === "undefined") return;
      try {
        const n = new Notification(title, { body });
        n.onclick = () => {
          window.focus();
          if (openTo?.type === "dm") navigate(`/chat?dm=${openTo.id}`);
          if (openTo?.type === "group") navigate(`/chat?group=${openTo.id}`);
          n.close();
        };
      } catch {}
    },
    [notifEnabled, navigate]
  );

  const bumpUnread = useCallback((key) => {
    setUnread((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, []);

  const clearUnread = useCallback((key) => {
    setUnread((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const markNeedsReply = useCallback((key) => {
    setNeedsReply((prev) => ({ ...prev, [key]: true }));
  }, []);

  const clearNeedsReply = useCallback((key) => {
    setNeedsReply((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const showToast = useCallback((payload) => {
    setToast(payload);
    const key = payload?.key;
    setTimeout(() => {
      setToast((t) => (t?.key === key ? null : t));
    }, 6000);
  }, []);

  // Tab title unread total
  useEffect(() => {
    const total = Object.values(unread).reduce(
      (a, b) => a + (Number(b) || 0),
      0
    );
    document.title = total > 0 ? `(${total}) Church Chat` : "Church Chat";
  }, [unread]);

  /* ---------------- Scroll ---------------- */
  const bottomRef = useRef(null);
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  /* ---------------- Sidebar preview bumping ---------------- */
  const bumpDmPreview = useCallback((conversationId, lastText, atISO) => {
    setDms((prev) => {
      const idx = prev.findIndex((d) => strId(d._id) === strId(conversationId));
      if (idx === -1) return prev;

      const updated = {
        ...prev[idx],
        lastMessageText: lastText ?? prev[idx].lastMessageText,
        lastMessageAt: atISO ?? new Date().toISOString(),
      };

      const next = [...prev];
      next.splice(idx, 1);
      return [updated, ...next];
    });
  }, []);

  const bumpGroupPreview = useCallback((groupId, lastText, atISO) => {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => strId(g._id) === strId(groupId));
      if (idx === -1) return prev;

      const updated = {
        ...prev[idx],
        lastMessageText: lastText ?? prev[idx].lastMessageText,
        lastMessageAt: atISO ?? new Date().toISOString(),
      };

      const next = [...prev];
      next.splice(idx, 1);
      return [updated, ...next];
    });
  }, []);

  /* ---------------- Load sidebar ---------------- */
  const loadSidebar = useCallback(
    async ({ silent = false } = {}) => {
      if (!token || !myId) return;

      try {
        if (!silent) setSidebarReady(false);
        else setSidebarRefreshing(true);

        const [dmRes, groupRes] = await Promise.all([
          axios.get(`${API_CHAT}/dm`, { headers: authHeaders }),
          axios.get(`${API_CHAT}/groups/mine`, { headers: authHeaders }),
        ]);

        const dmList = dmRes.data || [];
        const allGroups = groupRes.data || [];

        const invites = allGroups.filter((g) =>
          (g.invites || []).some(
            (i) => strId(i.userId) === myId && i.status === "pending"
          )
        );

        const myGroups = allGroups.filter((g) =>
          (g.members || []).some((m) => strId(m.userId) === myId)
        );

        setDms(dmList);
        setPendingInvites(invites);
        setGroups(myGroups);
        setSidebarReady(true);
      } catch (e) {
        console.error("Sidebar load failed", e);
        if (!silent) setSidebarReady(true);
      } finally {
        setSidebarRefreshing(false);
      }
    },
    [token, myId, authHeaders]
  );

  /* ---------------- Guards ---------------- */
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setDms([]);
      setGroups([]);
      setPendingInvites([]);
      setActive(null);
      setMessages([]);
      setReplyTo(null);
      setText("");
      setSidebarReady(false);
    }
  }, [authLoading, token]);

  useEffect(() => {
    if (!token || authLoading) return;
    loadSidebar({ silent: false });
  }, [token, authLoading, loadSidebar]);

  /* ---------------- Load messages ---------------- */
  const loadMessages = useCallback(
    async (target) => {
      if (!token) return;
      setLoadingMessages(true);

      try {
        if (target.type === "dm") {
          const res = await axios.get(
            `${API_CHAT}/dm/${target.id}/messages?limit=60`,
            { headers: authHeaders }
          );
          setMessages(res.data || []);
        } else {
          const res = await axios.get(
            `${API_CHAT}/groups/${target.id}/messages?limit=60`,
            { headers: authHeaders }
          );
          setMessages(res.data || []);
        }
        setTimeout(scrollToBottom, 50);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [token, authHeaders, scrollToBottom]
  );

  /* ---------------- Open DM/Group ---------------- */
  const openDm = useCallback(
    (dm) => {
      const title =
        dm?.otherUser?.fullName || dm?.otherUser?.email || "Direct chat";
      const target = { type: "dm", id: dm._id, title, meta: dm };
      setActive(target);
      setReplyTo(null);
      setText("");

      const k = makeKey("dm", dm._id);
      clearUnread(k);

      loadMessages(target);
    },
    [clearUnread, loadMessages]
  );

  const openGroup = useCallback(
    (g) => {
      const target = { type: "group", id: g._id, title: g.name, meta: g };
      setActive(target);
      setReplyTo(null);
      setText("");

      const k = makeKey("group", g._id);
      clearUnread(k);

      loadMessages(target);
    },
    [clearUnread, loadMessages]
  );

  // If opened DM via query param and meta was empty, fix title/meta when sidebar loads
  useEffect(() => {
    if (!active) return;
    if (active.type !== "dm") return;
    const found = dms.find((d) => strId(d._id) === strId(active.id));
    if (!found?.otherUser) return;

    const betterTitle =
      found.otherUser.fullName || found.otherUser.email || active.title;

    const needsUpdate =
      !active?.meta?.otherUser?.fullName &&
      !active?.meta?.otherUser?.email &&
      betterTitle !== active.title;

    if (needsUpdate) {
      setActive((prev) =>
        prev ? { ...prev, title: betterTitle, meta: found } : prev
      );
    }
  }, [active, dms]);

  /* ---------------- Auto-open from URL ---------------- */
  useEffect(() => {
    if (!token || authLoading) return;
    if (!sidebarReady) return;
    if (active) return;

    const dmToOpen = searchParams.get("dm");
    const groupToOpen = searchParams.get("group");

    if (dmToOpen) {
      const dm = dms.find((d) => strId(d._id) === strId(dmToOpen)) || {
        _id: dmToOpen,
      };
      openDm(dm);
      navigate("/chat", { replace: true });
      return;
    }

    if (groupToOpen) {
      const g =
        groups.find((x) => strId(x._id) === strId(groupToOpen)) || {
          _id: groupToOpen,
          name: "Group",
        };
      openGroup(g);
      navigate("/chat", { replace: true });
    }
  }, [
    token,
    authLoading,
    sidebarReady,
    active,
    searchParams,
    dms,
    groups,
    openDm,
    openGroup,
    navigate,
  ]);

  /* ---------------- Users directory (for group sender avatars) ---------------- */
  const [usersById, setUsersById] = useState({});

  const loadUserDirectory = useCallback(async () => {
    if (!token) return;
    if (Object.keys(usersById).length > 0) return;

    try {
      const res = await axios.get(`${API_USERS}?search=`, {
        headers: authHeaders,
      });
      const list = res.data || [];
      const map = {};
      for (const u of list) {
        const id = strId(u?._id || u?.id);
        if (id) map[id] = u;
      }
      setUsersById(map);
    } catch {
      // ignore (fallback initials will show)
    }
  }, [token, authHeaders, usersById]);

  useEffect(() => {
    if (active?.type === "group") loadUserDirectory();
  }, [active?.type, loadUserDirectory]);

  /* ---------------- Socket ---------------- */
  useEffect(() => {
    if (!token || authLoading) return;

    const s = createSocket(API_BASE_URL, token);
    socketRef.current = s;

    s.on("connect", () => s.emit("rooms:refresh"));

    const onNewMessage = (msg) => {
      // Update previews (no reload)
      if (msg?.targetType === "dm" && msg?.conversationId) {
        bumpDmPreview(msg.conversationId, msg.text, msg.createdAt);
      }
      if (msg?.targetType === "group" && msg?.groupId) {
        bumpGroupPreview(msg.groupId, msg.text, msg.createdAt);
      }

      const a = activeRef.current;

      const isActive =
        a &&
        ((a.type === "dm" &&
          msg.targetType === "dm" &&
          strId(msg.conversationId) === strId(a.id)) ||
          (a.type === "group" &&
            msg.targetType === "group" &&
            strId(msg.groupId) === strId(a.id)));

      const senderId = strId(msg?.senderId);
      const incoming = !!senderId && !!myId && senderId !== myId;

      const key =
        msg.targetType === "dm"
          ? makeKey("dm", msg.conversationId)
          : makeKey("group", msg.groupId);

      // Active chat: append + clear unread; mark needsReply only for incoming
      if (isActive) {
        setMessages((prev) => {
          if (prev.some((m) => strId(m._id) === strId(msg._id))) return prev;
          return [...prev, msg];
        });

        clearUnread(key);
        if (incoming) markNeedsReply(key);

        scrollToBottom();
        return;
      }

      // Not active: only for incoming
      if (incoming) {
        bumpUnread(key);
        markNeedsReply(key);
        playBeep();

        const openTo =
          msg.targetType === "dm"
            ? { type: "dm", id: msg.conversationId }
            : { type: "group", id: msg.groupId };

        showToast({
          key,
          title: msg.senderName || "New message",
          text: msg.text,
          openTo,
        });

        pushBrowserNotification(msg.senderName || "New message", msg.text, openTo);
      }

      // DM not in list yet → refresh once
      if (msg.targetType === "dm" && msg.conversationId) {
        const known = dmsRef.current.some(
          (d) => strId(d._id) === strId(msg.conversationId)
        );
        if (!known) loadSidebar({ silent: true });
      }
    };

    const onInvite = () => loadSidebar({ silent: true });
    const onGroupJoin = () => loadSidebar({ silent: true });

    s.on("message:new", onNewMessage);
    s.on("invite:new", onInvite);
    s.on("group:join", onGroupJoin);

    return () => {
      s.off("message:new", onNewMessage);
      s.off("invite:new", onInvite);
      s.off("group:join", onGroupJoin);
      s.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    authLoading,
    myId,
    bumpDmPreview,
    bumpGroupPreview,
    clearUnread,
    bumpUnread,
    markNeedsReply,
    playBeep,
    pushBrowserNotification,
    showToast,
    loadSidebar,
    scrollToBottom,
  ]);

  /* ---------------- Send (no sidebar reload) ---------------- */
  const send = useCallback(async () => {
    if (!token) return alert("Login required");
    if (!active) return;
    if (!text.trim()) return;

    const payload =
      active.type === "dm"
        ? {
            targetType: "dm",
            conversationId: active.id,
            text,
            replyToMessageId: replyTo?._id,
          }
        : {
            targetType: "group",
            groupId: active.id,
            text,
            replyToMessageId: replyTo?._id,
          };

    try {
      const res = await axios.post(`${API_CHAT}/message`, payload, {
        headers: authHeaders,
      });

      const msg = res.data;

      // Append (dedupe if socket also delivers)
      setMessages((prev) => {
        if (prev.some((m) => strId(m._id) === strId(msg._id))) return prev;
        return [...prev, msg];
      });

      // Preview bump
      if (active.type === "dm") bumpDmPreview(active.id, msg.text, msg.createdAt);
      if (active.type === "group")
        bumpGroupPreview(active.id, msg.text, msg.createdAt);

      // Sending means "answered"
      clearNeedsReply(makeKey(active.type, active.id));

      setText("");
      setReplyTo(null);
      scrollToBottom();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to send");
    }
  }, [
    token,
    active,
    text,
    replyTo,
    authHeaders,
    bumpDmPreview,
    bumpGroupPreview,
    clearNeedsReply,
    scrollToBottom,
  ]);

  /* ---------------- Invites ---------------- */
  const acceptInvite = async (groupId) => {
    try {
      await axios.post(
        `${API_CHAT}/groups/${groupId}/invites/accept`,
        {},
        { headers: authHeaders }
      );
      await loadSidebar({ silent: true });
      socketRef.current?.emit("rooms:refresh");
    } catch (e) {
      alert(e.response?.data?.message || "Accept failed");
    }
  };

  const declineInvite = async (groupId) => {
    try {
      await axios.post(
        `${API_CHAT}/groups/${groupId}/invites/decline`,
        {},
        { headers: authHeaders }
      );
      await loadSidebar({ silent: true });
    } catch (e) {
      alert(e.response?.data?.message || "Decline failed");
    }
  };

  /* ---------------- Reply / Forward ---------------- */
  const startReply = (msg) => setReplyTo(msg);

  const startForward = (msg) => {
    setForwardMsg(msg);
    setForwardTargets([]);
    setTargetSearch("");
    setForwardOpen(true);
  };

  const toggleTarget = (t) => {
    setForwardTargets((prev) => {
      const exists = prev.some(
        (x) => x.type === t.type && strId(x.id) === strId(t.id)
      );
      if (exists)
        return prev.filter(
          (x) => !(x.type === t.type && strId(x.id) === strId(t.id))
        );
      return [...prev, t];
    });
  };

  const doForward = async () => {
    if (!forwardMsg) return;
    if (!forwardTargets.length) return alert("Select at least 1 target");

    const targets = forwardTargets.map((t) =>
      t.type === "dm"
        ? { type: "dm", conversationId: t.id }
        : { type: "group", groupId: t.id }
    );

    try {
      await axios.post(
        `${API_CHAT}/forward`,
        { messageId: forwardMsg._id, targets },
        { headers: authHeaders }
      );
      setForwardOpen(false);
      setForwardMsg(null);
      setForwardTargets([]);
    } catch (e) {
      alert(e.response?.data?.message || "Forward failed");
    }
  };

  /* ---------------- Derived lists ---------------- */
  const forwardList = useMemo(() => {
    const dmItems = dms.map((d) => ({
      type: "dm",
      id: d._id,
      title: d?.otherUser?.fullName || d?.otherUser?.email || "Direct chat",
      avatarSrc: absUrl(d?.otherUser?.avatarUrl, API_BASE_URL),
    }));

    const groupItems = groups.map((g) => ({
      type: "group",
      id: g._id,
      title: g.name,
      avatarSrc: "",
    }));

    const all = [...dmItems, ...groupItems];
    const s = targetSearch.toLowerCase().trim();
    if (!s) return all;
    return all.filter((x) => x.title.toLowerCase().includes(s));
  }, [dms, groups, targetSearch]);

  const filteredGroups = useMemo(() => {
    const q = sidebarSearch.toLowerCase().trim();
    if (!q) return groups;
    return groups.filter((g) => (g.name || "").toLowerCase().includes(q));
  }, [groups, sidebarSearch]);

  const filteredDms = useMemo(() => {
    const q = sidebarSearch.toLowerCase().trim();
    if (!q) return dms;
    return dms.filter((d) => {
      const name = (d?.otherUser?.fullName || "").toLowerCase();
      const email = (d?.otherUser?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [dms, sidebarSearch]);

  /* ---------------- UI guards ---------------- */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <EnhancedHeader />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-lg border p-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Chat is for members only
            </h1>
            <p className="text-gray-600 mt-2">Please login to use messages.</p>
            <Link
              to="/login"
              className="inline-flex mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeSubtitle = active?.type === "group" ? "Group chat" : "Private chat";
  const activeTitle =
    active?.title || (active?.type === "group" ? "Group" : "Direct chat");

  const activeAvatarLabel =
    active?.type === "group"
      ? activeTitle
      : active?.meta?.otherUser?.fullName ||
        active?.meta?.otherUser?.email ||
        activeTitle;

  const activeAvatarSrc =
    active?.type === "dm"
      ? absUrl(active?.meta?.otherUser?.avatarUrl, API_BASE_URL)
      : "";

  const myAvatarSrc = absUrl(user?.avatarUrl, API_BASE_URL);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <EnhancedHeader />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Church Chat</h1>
            <p className="text-gray-600">Direct messages + Admin groups</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-2xl hover:bg-gray-50"
              title={muted ? "Unmute sound" : "Mute sound"}
            >
              {muted ? <BellOff size={16} /> : <Bell size={16} />}
              <span className="text-sm">{muted ? "Muted" : "Sound"}</span>
            </button>

            <button
              onClick={() => loadSidebar({ silent: true })}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-2xl hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw
                size={16}
                className={sidebarRefreshing ? "animate-spin" : ""}
              />
              <span className="text-sm">Refresh</span>
            </button>

            <Link
              to="/chat/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-sm"
            >
              <Users size={18} />
              New chat
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
          {/* Sidebar */}
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center gap-2 border rounded-2xl px-3 py-2 bg-white">
                <Search size={18} className="text-gray-400" />
                <input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full outline-none text-sm"
                  placeholder="Search people or groups…"
                />
              </div>
            </div>

            {!sidebarReady ? (
              <div className="p-4 space-y-3">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mt-6" />
                <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              </div>
            ) : (
              <div className="p-3 space-y-4">
                {/* Invites */}
                {pendingInvites.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 px-2 mb-2">
                      GROUP INVITES
                    </div>
                    <div className="space-y-2">
                      {pendingInvites.map((g) => (
                        <div
                          key={g._id}
                          className="border rounded-2xl p-3 bg-white hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar label={g.name} />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {g.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                You’ve been invited
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => acceptInvite(g._id)}
                                  className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 text-sm"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => declineInvite(g._id)}
                                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-2xl hover:bg-gray-200 text-sm"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 px-2 mb-2">
                    GROUPS
                  </div>
                  <div className="space-y-2">
                    {filteredGroups.length === 0 ? (
                      <div className="px-2 text-sm text-gray-500">
                        No groups.
                      </div>
                    ) : (
                      filteredGroups.map((g) => {
                        const gKey = makeKey("group", g._id);
                        const gUnread = unread[gKey] || 0;
                        const gNeeds = !!needsReply[gKey];

                        return (
                          <button
                            key={g._id}
                            onClick={() => openGroup(g)}
                            className={`w-full text-left p-3 rounded-2xl border transition hover:bg-blue-50 ${
                              active?.type === "group" &&
                              strId(active.id) === strId(g._id)
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar label={g.name} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0 flex items-center gap-2">
                                    <div className="font-semibold text-gray-900 truncate">
                                      {g.name}
                                    </div>

                                    {gUnread > 0 && (
                                      <div className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white">
                                        {gUnread > 99 ? "99+" : gUnread}
                                      </div>
                                    )}

                                    {gNeeds && (
                                      <div className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                        Needs reply
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-xs text-gray-400 whitespace-nowrap">
                                    {formatTime(g.lastMessageAt)}
                                  </div>
                                </div>

                                <div className="text-sm text-gray-500 truncate mt-1">
                                  {g.lastMessageText || "No messages yet"}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* DMs */}
                <div>
                  <div className="text-xs font-semibold text-gray-500 px-2 mb-2">
                    DIRECT MESSAGES
                  </div>
                  <div className="space-y-2">
                    {filteredDms.length === 0 ? (
                      <div className="px-2 text-sm text-gray-500">
                        No DMs yet. Click “New chat”.
                      </div>
                    ) : (
                      filteredDms.map((d) => {
                        const dmKey = makeKey("dm", d._id);
                        const dmUnread = unread[dmKey] || 0;
                        const dmNeeds = !!needsReply[dmKey];

                        const title =
                          d?.otherUser?.fullName ||
                          d?.otherUser?.email ||
                          "Direct chat";

                        const sub = d?.otherUser?.email || "";
                        const avatarSrc = absUrl(
                          d?.otherUser?.avatarUrl,
                          API_BASE_URL
                        );

                        return (
                          <button
                            key={d._id}
                            onClick={() => openDm(d)}
                            className={`w-full text-left p-3 rounded-2xl border transition hover:bg-blue-50 ${
                              active?.type === "dm" &&
                              strId(active.id) === strId(d._id)
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar label={title} src={avatarSrc} />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0 flex items-center gap-2">
                                    <div className="font-semibold text-gray-900 truncate">
                                      {title}
                                    </div>

                                    {dmUnread > 0 && (
                                      <div className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white">
                                        {dmUnread > 99 ? "99+" : dmUnread}
                                      </div>
                                    )}

                                    {dmNeeds && (
                                      <div className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                        Needs reply
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-xs text-gray-400 whitespace-nowrap">
                                    {formatTime(d.lastMessageAt)}
                                  </div>
                                </div>

                                {sub ? (
                                  <div className="text-xs text-gray-500 truncate mt-0.5">
                                    {sub}
                                  </div>
                                ) : null}

                                <div className="text-sm text-gray-500 truncate mt-1">
                                  {d.lastMessageText || "No messages yet"}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat window */}
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden flex flex-col min-h-[650px]">
            {!active ? (
              <div className="flex-1 flex items-center justify-center p-10 bg-gradient-to-b from-white to-gray-50">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-3xl bg-blue-50 flex items-center justify-center">
                    <MessageCircle className="text-blue-600" />
                  </div>
                  <div className="mt-4 font-semibold text-gray-800">
                    Select a chat
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Open a group or a DM to start chatting.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b bg-gradient-to-b from-white to-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      className="lg:hidden p-2 rounded-2xl hover:bg-gray-100"
                      onClick={() => setActive(null)}
                      title="Back"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <Avatar
                      label={activeAvatarLabel}
                      src={activeAvatarSrc}
                      size={40}
                    />

                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">
                        {activeTitle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activeSubtitle}
                      </div>
                    </div>
                  </div>

                  {!notifEnabled && typeof Notification !== "undefined" && (
                    <button
                      onClick={requestNotifications}
                      className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-2xl hover:bg-black"
                      title="Enable browser notifications"
                    >
                      Enable notifications
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                  {loadingMessages ? (
                    <div className="text-gray-500">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="text-gray-500">No messages yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m) => {
                        const senderId = strId(m?.senderId);
                        const mine = !!senderId && !!myId && senderId === myId;

                        const incomingAvatarSrc =
                          active.type === "dm"
                            ? activeAvatarSrc
                            : absUrl(usersById[senderId]?.avatarUrl, API_BASE_URL);

                        const incomingLabel =
                          active.type === "dm"
                            ? activeAvatarLabel
                            : m.senderName || "User";

                        return (
                          <div
                            key={m._id}
                            className={`flex items-end gap-2 ${
                              mine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {/* LEFT avatar for incoming */}
                            {!mine && (
                              <Avatar
                                size={32}
                                label={incomingLabel}
                                src={incomingAvatarSrc}
                              />
                            )}

                            {/* Bubble */}
                            <div
                              className={`max-w-[78%] rounded-3xl px-4 py-3 border shadow-sm ${
                                mine
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-900 border-gray-200"
                              }`}
                            >
                              {m.isForwarded && (
                                <div
                                  className={`text-xs mb-1 ${
                                    mine ? "text-white/80" : "text-gray-500"
                                  }`}
                                >
                                  Forwarded •{" "}
                                  {m.forwardedFrom?.fromUserName || "Unknown"}
                                </div>
                              )}

                              {m.replyToMessageId && (
                                <div
                                  className={`text-xs mb-2 px-2 py-1 rounded-2xl ${
                                    mine ? "bg-white/15" : "bg-gray-100"
                                  }`}
                                >
                                  Replying…
                                </div>
                              )}

                              {active.type === "group" && !mine && (
                                <div className="text-xs font-semibold mb-1 opacity-80">
                                  {m.senderName}
                                </div>
                              )}

                              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {m.text}
                              </div>

                              <div
                                className={`text-[11px] mt-2 flex items-center justify-between gap-3 ${
                                  mine ? "text-white/70" : "text-gray-400"
                                }`}
                              >
                                <span>{formatTime(m.createdAt)}</span>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startReply(m)}
                                    className={`p-1 rounded-xl hover:bg-black/10 ${
                                      mine ? "hover:bg-white/10" : ""
                                    }`}
                                    title="Reply"
                                  >
                                    <Reply size={14} />
                                  </button>
                                  <button
                                    onClick={() => startForward(m)}
                                    className={`p-1 rounded-xl hover:bg-black/10 ${
                                      mine ? "hover:bg-white/10" : ""
                                    }`}
                                    title="Forward"
                                  >
                                    <Forward size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* RIGHT avatar for my messages (optional) */}
                            {mine && (
                              <Avatar
                                size={32}
                                label={user?.fullName || "Me"}
                                src={myAvatarSrc}
                              />
                            )}
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                {/* Reply bar */}
                {replyTo && (
                  <div className="px-4 py-3 border-t bg-blue-50 flex items-center justify-between gap-3">
                    <div className="text-sm text-blue-900 truncate">
                      Replying to:{" "}
                      <span className="font-semibold">{replyTo.senderName}</span>{" "}
                      — <span className="opacity-80">{replyTo.text}</span>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="p-2 rounded-2xl hover:bg-blue-100"
                      title="Cancel reply"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Composer */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message…"
                      rows={1}
                      className="flex-1 border rounded-3xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                    />
                    <button
                      onClick={send}
                      disabled={!text.trim()}
                      className="h-12 w-12 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                      title="Send"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Press Enter to send • Shift+Enter for new line
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[360px] max-w-[92vw]">
          <div className="bg-white border shadow-xl rounded-3xl overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">
                  {toast.title}
                </div>
                <div className="text-xs text-gray-500">Incoming message</div>
              </div>

              <button
                onClick={() => setToast(null)}
                className="p-2 rounded-2xl hover:bg-gray-100"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3">
              <div className="text-sm text-gray-800 max-h-[72px] overflow-hidden">
                {toast.text}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (toast.openTo?.type === "dm")
                      navigate(`/chat?dm=${toast.openTo.id}`);
                    if (toast.openTo?.type === "group")
                      navigate(`/chat?group=${toast.openTo.id}`);
                    setToast(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Open
                </button>

                <button
                  onClick={() => setMuted((m) => !m)}
                  className="px-4 py-2 rounded-2xl border hover:bg-gray-50"
                  title="Mute/unmute"
                >
                  {muted ? "Unmute" : "Mute"}
                </button>

                <button
                  onClick={playBeep}
                  className="px-4 py-2 rounded-2xl border hover:bg-gray-50"
                  title="Replay sound"
                >
                  Play
                </button>
              </div>

              {!notifEnabled && typeof Notification !== "undefined" && (
                <button
                  onClick={requestNotifications}
                  className="mt-3 w-full px-4 py-2 rounded-2xl bg-gray-900 text-white hover:bg-black"
                >
                  Enable browser notifications
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {forwardOpen && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-bold text-gray-900">Forward message</div>
              <button
                onClick={() => setForwardOpen(false)}
                className="p-2 rounded-2xl hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="text-sm text-gray-700 mb-2">Message:</div>
              <div className="bg-gray-50 border rounded-2xl p-3 text-sm text-gray-900">
                {forwardMsg?.text}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 border rounded-2xl px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  className="w-full outline-none text-sm"
                  placeholder="Search target…"
                />
              </div>

              <div className="mt-4 max-h-[280px] overflow-y-auto space-y-2">
                {forwardList.length === 0 ? (
                  <div className="text-gray-500 text-sm">No targets.</div>
                ) : (
                  forwardList.map((t) => {
                    const selected = forwardTargets.some(
                      (x) => x.type === t.type && strId(x.id) === strId(t.id)
                    );

                    return (
                      <button
                        key={`${t.type}:${t.id}`}
                        onClick={() => toggleTarget(t)}
                        className={`w-full text-left border rounded-2xl p-3 hover:bg-blue-50 transition flex items-center justify-between ${
                          selected
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar label={t.title} src={t.avatarSrc} />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {t.title}{" "}
                              <span className="text-xs text-gray-500">
                                ({t.type})
                              </span>
                            </div>
                          </div>
                        </div>

                        {selected && (
                          <CheckCircle className="text-blue-600" size={18} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                onClick={doForward}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
              >
                Forward to {forwardTargets.length} target(s)
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}