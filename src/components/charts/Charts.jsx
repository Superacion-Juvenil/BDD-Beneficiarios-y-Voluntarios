const PALETTE = ['#1A56A4', '#059669', '#7C3AED', '#D97706', '#DC2626', '#0891B2', '#DB2777', '#65A30D', '#9333EA', '#EA580C'];

export function Card({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: 'white', borderRadius: '12px', padding: '18px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', ...style,
    }}>
      <h3 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
      {subtitle && <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#6B7280' }}>{subtitle}</p>}
      {!subtitle && <div style={{ height: 8 }} />}
      {children}
    </div>
  );
}

// Horizontal bar chart — good for variable-length category labels.
export function HBarChart({ data, color = '#1A56A4', maxBars = 12 }) {
  const sorted = [...data].filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, maxBars);
  if (sorted.length === 0) return <Empty />;
  const max = Math.max(...sorted.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {sorted.map(d => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 40px', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.label}>{d.label}</div>
          <div style={{ background: '#F3F4F6', borderRadius: '4px', height: '18px', overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
          <div style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}

// Grouped vertical bar chart — series per category (e.g., Hombres vs Mujeres por programa).
export function GroupedBarChart({ categories, series, height = 220 }) {
  const all = categories.flatMap(c => series.map(s => s.values[c] || 0));
  const max = Math.max(1, ...all);
  const ticks = niceTicks(max, 4);
  const yMax = ticks[ticks.length - 1];
  const W = Math.max(420, categories.length * (60 + series.length * 22));
  const H = height;
  const padL = 38, padR = 12, padT = 10, padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const groupW = innerW / categories.length;
  const barW = Math.min(28, (groupW - 14) / series.length);

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block' }}>
          {ticks.map(t => {
            const y = padT + innerH - (t / yMax) * innerH;
            return (
              <g key={t}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F3F4F6" />
                <text x={padL - 6} y={y + 4} fontSize="10" fill="#6B7280" textAnchor="end">{t}</text>
              </g>
            );
          })}
          {categories.map((cat, i) => {
            const x0 = padL + groupW * i + (groupW - barW * series.length) / 2;
            return (
              <g key={cat}>
                {series.map((s, j) => {
                  const v = s.values[cat] || 0;
                  const h = (v / yMax) * innerH;
                  const x = x0 + j * barW;
                  const y = padT + innerH - h;
                  return (
                    <g key={s.name}>
                      <rect x={x} y={y} width={barW - 2} height={h} fill={s.color} rx="2">
                        <title>{`${s.name} — ${cat}: ${v}`}</title>
                      </rect>
                      {v > 0 && h > 14 && (
                        <text x={x + (barW - 2) / 2} y={y + 11} fontSize="9" fill="white" textAnchor="middle" fontWeight="700">{v}</text>
                      )}
                    </g>
                  );
                })}
                <text x={padL + groupW * i + groupW / 2} y={padT + innerH + 14} fontSize="10" fill="#374151" textAnchor="middle">
                  {truncate(cat, 14)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <Legend items={series.map(s => ({ label: s.name, color: s.color }))} />
    </div>
  );
}

export function DonutChart({ data, size = 180 }) {
  const items = data.filter(d => d.value > 0);
  const total = items.reduce((a, b) => a + b.value, 0);
  if (total === 0) return <Empty />;
  const r = size / 2 - 6;
  const cx = size / 2, cy = size / 2;
  const inner = r * 0.6;
  let acc = 0;
  const slices = items.map((d, i) => {
    const start = acc / total;
    acc += d.value;
    const end = acc / total;
    const color = d.color || PALETTE[i % PALETTE.length];
    return { ...d, color, path: arcPath(cx, cy, r, inner, start, end) };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <svg width={size} height={size}>
        {slices.map(s => (
          <path key={s.label} d={s.path} fill={s.color}>
            <title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}</title>
          </path>
        ))}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#6B7280">Total</text>
      </svg>
      <Legend items={slices.map(s => ({ label: `${s.label} (${s.value})`, color: s.color }))} vertical />
    </div>
  );
}

function Legend({ items, vertical }) {
  return (
    <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? '6px' : '14px', flexWrap: 'wrap', marginTop: vertical ? 0 : '8px', fontSize: '0.78rem', color: '#374151' }}>
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', background: it.color, borderRadius: '2px', display: 'inline-block' }} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: 0 }}>Sin datos</p>;
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function niceTicks(max, count) {
  const step = Math.ceil(max / count);
  const pow = Math.pow(10, Math.max(0, String(step).length - 1));
  const rounded = Math.ceil(step / pow) * pow;
  return Array.from({ length: count + 1 }, (_, i) => i * rounded);
}

function arcPath(cx, cy, r, ir, start, end) {
  if (end - start >= 0.9999) {
    // Full circle — draw two arcs.
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} M ${cx - ir} ${cy} A ${ir} ${ir} 0 1 1 ${cx + ir} ${cy} A ${ir} ${ir} 0 1 1 ${cx - ir} ${cy} Z`;
  }
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = end * Math.PI * 2 - Math.PI / 2;
  const large = end - start > 0.5 ? 1 : 0;
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const xi1 = cx + ir * Math.cos(a1), yi1 = cy + ir * Math.sin(a1);
  const xi0 = cx + ir * Math.cos(a0), yi0 = cy + ir * Math.sin(a0);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z`;
}

export { PALETTE };
