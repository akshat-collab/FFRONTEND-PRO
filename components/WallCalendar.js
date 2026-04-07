"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./WallCalendar.module.css";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const HERO_SCENES = [
  {
    id: "alpine",
    title: "Alpine Ascent",
    subtitle: "Expedition Series",
    accent: "#42a5ef",
    sky: "linear-gradient(180deg, rgba(220, 226, 236, 0.96) 0%, rgba(236, 239, 244, 0.96) 100%)",
    ridgeBack: "linear-gradient(180deg, #2f3d4e 0%, #15202e 100%)",
    ridgeFront: "linear-gradient(180deg, #6d7278 0%, #a7adb5 40%, #7b8089 100%)",
  },
  {
    id: "sunset",
    title: "Canyon Light",
    subtitle: "Adventure Series",
    accent: "#f08a42",
    sky: "linear-gradient(180deg, rgba(244, 212, 178, 0.96) 0%, rgba(241, 231, 221, 0.96) 100%)",
    ridgeBack: "linear-gradient(180deg, #6b4c3e 0%, #3f2a22 100%)",
    ridgeFront: "linear-gradient(180deg, #a77f63 0%, #d4b295 45%, #8d664f 100%)",
  },
  {
    id: "glacier",
    title: "Blue Summit",
    subtitle: "Winter Series",
    accent: "#5e8dff",
    sky: "linear-gradient(180deg, rgba(211, 227, 248, 0.96) 0%, rgba(238, 244, 251, 0.96) 100%)",
    ridgeBack: "linear-gradient(180deg, #39516c 0%, #1e3043 100%)",
    ridgeFront: "linear-gradient(180deg, #8ea1b3 0%, #cad6df 45%, #7a8ca0 100%)",
  },
];

const HOLIDAYS = {
  "2026-01-01": "New Year",
  "2026-01-19": "MLK Day",
  "2026-02-14": "Valentine's",
  "2026-05-25": "Memorial Day",
  "2026-07-04": "Independence Day",
  "2026-09-07": "Labor Day",
  "2026-10-31": "Halloween",
  "2026-11-26": "Thanksgiving",
  "2026-12-25": "Christmas",
};

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function createCalendarDays(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatLong(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRangeLabel(start, end) {
  if (!start) {
    return "Pick a date range";
  }

  const first = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (!end) {
    return first;
  }

  return `${first} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selection, setSelection] = useState({ start: null, end: null });
  const [monthNotes, setMonthNotes] = useState("");
  const [rangeNotes, setRangeNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);

  const days = useMemo(() => createCalendarDays(currentMonth), [currentMonth]);
  const monthKey = getMonthKey(currentMonth);
  const rangeKey = selection.start
    ? `${formatDateKey(selection.start)}_${selection.end ? formatDateKey(selection.end) : "open"}`
    : "none";
  const scene = HERO_SCENES[sceneIndex];

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const savedMonthNotes = window.localStorage.getItem(`month-note:${monthKey}`) ?? "";
    const savedRange = window.localStorage.getItem(`range:${monthKey}`);
    const savedScene = window.localStorage.getItem("calendar-scene");

    setMonthNotes(savedMonthNotes);

    if (savedScene) {
      setSceneIndex(Number(savedScene) || 0);
    }

    if (!savedRange) {
      setSelection({ start: null, end: null });
      return;
    }

    try {
      const parsed = JSON.parse(savedRange);
      setSelection({
        start: parsed.start ? startOfDay(new Date(parsed.start)) : null,
        end: parsed.end ? startOfDay(new Date(parsed.end)) : null,
      });
    } catch {
      setSelection({ start: null, end: null });
    }
  }, [hydrated, monthKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setRangeNotes(window.localStorage.getItem(`range-note:${monthKey}:${rangeKey}`) ?? "");
  }, [hydrated, monthKey, rangeKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(`month-note:${monthKey}`, monthNotes);
  }, [hydrated, monthKey, monthNotes]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(`range:${monthKey}`, JSON.stringify(selection));
  }, [hydrated, monthKey, selection]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(`range-note:${monthKey}:${rangeKey}`, rangeNotes);
  }, [hydrated, monthKey, rangeKey, rangeNotes]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem("calendar-scene", String(sceneIndex));
  }, [hydrated, sceneIndex]);

  function shiftMonth(direction) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  }

  function jumpToToday() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = startOfDay(now);
    setCurrentMonth(first);
    setSelection({ start: today, end: today });
  }

  function applyPreset(type) {
    const base = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    if (type === "week") {
      const start = startOfDay(base);
      const end = new Date(base.getFullYear(), base.getMonth(), 7);
      setSelection({ start, end });
      return;
    }

    if (type === "month") {
      const start = startOfDay(base);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      setSelection({ start, end: startOfDay(end) });
      return;
    }

    if (type === "weekend") {
      const daysInMonth = createCalendarDays(base).filter((day) => day.getMonth() === base.getMonth());
      const saturday = daysInMonth.find((day) => day.getDay() === 6) ?? startOfDay(base);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      setSelection({ start: startOfDay(saturday), end: startOfDay(sunday) });
    }
  }

  function onDateSelect(date) {
    const clicked = startOfDay(date);

    if (!selection.start || selection.end) {
      setSelection({ start: clicked, end: null });
      return;
    }

    if (clicked.getTime() < selection.start.getTime()) {
      setSelection({ start: clicked, end: selection.start });
      return;
    }

    if (clicked.getTime() === selection.start.getTime()) {
      setSelection({ start: clicked, end: null });
      return;
    }

    setSelection({ start: selection.start, end: clicked });
  }

  function clearSelection() {
    setSelection({ start: null, end: null });
    setRangeNotes("");
  }

  function isInRange(day) {
    if (!selection.start || !selection.end) {
      return false;
    }

    const time = day.getTime();
    return time > selection.start.getTime() && time < selection.end.getTime();
  }

  const selectedDays = selection.start && selection.end
    ? Math.round((selection.end.getTime() - selection.start.getTime()) / 86400000) + 1
    : selection.start
      ? 1
      : 0;

  const currentMonthHolidays = days
    .filter((day) => day.getMonth() === currentMonth.getMonth())
    .map((day) => ({ key: formatDateKey(day), day }))
    .filter((entry) => HOLIDAYS[entry.key])
    .map((entry) => ({
      label: HOLIDAYS[entry.key],
      date: formatLong(entry.day),
    }));

  const dateSummary = selection.start
    ? selection.end
      ? `${formatLong(selection.start)} to ${formatLong(selection.end)}`
      : formatLong(selection.start)
    : "No dates selected";

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} aria-hidden="true" />

      <section className={styles.experience}>
        <div className={styles.stage}>
          <article className={styles.sheet}>
            <div className={styles.hook} aria-hidden="true" />
            <div className={styles.spiral} aria-hidden="true" />

            <div className={styles.poster} style={{ "--accent": scene.accent }}>
              <div className={styles.sky} style={{ background: scene.sky }} />
              <div className={styles.ridgeBack} style={{ background: scene.ridgeBack }} />
              <div className={styles.ridgeFront} style={{ background: scene.ridgeFront }} />
              <div className={styles.ribbonLeft} />
              <div className={styles.ribbonRight} />
              <div className={styles.climber} aria-hidden="true">
                <span className={styles.climberBody} />
                <span className={styles.climberTool} />
              </div>

              <div className={styles.sceneBadge}>
                <span>{scene.subtitle}</span>
                <strong>{scene.title}</strong>
              </div>

              <div className={styles.monthStamp}>
                <span>{currentMonth.getFullYear()}</span>
                <strong>{MONTHS[currentMonth.getMonth()]}</strong>
              </div>
            </div>

            <div className={styles.paper}>
              <div className={styles.controls}>
                <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                  Prev
                </button>
                <div className={styles.rangeMeta}>
                  <strong>{formatRangeLabel(selection.start, selection.end)}</strong>
                  <span>{selectedDays ? `${selectedDays} day${selectedDays > 1 ? "s" : ""}` : "No range yet"}</span>
                </div>
                <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
                  Next
                </button>
              </div>

              <div className={styles.bottomLayout}>
                <section className={styles.notesPanel}>
                  <div className={styles.notesHeader}>
                    <span>Notes</span>
                    <button type="button" onClick={clearSelection}>
                      Clear
                    </button>
                  </div>

                  <textarea
                    value={monthNotes}
                    onChange={(event) => setMonthNotes(event.target.value)}
                    className={styles.monthNotes}
                    placeholder="Monthly notes"
                  />

                  <textarea
                    value={rangeNotes}
                    onChange={(event) => setRangeNotes(event.target.value)}
                    className={styles.rangeNotes}
                    placeholder="Selected range notes"
                    disabled={!selection.start}
                  />
                </section>

                <section className={styles.calendarPanel}>
                  <div className={styles.weekdays}>
                    {WEEKDAYS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className={styles.grid}>
                    {days.map((day) => {
                      const key = formatDateKey(day);
                      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                      const isStart = selection.start && day.getTime() === selection.start.getTime();
                      const isEnd = selection.end && day.getTime() === selection.end.getTime();
                      const isToday = day.getTime() === startOfDay(new Date()).getTime();
                      const holiday = HOLIDAYS[key];

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => onDateSelect(day)}
                          title={holiday ?? formatLong(day)}
                          className={[
                            styles.day,
                            !isCurrentMonth ? styles.dayMuted : "",
                            isInRange(day) ? styles.dayInRange : "",
                            isStart ? styles.dayStart : "",
                            isEnd ? styles.dayEnd : "",
                            isToday ? styles.dayToday : "",
                            holiday ? styles.dayHoliday : "",
                          ].join(" ")}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </article>
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.panelCard}>
            <p className={styles.kicker}>Calendar Studio</p>
            <h1>Full-screen planner with a printed-wall aesthetic.</h1>
            <p className={styles.lead}>
              Built to feel like a premium physical calendar, but with interaction patterns that make range planning,
              notes, and month browsing much faster.
            </p>

            <div className={styles.actionRow}>
              <button type="button" onClick={jumpToToday}>
                Jump to today
              </button>
              <button type="button" onClick={() => setSceneIndex((sceneIndex + 1) % HERO_SCENES.length)}>
                Switch artwork
              </button>
            </div>
          </div>

          <div className={styles.panelCard}>
            <p className={styles.kicker}>Quick Select</p>
            <div className={styles.presetRow}>
              <button type="button" onClick={() => applyPreset("week")}>
                First week
              </button>
              <button type="button" onClick={() => applyPreset("weekend")}>
                Weekend
              </button>
              <button type="button" onClick={() => applyPreset("month")}>
                Whole month
              </button>
            </div>

            <div className={styles.scenePicker}>
              {HERO_SCENES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === sceneIndex ? styles.sceneActive : ""}
                  onClick={() => setSceneIndex(index)}
                >
                  <span style={{ backgroundColor: item.accent }} />
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span>Selection</span>
              <strong>{selectedDays || 0}</strong>
              <small>days active</small>
            </div>
            <div className={styles.statCard}>
              <span>Month key</span>
              <strong>{monthKey}</strong>
              <small>saved locally</small>
            </div>
          </div>

          <div className={styles.panelCard}>
            <p className={styles.kicker}>Current Range</p>
            <h2>{dateSummary}</h2>
            <p className={styles.infoCopy}>
              The calendar preserves both your monthly memo and the currently selected range note in local storage.
            </p>
          </div>

          <div className={styles.panelCard}>
            <p className={styles.kicker}>Holiday Markers</p>
            <div className={styles.holidayList}>
              {currentMonthHolidays.length ? (
                currentMonthHolidays.map((holiday) => (
                  <div key={holiday.label} className={styles.holidayItem}>
                    <strong>{holiday.label}</strong>
                    <span>{holiday.date}</span>
                  </div>
                ))
              ) : (
                <p className={styles.infoCopy}>No holiday markers configured for this month.</p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
