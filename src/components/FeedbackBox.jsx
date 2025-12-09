import React from 'react';

export function FeedbackBox({ result, prefixOk = '✅', prefixBad = '⚠️' }) {
  if (!result) return null;

  const cls = 'feedback ' + (result.ok ? 'ok' : 'bad');
  const prefix = result.ok ? prefixOk : prefixBad;

  return <div className={cls}>{prefix} {result.reason}</div>;
}