import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import UseWebSocket from "../../hooks/UseWebSocket";
import { searchTransaction, getTransactionById } from "../../api/transaction";
import { getBoardByCode } from "../../api/e_center_board";
import logo from "../../assets/images/logo.jpg";
import icon from "../../assets/images/icon.svg";

const MAX_ROWS = 8;

const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const calcServingTime = (record, now) => {
  if (!record?.call_time) return "00:00";
  const date = record.print_date || now.toISOString().slice(0, 10);
  try {
    const from = new Date(`${date}T${record.call_time}`);
    const to = record.end_time ? new Date(`${date}T${record.end_time}`) : now;
    const diffMs = to - from;
    if (diffMs < 0) return "00:00";
    const total = Math.floor(diffMs / 1000);
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  } catch { return "00:00"; }
};

const getCounterDisplay = (record) => {
  if (!record) return "";
  const c = record.counter;
  if (c) return c.counter_number || c.name || c.code || String(c.id || "");
  return record.counter_number || record.counter_name || String(record.counter_id || "");
};

const getLatestByCallTime = (list) => {
  if (!list || list.length === 0) return null;
  return list.reduce((latest, cur) => {
    if (!latest?.call_time) return cur;
    if (!cur?.call_time) return latest;
    const dateA = latest.print_date || getTodayStr();
    const dateB = cur.print_date || getTodayStr();
    const tA = new Date(`${dateA}T${latest.call_time}`).getTime();
    const tB = new Date(`${dateB}T${cur.call_time}`).getTime();
    return tB > tA ? cur : latest;
  }, null);
};

const sortByCallTimeAsc = (list) => {
  if (!list || list.length === 0) return [];
  return [...list].sort((a, b) => {
    if (!a.call_time) return 1;
    if (!b.call_time) return -1;
    const dateA = a.print_date || getTodayStr();
    const dateB = b.print_date || getTodayStr();
    const tA = new Date(`${dateA}T${a.call_time}`).getTime();
    const tB = new Date(`${dateB}T${b.call_time}`).getTime();
    return tA - tB;
  });
};

const filterToday = (list) => {
  const today = getTodayStr();
  return (list || []).filter((r) => {
    const d = r.print_date || r.created_date || r.date || "";
    return d.slice(0, 10) === today;
  });
};

const filterByCounters = (list, counterIds) => {
  if (!counterIds || counterIds.length === 0) return list;
  return list.filter((r) => {
    const cid = r.counter_id || r.counter?.id;
    return cid && counterIds.includes(cid);
  });
};

const buildMediaSlides = (board) => {
  if (!board) return [];
  const slides = [];
  if (board.is_slider_enabled && board.image_sliders?.length > 0) {
    board.image_sliders.forEach((item) => {
      slides.push({ type: "image", src: item.file_path, alt: item.description || "Slider" });
    });
  }
  if (board.is_video_enabled && board.videos?.length > 0) {
    board.videos.forEach((item) => {
      slides.push({ type: "video", src: item.file_path, alt: item.description || "Video" });
    });
  }
  return slides;
};

const requestFullscreen = () => {
  const el = document.documentElement;
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (fn) fn.call(el).catch(() => {});
};

const isFullscreenActive = () =>
  !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

export default function ECenterBoard() {
  const { code } = useParams();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [servingList, setServingList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [latestCalled, setLatestCalled] = useState(null);
  const [flash, setFlash] = useState(false);
  const [mediaSlides, setMediaSlides] = useState([]);
  const [boardInfo, setBoardInfo] = useState(null);

  // Ref để các callback WS luôn đọc được boardInfo mới nhất (không stale closure)
  const boardInfoRef = useRef(null);
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);

  // ─── AUTO FULLSCREEN ──────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => { if (!isFullscreenActive()) requestFullscreen(); }, 300);
    const onInteract = () => {
      if (!isFullscreenActive()) requestFullscreen();
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("keydown", onInteract);
    window.addEventListener("touchstart", onInteract);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 2400);
  };

  // ─── FETCH BOARD INFO (dùng cả lần đầu lẫn khi WS báo board-updated) ─────────
  const fetchBoardInfo = useCallback(async () => {
    const currentCode = codeRef.current;
    if (!currentCode) return null;
    try {
      const board = await getBoardByCode(currentCode);
      if (board) {
        boardInfoRef.current = board;
        setBoardInfo(board);
        setMediaSlides(buildMediaSlides(board));
        // Không reset currentSlide khi hot-reload (tránh nhấp nháy)
      }
      return board || null;
    } catch (err) {
      console.error("Lỗi fetch board info:", err);
      return null;
    }
  }, []); // stable — đọc qua codeRef

  // Load lần đầu (reset slide về 0)
  useEffect(() => {
    if (!code) return;
    codeRef.current = code;
    (async () => {
      const board = await getBoardByCode(code);
      if (board) {
        boardInfoRef.current = board;
        setBoardInfo(board);
        setMediaSlides(buildMediaSlides(board));
        setCurrentSlide(0);
      }
    })();
  }, [code]);

  const fetchDetail = useCallback(async (id) => {
    if (!id) return null;
    try { return await getTransactionById(id); } catch { return null; }
  }, []);

  // ─── FETCH SERVING LIST ───────────────────────────────────────────────────────
  // Dependency rỗng vì đọc boardInfoRef (stable ref) thay vì boardInfo state
  const fetchServingList = useCallback(async () => {
    try {
      const today = getTodayStr();
      const result = await searchTransaction({ status: "serving", date: today }, 1, MAX_ROWS);
      if (result?.success) {
        const todayOnly  = filterToday(result.data || []);
        const counterIds = boardInfoRef.current?.counters?.map((c) => c.id).filter(Boolean) || [];
        const filtered   = filterByCounters(todayOnly, counterIds);
        const sorted     = sortByCallTimeAsc(filtered.slice(0, MAX_ROWS));
        setServingList(sorted);
        return sorted;
      }
    } catch (err) {
      console.error("Lỗi fetch serving list:", err);
    }
    return [];
  }, []);

  // Load serving list khi boardInfo sẵn sàng lần đầu
  useEffect(() => {
    if (!boardInfo) return;
    (async () => {
      const list = await fetchServingList();
      if (list.length === 0) { setLatestCalled(null); return; }
      const latest = getLatestByCallTime(list);
      if (!latest) return;
      const detail = await fetchDetail(latest.id);
      setLatestCalled(detail || latest);
    })();
  }, [boardInfo, fetchServingList, fetchDetail]);

  // ─── HANDLER: TRANSACTION EVENT ──────────────────────────────────────────────
  const handleTransactionEvent = useCallback(async (data) => {
    const list = await fetchServingList();

    if (data?.status === "serving" && data?.id) {
      const recordDate = (data.print_date || data.created_date || data.date || "").slice(0, 10);
      if (recordDate && recordDate !== getTodayStr()) return;
      const detail = await fetchDetail(data.id);
      const inBoard = detail ? list.some((r) => r.id === detail.id) : false;
      if (inBoard) {
        setLatestCalled(detail);
        triggerFlash();
      }
      return;
    }

    if (data?.status === "completed" || data?.status === "cancelled") {
      if (list.length === 0) {
        setLatestCalled(null);
      } else {
        setLatestCalled((prev) => {
          if (prev && prev.id === data.id) {
            const next = getLatestByCallTime(list);
            if (!next) return null;
            fetchDetail(next.id).then((d) => setLatestCalled(d || next));
            return next;
          }
          return prev;
        });
      }
    }
  }, [fetchServingList, fetchDetail]);

  // ─── HANDLER: BOARD-UPDATED EVENT ────────────────────────────────────────────
  // Khi admin lưu board (tên, counters, video, slider...) → reload toàn bộ board info
  // rồi re-fetch serving list theo counters mới
  const handleBoardUpdated = useCallback(async () => {
    await fetchBoardInfo();
    await fetchServingList();
  }, [fetchBoardInfo, fetchServingList]);

  // ─── WEBSOCKET ────────────────────────────────────────────────────────────────
  UseWebSocket({
    "status-changed":     useCallback((data) => handleTransactionEvent(data), [handleTransactionEvent]),
    "update-transaction": useCallback((data) => handleTransactionEvent(data), [handleTransactionEvent]),
    "new-transaction":    useCallback(() => fetchServingList(),                [fetchServingList]),
    // ← KEY: lắng nghe board-updated → gọi lại getBoardByCode realtime
    "board-updated":      useCallback(() => handleBoardUpdated(),              [handleBoardUpdated]),
  });

  // ─── CLOCK ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ─── SLIDESHOW ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mediaSlides.length === 0) return;
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % mediaSlides.length), 5000);
    return () => clearInterval(t);
  }, [mediaSlides]);

  // ─── DERIVED ──────────────────────────────────────────────────────────────────
  const formatTime = (d) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });

  const rows          = Array.from({ length: MAX_ROWS }, (_, i) => servingList[i] || null);
  const bannerTicket  = latestCalled?.ticket_code || "";
  const bannerCounter = latestCalled ? getCounterDisplay(latestCalled) : "";
  const servingTime   = latestCalled ? calcServingTime(latestCalled, currentTime) : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        .qa-wrap { font-family: 'Roboto', sans-serif; background: #5A0000; width: 100vw; height: 100vh; display: flex; flex-direction: column; padding: 10px; gap: 10px; }
        .qa-header { display: flex; padding: 6px 36px; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .qa-logo { width: 70px; height: 70px; border-radius: 50%; border: 3px solid #FFD700; background: radial-gradient(circle, #FFD700 30%, #E65100 100%); display: flex; align-items: center; justify-content: center; font-size: 34px; box-shadow: 0 0 16px rgba(255,215,0,0.6); flex-shrink: 0; overflow: hidden; }
        .qa-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .qa-title { text-align: center; flex: 1; padding: 0 14px; }
        .qa-title-top { font-family: 'Oswald', sans-serif; color: #FFD700; font-size: clamp(1rem, 2.2vw, 1.6rem); font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; text-shadow: 1px 2px 6px rgba(0,0,0,0.5); line-height: 1.25; }
        .qa-title-sub { font-family: 'Oswald', sans-serif; color: #FFD700; font-size: clamp(1rem, 2.2vw, 1.6rem); font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin-top: 3px; }
        .qa-header-right { min-width: 120px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .qa-serving-badge-time { font-family: 'Oswald', sans-serif; color: rgba(255,215,0,0.6); font-size: clamp(1.1rem, 2vw, 1.5rem); font-weight: 700; text-shadow: 0 0 12px rgba(255,255,255,0.3); letter-spacing: 2px; line-height: 1.1; }
        .qa-body { flex: 1; min-height: 0; display: flex; gap: 54px; margin: 8px 42px; }
        .qa-left { width: 32%; flex-shrink: 0; background: linear-gradient(170deg, #5C0000, #380000); border: 2px solid rgba(255,215,0,0.45); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; }
        .qa-list-title { font-family: 'Oswald', sans-serif; color: #FFD700; font-size: clamp(0.85rem, 1.7vw, 1.15rem); font-weight: 700; text-align: center; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 10px rgba(255,215,0,0.4); margin-bottom: 4px; }
        .qa-list-deco { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 8px 0; opacity: 0.8; }
        .qa-col-headers { display: grid; grid-template-columns: 120px 16px 1fr; gap: 0; padding: 0 2px; margin-bottom: 8px; }
        .qa-col-headers span { font-family: 'Oswald', sans-serif; color: #FFD700; font-size: clamp(0.75rem, 1.4vw, 0.95rem); font-weight: 600; letter-spacing: 1px; text-align: center; }
        .qa-rows { display: flex; flex-direction: column; gap: 7px; flex: 1; }
        .qa-row { display: grid; grid-template-columns: 120px 16px 1fr; align-items: center; height: 44px; }
        .qa-counter { background: linear-gradient(135deg, #1565C0, #0D47A1); color: #fff; font-family: 'Oswald', sans-serif; font-size: clamp(1rem, 2vw, 1.35rem); font-weight: 700; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 6px 0 0 6px; border: 1px solid #42A5F5; border-right: none; }
        .qa-arrow { width: 0; height: 0; border-top: 22px solid transparent; border-bottom: 22px solid transparent; border-left: 16px solid #0D47A1; }
        .qa-ticket { height: 44px; background: rgba(255,255,255,0.09); border: 1px solid rgba(255,215,0,0.2); border-left: none; border-radius: 0 6px 6px 0; display: flex; align-items: center; justify-content: center; font-family: 'Oswald', sans-serif; font-size: clamp(1rem, 2vw, 1.35rem); font-weight: 600; color: #FFD700; }
        .qa-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
        .qa-media { flex: 1; min-height: 0; position: relative; border: 3px solid #FFD700; border-radius: 8px; overflow: hidden; background: #000; }
        .qa-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; }
        .qa-slide.active { opacity: 1; }
        .qa-slide img { width: 100%; height: 100%; object-fit: fill; }
        .qa-slide video { width: 100%; height: 100%; object-fit: cover; }
        .qa-media-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: rgba(255,215,0,0.3); font-family: 'Oswald', sans-serif; font-size: 1.2rem; letter-spacing: 2px; }
        .qa-dots { position: absolute; bottom: 10px; right: 12px; display: flex; gap: 6px; z-index: 5; }
        .qa-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); cursor: pointer; transition: background .3s; }
        .qa-dot.active { background: #FFD700; }
        .qa-calling { background: linear-gradient(90deg, #7A0000, #B00000, #7A0000); border: 2px solid #FFD700; border-radius: 8px; height: 58px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 10px; animation: glow 2s ease-in-out infinite; }
        .qa-calling.flash { animation: flash-anim 0.4s ease-in-out 6; }
        @keyframes glow { 0%,100% { box-shadow: 0 0 8px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 28px rgba(255,215,0,0.8); } }
        @keyframes flash-anim { 0%,100% { background: linear-gradient(90deg, #7A0000, #B00000, #7A0000); box-shadow: 0 0 8px rgba(255,215,0,0.3); } 50% { background: linear-gradient(90deg, #AA0000, #EE1100, #AA0000); box-shadow: 0 0 40px rgba(255,215,0,1); } }
        .qa-call-label { font-family: 'Oswald', sans-serif; color: #FFD700; font-size: clamp(1rem, 2.2vw, 1.45rem); font-weight: 400; letter-spacing: 1px; }
        .qa-call-ticket { font-family: 'Oswald', sans-serif; color: #fff; font-size: clamp(1.3rem, 2.8vw, 2rem); font-weight: 700; min-width: 80px; text-align: center; }
        .qa-call-ticket.pop { animation: ticket-pop 0.45s ease; }
        @keyframes ticket-pop { 0% { transform: scale(1); } 50% { transform: scale(1.22); color: #FFD700; } 100% { transform: scale(1); } }
        .qa-call-counter { font-family: 'Oswald', sans-serif; color: #fff; font-size: clamp(1.3rem, 2.8vw, 2rem); font-weight: 700; min-width: 24px; text-align: center; }
        .qa-footer { flex-shrink: 0; color: rgba(255,255,255,0.3); font-size: 12px; letter-spacing: 1px; display: flex; justify-content: space-between; padding: 0 4px 2px; }
      `}</style>

      <div className="qa-wrap">
        <header className="qa-header">
          <div className="qa-logo">
            <img src={logo} alt="Logo" onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <div className="qa-title">
            <div className="qa-title-top">{"BỘ PHẬN TIẾP NHẬN TRẢ KẾT QUẢ " + (boardInfo?.name || "XÃ")}</div>
            <div className="qa-title-sub">Hành chính phục vụ</div>
          </div>
          <div className="qa-header-right">
            {servingTime ? <div className="qa-serving-badge-time">{servingTime}</div> : <div style={{ minHeight: "44px" }} />}
          </div>
        </header>

        <div className="qa-body">
          <div className="qa-left">
            <div className="qa-list-title">Danh sách đang phục vụ</div>
            <div className="qa-list-deco">
              <span style={{ flex: 1, borderTop: "2px solid #FFD700", opacity: 0.5, marginLeft: "56px" }} />
              <img style={{ width: "50px" }} src={icon} alt="" onError={(e) => { e.target.style.display = "none"; }} />
              <span style={{ flex: 1, borderTop: "2px solid #FFD700", opacity: 0.5, marginRight: "56px" }} />
            </div>
            <div className="qa-col-headers"><span>Quầy</span><span /><span>Số vé</span></div>
            <div className="qa-rows">
              {rows.map((record, i) => {
                const active  = !!record;
                const counter = active ? getCounterDisplay(record) : "";
                const ticket  = active ? (record.ticket_code || "") : "";
                return (
                  <div className="qa-row" key={record ? record.id : `empty-${i}`}>
                    <div className="qa-counter">{active && counter ? String(counter).padStart(2, "0") : ""}</div>
                    <div className="qa-arrow" />
                    <div className="qa-ticket">{active ? ticket : ""}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="qa-right">
            <div className="qa-media">
              {mediaSlides.length > 0 ? (
                <>
                  {mediaSlides.map((slide, i) => (
                    <div key={i} className={`qa-slide${i === currentSlide ? " active" : ""}`}>
                      {slide.type === "image" ? (
                        <img src={slide.src} alt={slide.alt} />
                      ) : (
                        <video src={slide.src} autoPlay muted loop onEnded={() => setCurrentSlide((p) => (p + 1) % mediaSlides.length)} />
                      )}
                    </div>
                  ))}
                  {mediaSlides.length > 1 && (
                    <div className="qa-dots">
                      {mediaSlides.map((_, i) => (
                        <div key={i} className={`qa-dot${i === currentSlide ? " active" : ""}`} onClick={() => setCurrentSlide(i)} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="qa-media-empty">ĐANG TẢI MEDIA...</div>
              )}
            </div>

            <div className={`qa-calling${flash ? " flash" : ""}`}>
              <span className="qa-call-label">Xin mời số</span>
              <span className={`qa-call-ticket${flash ? " pop" : ""}`}>{bannerTicket}</span>
              <span className="qa-call-label" style={{ paddingLeft: "120px" }}>Đến quầy</span>
              <span className="qa-call-counter">{bannerCounter}</span>
            </div>
          </div>
        </div>

        <footer className="qa-footer">
          <span>Power by Dbxco.vn</span>
          <span>{new Date().toLocaleDateString("vi-VN")} {formatTime(currentTime)}&nbsp;·&nbsp;beta-v2.0.9</span>
        </footer>
      </div>
    </>
  );
}