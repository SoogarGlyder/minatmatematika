// Uji logika penilaian:  node scripts/test-grading.mjs
import assert from 'node:assert/strict';
import { answersMatch, gradeQuestion, gradeAttempt, complexChoices, defaultDurationSeconds } from '../src/lib/tryoutGrading.mjs';

assert.equal(answersMatch('270', ['270']), true);
assert.equal(answersMatch(' 270 m ', ['270']), true);
assert.equal(answersMatch('0,75', ['3/4']), true);
assert.equal(answersMatch('3/4', ['0.75']), true);
assert.equal(answersMatch('1.000', ['1000']), true);
assert.equal(answersMatch('271', ['270']), false);
assert.equal(answersMatch('', ['270']), false);
assert.equal(answersMatch('abc', ['270']), false);
assert.equal(answersMatch('270', []), false);

const single = { _id: 's', number: 1, type: 'single', answer: 'D' };
assert.equal(gradeQuestion(single, 'D'), 'correct');
assert.equal(gradeQuestion(single, 'A'), 'wrong');
assert.equal(gradeQuestion(single, undefined), 'skipped');
assert.equal(gradeQuestion({ ...single, answer: '' }, 'A'), 'ungraded');

const complex = { _id: 'c', number: 2, type: 'complex', answer: ['BENAR', 'SALAH'] };
assert.deepEqual(complexChoices(complex), ['BENAR', 'SALAH']);
assert.deepEqual(complexChoices({ ...complex, answer: ['YA', 'TIDAK'] }), ['YA', 'TIDAK']);
assert.equal(gradeQuestion(complex, { 0: 'BENAR', 1: 'SALAH' }), 'correct');
assert.equal(gradeQuestion(complex, { 0: 'BENAR', 1: 'BENAR' }), 'wrong');
assert.equal(gradeQuestion(complex, { 0: 'BENAR' }), 'wrong'); // belum lengkap = salah (semua atau tidak sama sekali)
assert.equal(gradeQuestion(complex, {}), 'skipped');

const short = { _id: 'h', number: 3, type: 'short', answer: '270 m', acceptedAnswers: ['270'] };
assert.equal(gradeQuestion(short, '270'), 'correct');
assert.equal(gradeQuestion(short, '260'), 'wrong');
assert.equal(gradeQuestion(short, '  '), 'skipped');
assert.equal(gradeQuestion({ ...short, acceptedAnswers: [] }, '270'), 'ungraded');

const essay = { _id: 'e', number: 4, type: 'essay', answer: '' };
assert.equal(gradeQuestion(essay, 'apa saja'), 'ungraded');

const res = gradeAttempt([single, complex, short, essay], { s: 'D', c: { 0: 'BENAR', 1: 'BENAR' } });
assert.equal(res.correct, 1);
assert.equal(res.wrong, 1);
assert.equal(res.skipped, 1);
assert.equal(res.ungraded, 1);
assert.equal(res.gradable, 3);
assert.equal(res.score, 33);
assert.equal(gradeAttempt([essay], {}).score, null);

assert.equal(defaultDurationSeconds([single]), 300);
assert.equal(defaultDurationSeconds(Array(20).fill(single)), 1800);

console.log('Semua pengujian penilaian lulus.');
