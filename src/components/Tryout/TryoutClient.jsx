// File: src/components/Tryout/TryoutClient.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import styles from './Tryout.module.css';
import RightSidebar from '@/components/RightSidebar';
import AdBanner from '@/components/AdBanner';
import { useFontSize } from '@/contexts/FontSizeContext';
import { renderQuestionHtml, stemWithoutTable } from '@/lib/renderQuestionHtml';
import { gradeAttempt, complexChoices, defaultDurationSeconds } from '@/lib/tryoutGrading.mjs';
import { saveAttempt, getAttempts } from '@/utils/tryoutHistory';

const STATUS_LABEL = { correct: 'Benar', wrong: 'Salah', skipped: 'Dilewati', ungraded: 'Tidak dinilai' };

function Html({ html, className, inline = false }) {
  const out = useMemo(() => renderQuestionHtml(html), [html]);
  const Tag = inline ? 'span' : 'div';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: out }} />;
}

const formatTime = (sec) => {
  const s = Math.max(0, sec);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

const hasValue = (a) => {
  if (a === undefined || a === null) return false;
  return typeof a === 'string' ? a.trim() !== '' : Object.keys(a).length > 0;
};

export default function TryoutClient({ topic, packet, questions, skippedCount }) {
  const fontCtx = useFontSize();
  const fontSize = fontCtx?.fontSize ?? 18;

  const [phase, setPhase] = useState('intro'); // intro | running | result
  const [withTimer, setWithTimer] = useState(true);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const answersRef = useRef({});
  const startRef = useRef(0);
  const endRef = useRef(0);
  const finishedRef = useRef(false);

  const totalSeconds = useMemo(() => defaultDurationSeconds(questions), [questions]);
  const gradableCount = useMemo(() => questions.filter((q) => q.type !== 'essay').length, [questions]);

  useEffect(() => {
    setHistory(getAttempts(topic.slug, packet.paket_slug));
  }, [topic.slug, packet.paket_slug]);

  const setAnswer = (id, value) => {
    answersRef.current = { ...answersRef.current, [id]: value };
    setAnswers(answersRef.current);
  };

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const graded = gradeAttempt(questions, answersRef.current);
    const durationSec = Math.round((Date.now() - startRef.current) / 1000);
    saveAttempt(topic.slug, packet.paket_slug, {
      at: new Date().toISOString(),
      durationSec,
      score: graded.score,
      correct: graded.correct,
      wrong: graded.wrong,
      skipped: graded.skipped,
      gradable: graded.gradable,
      items: graded.items.map(({ number, type, status }) => ({ number, type, status })),
    });
    setHistory(getAttempts(topic.slug, packet.paket_slug));
    setResult({ graded, durationSec });
    setPhase('result');
    setIndex(0);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }, [questions, topic.slug, packet.paket_slug]);

  const start = () => {
    answersRef.current = {};
    finishedRef.current = false;
    setAnswers({});
    setFlags({});
    setIndex(0);
    startRef.current = Date.now();
    endRef.current = Date.now() + totalSeconds * 1000;
    setRemaining(totalSeconds);
    setResult(null);
    setPhase('running');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  // Timer berbasis waktu akhir (tidak melenceng saat tab di latar belakang)
  useEffect(() => {
    if (phase !== 'running' || !withTimer) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) finish();
    }, 500);
    return () => clearInterval(id);
  }, [phase, withTimer, finish]);

  // Peringatan sebelum menutup tab di tengah pengerjaan
  useEffect(() => {
    if (phase !== 'running') return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [phase]);

  const answeredCount = questions.filter((q) => hasValue(answers[q._id])).length;

  const confirmFinish = () => {
    const unanswered = gradableCount - questions.filter((q) => q.type !== 'essay' && hasValue(answers[q._id])).length;
    const msg = unanswered > 0
      ? `Masih ada ${unanswered} soal yang belum dijawab. Akhiri dan lihat hasilnya?`
      : 'Akhiri try out dan lihat hasilnya?';
    if (window.confirm(msg)) finish();
  };

  const backLink = `/${topic.slug}/${packet.paket_slug}`;
  const statusById = result ? Object.fromEntries(result.graded.items.map((i) => [i._id ?? i.id, i.status])) : {};

  // Data tile untuk peta nomor soal (kolom kanan di desktop, strip melayang di HP)
  const tiles = questions.map((q) => {
    const a = answers[q._id];
    const answered = hasValue(a);
    let label = '-';
    if (q.type === 'single') label = typeof a === 'string' && a ? a : '-';
    else if (q.type === 'complex') label = answered ? (Object.keys(a).length >= q.statements.length ? '✓' : '…') : 'PGK';
    else if (q.type === 'short') label = answered ? '✓' : '-';
    else label = 'URA';
    return {
      number: q.number,
      answered,
      flagged: Boolean(flags[q._id]),
      status: phase === 'result' ? statusById[q._id] : null,
      label,
    };
  });

  /* ---------------- INTRO ---------------- */
  if (phase === 'intro') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p className={styles.kicker}>Mode CBT</p>
          <h1 className={styles.title}>{packet.title}</h1>
          <p className={styles.subtitle}>{topic.title}</p>

          <ul className={styles.infoList}>
            <li>{questions.length} soal ({gradableCount} dinilai otomatis{questions.length - gradableCount > 0 ? `, ${questions.length - gradableCount} uraian tidak dinilai` : ''})</li>
            <li>Waktu yang disarankan: {Math.round(totalSeconds / 60)} menit</li>
            <li>Riwayat percobaan tersimpan di perangkat ini saja.</li>
            {skippedCount > 0 && <li>{skippedCount} soal sedang diperbaiki dan dilewati sementara.</li>}
          </ul>

          <label className={styles.checkRow}>
            <input type="checkbox" checked={withTimer} onChange={(e) => setWithTimer(e.target.checked)} />
            Pakai timer (otomatis berakhir saat waktu habis)
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.primaryBtn} onClick={start}>Mulai Try Out</button>
            <Link href={backLink} className={styles.linkBtn}>Kembali ke Mode Baca</Link>
          </div>

          {history.length > 0 && (
            <div className={styles.historyBox}>
              <h2 className={styles.h2}>Percobaan sebelumnya</h2>
              <ul className={styles.historyList}>
                {history.slice(0, 5).map((h) => (
                  <li key={h.at}>
                    <span>{formatDate(h.at)}</span>
                    <strong>{h.score === null ? '-' : `${h.score}`}</strong>
                    <span>{h.correct}/{h.gradable} benar</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- MENGERJAKAN & TINJAUAN (satu layout) ---------------- */
  const isResult = phase === 'result' && result;
  const q = questions[index];
  const answer = answers[q._id];
  const isFlagged = Boolean(flags[q._id]);
  const status = isResult ? statusById[q._id] : null;
  const previousBest = isResult
    ? history.slice(1).reduce((best, h) => (h.score !== null && h.score > best ? h.score : best), -1)
    : -1;

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.headRow}>
          <div>
            <h1 className={styles.pageTitle}>{topic.title}</h1>
            <h2 className={styles.pageSubtitle}>{packet.title}</h2>
          </div>
          {!isResult && withTimer && (
            <span className={remaining <= 60 ? styles.timerLow : styles.timer}>{formatTime(remaining)}</span>
          )}
        </div>

        {isResult && (
          <div className={styles.summary}>
            <div className={styles.score}>{result.graded.score === null ? '-' : result.graded.score}</div>
            <div className={styles.summaryMeta}>
              <strong>Skor Try Out Anda</strong>
              <span>{result.graded.correct} benar, {result.graded.wrong} salah, {result.graded.skipped} dilewati{result.graded.ungraded > 0 ? `, ${result.graded.ungraded} tidak dinilai` : ''}</span>
              <span>Waktu {formatTime(result.durationSec)}{previousBest >= 0 && result.graded.score !== null ? ` · Terbaik sebelumnya: ${previousBest}` : ''}</span>
              <span className={styles.summaryHint}>Klik nomor soal di peta untuk melihat jawaban dan pembahasan.</span>
            </div>
            <div className={styles.summaryActions}>
              <button type="button" className={styles.primaryBtn} onClick={start}>Ulangi</button>
              <Link href={backLink} className={styles.linkBtn}>Kembali ke Mode Baca</Link>
            </div>
          </div>
        )}

        <div className={styles.box} style={{ fontSize: `${fontSize}px` }}>
          {q.supportHtml && (
            <details className={styles.support} open>
              <summary>Teks pendukung</summary>
              <Html html={q.supportHtml} className={styles.html} />
            </details>
          )}

          <div className={styles.qHeader}>
            <h3 className={styles.qNumber}>Soal {q.number}</h3>
            {isResult && <span className={styles[`badge_${status}`] || styles.badge_ungraded}>{STATUS_LABEL[status]}</span>}
          </div>

          <Html html={q.type === 'complex' ? stemWithoutTable(q.stemHtml) : q.stemHtml} className={styles.html} />

          <AnswerInput q={q} answer={answer} locked={Boolean(isResult)} onChange={(v) => setAnswer(q._id, v)} />

          {isResult && <ReviewDetail q={q} answer={answer} />}

          <div className={styles.footerNav}>
            <button type="button" className={styles.secondaryBtn} disabled={index === 0} onClick={() => setIndex(index - 1)}>
              « Sebelumnya
            </button>

            {!isResult && (
              <button type="button" className={isFlagged ? styles.chipActive : styles.chip} onClick={() => setFlags({ ...flags, [q._id]: !isFlagged })}>
                {isFlagged ? 'Hapus tanda ragu' : 'Tandai ragu'}
              </button>
            )}

            {index < questions.length - 1 ? (
              <button type="button" className={styles.secondaryBtn} onClick={() => setIndex(index + 1)}>Selanjutnya »</button>
            ) : isResult ? (
              <button type="button" className={styles.darkBtn} onClick={start}>Ulangi Ujian</button>
            ) : (
              <button type="button" className={styles.finishBtn} onClick={confirmFinish}>Selesai</button>
            )}
          </div>

          {!isResult && index < questions.length - 1 && (
            <div className={styles.finishRow}>
              <button type="button" className={styles.linkBtnPlain} onClick={confirmFinish}>Akhiri try out sekarang ({answeredCount}/{questions.length} terjawab)</button>
            </div>
          )}
        </div>

        <div style={{ paddingTop: '20px' }}>
          <span className={styles.adLabel}>Advertisement</span>
          <AdBanner dataAdSlot="4564146092" />
        </div>
      </main>

      <RightSidebar
        isCbtMode
        cbtProps={{
          cbtQuestions: questions,
          currentCbtIndex: index,
          userAnswers: {},
          isCbtSubmitted: Boolean(isResult),
          setCurrentCbtIndex: setIndex,
          tiles,
        }}
      />

      {/* Peta nomor soal untuk HP (strip melayang di bawah, seperti CBT lama) */}
      <div className={styles.mobileStrip}>
        {tiles.map((t, i) => {
          let cls = styles.tile;
          if (t.answered) cls += ` ${styles.tileAnswered}`;
          if (t.flagged) cls += ` ${styles.tileFlagged}`;
          if (i === index) cls += ` ${styles.tileCurrent}`;
          if (t.status === 'correct') cls += ` ${styles.tileCorrect}`;
          else if (t.status === 'wrong') cls += ` ${styles.tileWrong}`;
          else if (t.status === 'skipped') cls += ` ${styles.tileSkipped}`;
          if (t.status && i === index) cls += ` ${styles.tileCurrentReview}`;
          return (
            <button key={questions[i]._id} type="button" className={cls} onClick={() => setIndex(i)} aria-label={`Soal ${t.number}`}>
              {t.number}
              <span className={styles.miniLabel}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- input jawaban per tipe soal (terkunci saat tinjauan) ---------- */
function AnswerInput({ q, answer, locked, onChange }) {
  if (q.type === 'single') {
    if (!q.options.length) return <p className={styles.muted}>Opsi jawaban tidak tersedia untuk soal ini.</p>;
    return (
      <div className={styles.options} role="radiogroup">
        {q.options.map((o) => {
          let cls = answer === o.key ? styles.optionSelected : styles.option;
          if (locked && o.key === q.answer) cls = styles.optionCorrect;
          else if (locked && answer === o.key) cls = styles.optionWrong;
          return (
            <label key={o.key} className={cls}>
              <input type="radio" name={`q-${q._id}`} checked={answer === o.key} disabled={locked} onChange={() => onChange(o.key)} />
              <span className={styles.optKey}>{o.key}.</span>
              <Html html={o.html} inline className={styles.optHtml} />
            </label>
          );
        })}
      </div>
    );
  }

  if (q.type === 'complex') {
    const choices = complexChoices(q);
    const given = answer && typeof answer === 'object' ? answer : {};
    const key = Array.isArray(q.answer) ? q.answer : [];
    return (
      <div className={styles.tableWrap}>
        <table className={styles.complexTable}>
          <thead>
            <tr>
              <th>Pernyataan</th>
              {choices.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {q.statements.map((s, i) => (
              <tr key={i}>
                <td><Html html={s} inline className={styles.optHtml} /></td>
                {choices.map((c) => {
                  let cls = styles.centerCell;
                  if (locked && key[i] === c) cls += ` ${styles.cellCorrect}`;
                  else if (locked && given[i] === c) cls += ` ${styles.cellWrong}`;
                  return (
                    <td key={c} className={cls}>
                      <input type="radio" name={`q-${q._id}-${i}`} checked={given[i] === c} disabled={locked} onChange={() => onChange({ ...given, [i]: c })} aria-label={`Pernyataan ${i + 1}: ${c}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (q.type === 'short') {
    return (
      <div className={styles.shortBox}>
        <label className={styles.shortLabel} htmlFor={`short-${q._id}`}>Jawaban Anda</label>
        <input
          id={`short-${q._id}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={styles.shortInput}
          value={typeof answer === 'string' ? answer : ''}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ketik angka (boleh desimal atau pecahan, mis. 3/4)"
        />
      </div>
    );
  }

  return (
    <p className={styles.note}>
      Soal uraian: kerjakan di kertas, lalu bandingkan dengan pembahasan setelah try out selesai. Soal ini tidak masuk perhitungan skor.
    </p>
  );
}

/* ---------- kunci dan pembahasan (hanya saat tinjauan) ---------- */
function ReviewDetail({ q, answer }) {
  let yours = '';
  let correct = '';
  if (q.type === 'single') {
    yours = answer || '-';
    correct = q.answer;
  } else if (q.type === 'complex') {
    const given = answer && typeof answer === 'object' ? answer : {};
    yours = q.statements.map((_, i) => `${i + 1}. ${given[i] || '-'}`).join('  ');
    correct = (Array.isArray(q.answer) ? q.answer : []).map((a, i) => `${i + 1}. ${a}`).join('  ');
  } else if (q.type === 'short') {
    yours = typeof answer === 'string' && answer.trim() ? answer : '-';
    correct = q.answer;
  }

  return (
    <div className={styles.reviewBox}>
      {q.type !== 'essay' && (
        <p className={styles.answerLine}>
          <span>Jawaban Anda: <strong>{yours}</strong></span>
          {correct && <span>Kunci: <strong>{correct}</strong></span>}
        </p>
      )}
      {q.explanationHtml && (
        <div className={styles.explanation}>
          <strong>Pembahasan</strong>
          <Html html={q.explanationHtml} className={styles.html} />
        </div>
      )}
    </div>
  );
}
