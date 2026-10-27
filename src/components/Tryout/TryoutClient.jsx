// File: src/components/Tryout/TryoutClient.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import 'katex/dist/katex.min.css';
import styles from './Tryout.module.css';
// Kerangka halaman memakai stylesheet halaman paket supaya tampilannya sama persis dengan CBT lama
import old from '@/app/[topicSlug]/[packetSlug]/PacketReadPage.module.css';
import Breadcrumbs from '@/components/Breadcrumbs';
import CommentSection from '@/components/CommentSection';
import RightSidebar from '@/components/RightSidebar';
import AdBanner from '@/components/AdBanner';
import { AD_SLOTS } from '@/lib/adSlots';
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

const titleCase = (w) => w.charAt(0) + w.slice(1).toLowerCase(); // "TIDAK" -> "Tidak"

const hasValue = (a) => {
  if (a === undefined || a === null) return false;
  return typeof a === 'string' ? a.trim() !== '' : Object.keys(a).length > 0;
};

export default function TryoutClient({ topic, packet, questions, skippedCount }) {
  const router = useRouter();
  const fontCtx = useFontSize();
  const fontSize = fontCtx?.fontSize ?? 18;

  const [phase, setPhase] = useState('running'); // running | result (langsung mulai, seperti CBT lama)
  const [withTimer, setWithTimer] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const answersRef = useRef({});
  const startRef = useRef(0);
  const endRef = useRef(0);
  const finishedRef = useRef(false);

  const totalSeconds = useMemo(() => defaultDurationSeconds(questions), [questions]);
  const gradableCount = useMemo(() => questions.filter((q) => q.type !== 'essay').length, [questions]);

  useEffect(() => {
    setRemaining(totalSeconds);
    setHistory(getAttempts(topic.slug, packet.paket_slug));
  }, [topic.slug, packet.paket_slug, totalSeconds]);

  // Waktu pengerjaan mulai dihitung saat interaksi pertama, bukan saat halaman dimuat
  // (mis. saat pengunjung masih melihat Offerwall atau iklan berhadiah).
  const markStarted = () => {
    if (!startRef.current) startRef.current = Date.now();
  };

  const goTo = (i) => {
    markStarted();
    setIndex(i);
  };

  const setAnswer = (id, value) => {
    markStarted();
    answersRef.current = { ...answersRef.current, [id]: value };
    setAnswers(answersRef.current);
  };

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const graded = gradeAttempt(questions, answersRef.current);
    const durationSec = startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0;
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
    setShowScoreModal(true);
    setIndex(0);
  }, [questions, topic.slug, packet.paket_slug]);

  const restart = () => {
    answersRef.current = {};
    finishedRef.current = false;
    setAnswers({});
    setFlags({});
    setIndex(0);
    setResult(null);
    setShowScoreModal(false);
    startRef.current = 0;
    endRef.current = Date.now() + totalSeconds * 1000;
    setRemaining(totalSeconds);
    setPhase('running');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const enableTimer = () => {
    markStarted();
    endRef.current = Date.now() + totalSeconds * 1000;
    setRemaining(totalSeconds);
    setWithTimer(true);
  };

  // Timer (opsional) berbasis waktu akhir, tidak melenceng saat tab di latar belakang
  useEffect(() => {
    if (phase !== 'running' || !withTimer) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) finish();
    }, 500);
    return () => clearInterval(id);
  }, [phase, withTimer, finish]);

  const answeredCount = questions.filter((q) => hasValue(answers[q._id])).length;

  // Peringatan sebelum menutup tab bila sudah ada jawaban
  useEffect(() => {
    if (phase !== 'running' || answeredCount === 0) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [phase, answeredCount]);

  const confirmFinish = () => {
    const unanswered = gradableCount - questions.filter((q) => q.type !== 'essay' && hasValue(answers[q._id])).length;
    const msg = unanswered > 0
      ? `Masih ada ${unanswered} soal yang belum dijawab. Akhiri dan lihat hasilnya?`
      : 'Akhiri try out dan lihat hasilnya?';
    if (window.confirm(msg)) finish();
  };

  const backLink = `/${topic.slug}/${packet.paket_slug}`;

  const toggleCbtMode = () => {
    if (phase === 'running' && !window.confirm('Apakah Anda yakin ingin membatalkan ujian dan kembali ke Mode Baca?')) return;
    router.push(backLink);
  };

  const isResult = phase === 'result' && result;
  const statusById = isResult ? Object.fromEntries(result.graded.items.map((i) => [i.id, i.status])) : {};

  // Data tile untuk peta nomor soal (RightSidebar di desktop, strip melayang di HP)
  const tiles = questions.map((item) => {
    const a = answers[item._id];
    const answered = hasValue(a);
    let label = '-';
    if (item.type === 'single') label = typeof a === 'string' && a ? a : '-';
    else if (item.type === 'complex') label = answered ? (Object.keys(a).length >= item.statements.length ? '✓' : '…') : 'PGK';
    else if (item.type === 'short') label = answered ? '✓' : '-';
    else label = answered ? '✓' : 'URA';
    return {
      number: item.number,
      answered,
      flagged: Boolean(flags[item._id]),
      status: isResult ? statusById[item._id] : null,
      label,
    };
  });

  const q = questions[index];
  const answer = answers[q._id];
  const isFlagged = Boolean(flags[q._id]);
  const status = isResult ? statusById[q._id] : null;
  const previousBest = isResult
    ? history.slice(1).reduce((best, h) => (h.score !== null && h.score > best ? h.score : best), -1)
    : -1;

  return (
    <div className={old.holyGrailLayout}>
      {showScoreModal && isResult && (
        <div className={old.modalOverlay}>
          <div className={old.modalContent}>
            <h3 style={{ margin: '0 0 15px 0' }}>Skor Try Out Anda</h3>
            <div className={old.scoreCircle} style={{ margin: '0 auto 20px auto' }}>
              {result.graded.score === null ? '-' : result.graded.score}
            </div>
            <p style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>
              {result.graded.correct} benar, {result.graded.wrong} salah, {result.graded.skipped} dilewati
              {result.graded.ungraded > 0 ? `, ${result.graded.ungraded} tidak dinilai` : ''}.
            </p>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px', opacity: 0.75 }}>
              Waktu {formatTime(result.durationSec)}
              {previousBest >= 0 && result.graded.score !== null ? ` · Terbaik sebelumnya: ${previousBest}` : ''}
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '25px', opacity: 0.9 }}>
              Ujian selesai! Tutup pesan ini untuk melihat kunci jawaban dan meninjau pembahasan dari setiap soal.
            </p>
            <div className={old.modalActions}>
              <button onClick={() => setShowScoreModal(false)} className={old.closeModalBtn}>Tinjau Pembahasan</button>
              <button onClick={restart} className={old.resetModalBtn}>Ulangi Ujian</button>
            </div>
          </div>
        </div>
      )}

      <main className={old.mainContent}>
        <Breadcrumbs items={[{ label: topic.title, link: `/${topic.slug}` }, { label: packet.title, link: null }]} />
        <div className={old.chapterHeader}>
          <div>
            <h1>{topic.title}</h1>
            <h2>{packet.title}</h2>
          </div>
          <div className={old.singleToggleContainer}>
            <button onClick={toggleCbtMode} className={`${old.toggleBtn} ${old.toggleBtnActive}`}>
              Mode CBT: ON
            </button>
          </div>
        </div>
        <hr className={old.divider} />

        <div className={old.cbtSimulatorLayout}>
          <div>
            <div className={styles.toolRow}>
              <span className={styles.progress}>
                {skippedCount > 0 ? `${skippedCount} soal sedang diperbaiki dan dilewati · ` : ''}
                {answeredCount}/{questions.length} terjawab
              </span>
              {!isResult && (withTimer ? (
                <span className={remaining <= 60 ? styles.timerLow : styles.timer}>⏱ {formatTime(remaining)}</span>
              ) : (
                <button type="button" className={styles.chip} onClick={enableTimer}>
                  ⏱ Aktifkan timer ({Math.round(totalSeconds / 60)} menit)
                </button>
              ))}
            </div>

            <div className={old.cbtQuestionBox}>
              <div className={old.content} style={{ fontSize: `${fontSize}px` }}>
                {q.supportHtml && (
                  <div>
                    <h3>Teks Pendukung</h3>
                    <Html html={q.supportHtml} />
                  </div>
                )}
                <div className={styles.qHeader}>
                  <h3>Nomor {q.number}</h3>
                  {isResult && <span className={styles[`badge_${status}`] || styles.badge_ungraded}>{STATUS_LABEL[status]}</span>}
                </div>
                <Html html={q.type === 'complex' ? stemWithoutTable(q.stemHtml) : q.stemHtml} />
              </div>

              <AnswerInput q={q} answer={answer} locked={Boolean(isResult)} onChange={(v) => setAnswer(q._id, v)} />

              {isResult && !showScoreModal && <ReviewDetail q={q} answer={answer} fontSize={fontSize} />}

              <div className={old.cbtFooterNav}>
                <button onClick={() => goTo(Math.max(0, index - 1))} disabled={index === 0} className={old.navCbtBtn}>
                  « Sebelumnya
                </button>

                {!isResult && (
                  <button type="button" className={isFlagged ? styles.chipActive : styles.chip} onClick={() => setFlags({ ...flags, [q._id]: !isFlagged })}>
                    {isFlagged ? 'Hapus tanda ragu' : 'Tandai ragu'}
                  </button>
                )}

                {index < questions.length - 1 ? (
                  <button onClick={() => goTo(Math.min(questions.length - 1, index + 1))} className={old.navCbtBtn}>
                    Selanjutnya »
                  </button>
                ) : isResult ? (
                  <button onClick={restart} className={old.submitCbtBtn} style={{ background: '#374151' }}>Ulangi Ujian</button>
                ) : (
                  <button onClick={confirmFinish} className={old.submitCbtBtn}>Selesai</button>
                )}
              </div>

              {!isResult && index < questions.length - 1 && (
                <div className={styles.finishRow}>
                  <button type="button" className={styles.linkBtnPlain} onClick={confirmFinish}>Akhiri try out sekarang</button>
                </div>
              )}
            </div>

            {/* Jarak 48px dari tombol navigasi agar iklan tidak terklik tidak sengaja.
                Ganti ID slot-nya di src/lib/adSlots.js (CBT_BAWAH_SOAL). */}
            <div style={{ paddingTop: '48px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', textAlign: 'center', marginBottom: '20px' }}>Advertisement</span>
              <AdBanner dataAdSlot={AD_SLOTS.CBT_BAWAH_SOAL} />
            </div>
          </div>

          {/* Peta nomor soal untuk HP: strip melayang di bawah (sama seperti CBT lama) */}
          <div className={old.mobileCbtGrid}>
            {tiles.map((t, i) => {
              let cls = old.mobileGridTile;
              if (t.answered) cls += ` ${old.mobileGridTileAnswered}`;
              if (t.flagged) cls += ` ${styles.tileFlagged}`;
              if (i === index) cls += ` ${old.mobileGridTileCurrent}`;
              if (t.status === 'correct') cls += ` ${old.mobileGridTileCorrect}`;
              else if (t.status === 'wrong') cls += ` ${old.mobileGridTileWrong}`;
              else if (t.status === 'skipped') cls += ` ${styles.tileSkipped}`;
              if (t.status && i === index) cls += ` ${old.mobileGridTileCurrentReview}`;
              return (
                <button key={questions[i]._id} onClick={() => goTo(i)} className={cls}>
                  {t.number}
                  <span className={old.miniLabel}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <CommentSection topicSlug={topic.slug} paketSlug={packet.paket_slug} />
      </main>

      <RightSidebar
        isCbtMode
        cbtProps={{
          cbtQuestions: questions,
          currentCbtIndex: index,
          userAnswers: {},
          isCbtSubmitted: Boolean(isResult),
          setCurrentCbtIndex: goTo,
          tiles,
        }}
      />
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
        {!locked && <p className={styles.clickHint}>Silakan klik langsung pada pilihan kotak di atas untuk menjawab.</p>}
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
              {choices.map((c) => <th key={c} className={styles.centerCell}>{titleCase(c)}</th>)}
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
                      <input type="radio" name={`q-${q._id}-${i}`} checked={given[i] === c} disabled={locked} onChange={() => onChange({ ...given, [i]: c })} aria-label={`Pernyataan ${i + 1}: ${titleCase(c)}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!locked && <p className={styles.clickHint}>Silakan klik langsung pada tabel di atas untuk menjawab Pernyataan ({choices.map(titleCase).join('/')}).</p>}
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
        <span className={styles.hint}>Satuan tidak perlu ditulis.</span>
      </div>
    );
  }

  // essay (uraian): jawaban ditulis bebas, tidak dinilai otomatis
  return (
    <div className={styles.shortBox}>
      <label className={styles.shortLabel} htmlFor={`essay-${q._id}`}>Jawaban / langkah pengerjaan Anda</label>
      <textarea
        id={`essay-${q._id}`}
        className={styles.essayInput}
        rows={6}
        value={typeof answer === 'string' ? answer : ''}
        disabled={locked}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tulis jawaban Anda di sini (opsional)."
      />
      <span className={styles.hint}>Soal uraian tidak dinilai otomatis. Setelah selesai, bandingkan jawaban Anda dengan pembahasan.</span>
    </div>
  );
}

/* ---------- kunci dan pembahasan (hanya saat tinjauan) ---------- */
function ReviewDetail({ q, answer, fontSize }) {
  let yours = '';
  let correct = '';
  if (q.type === 'single') {
    yours = answer || '-';
    correct = q.answer;
  } else if (q.type === 'complex') {
    const given = answer && typeof answer === 'object' ? answer : {};
    yours = q.statements.map((_, i) => `${i + 1}. ${given[i] ? titleCase(given[i]) : '-'}`).join('  ');
    correct = (Array.isArray(q.answer) ? q.answer : []).map((a, i) => `${i + 1}. ${titleCase(a)}`).join('  ');
  } else if (q.type === 'short') {
    yours = typeof answer === 'string' && answer.trim() ? answer : '-';
    correct = q.answer;
  }
  const essayText = q.type === 'essay' && typeof answer === 'string' ? answer.trim() : '';

  return (
    <div className={styles.reviewBox} style={{ fontSize: `${fontSize}px` }}>
      {q.type === 'essay' && (
        <p className={styles.answerLine}>
          <span>Jawaban Anda: {essayText ? <span className={styles.essayAnswer}>{essayText}</span> : <strong>-</strong>}</span>
        </p>
      )}
      {q.type !== 'essay' && (
        <p className={styles.answerLine}>
          <span>Jawaban Anda: <strong>{yours}</strong></span>
          {correct && <span>Kunci: <strong>{correct}</strong></span>}
        </p>
      )}
      {q.explanationHtml && (
        <div className={styles.explanation}>
          <strong>Pembahasan</strong>
          <Html html={q.explanationHtml} className={old.content} />
        </div>
      )}
    </div>
  );
}
