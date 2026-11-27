// DealHound's HTML: the board, the deal cards and the single-deal page.
// Every value is escaped before it reaches the page. The verdict badge and
// the evidence line are on every card, so a shopper sees at a glance whether
// a deal is really a deal.

import { checkTime, percentOff, saved, usd, verdictLabel } from "./format.js";

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function badge(deal) {
  return `<span class="verdict verdict-${deal.verdict}">${verdictLabel(deal.verdict)}</span>`;
}

export function card(deal) {
  const pct = percentOff(deal);
  return `<article class="card">
  <div class="card-top">${badge(deal)}<span class="off">-${pct}%</span></div>
  <h2><a href="#/deal/${encodeURIComponent(deal.id)}">${escape(deal.title)}</a></h2>
  <p class="meta">${escape(deal.store)} &middot; ${escape(deal.category)}</p>
  <p class="price"><strong>${usd(deal.price)}</strong> <s>${usd(deal.was)}</s> <span class="save">save ${usd(saved(deal))}</span></p>
  <p class="evidence">${escape(deal.evidence)}</p>
  <p class="checked">Checked ${checkTime(deal.checked)}</p>
  <p class="links"><a class="store-link" href="${escape(deal.url)}" rel="noopener" target="_blank">View at ${escape(deal.store)} &nearr;</a></p>
</article>`;
}

export function board(deals, total, filters) {
  const list = deals.map(card).join("\n");
  const empty = `<p class="empty">No deals match those filters. <a href="#/">Clear the filters</a> to see all ${total} deals.</p>`;
  return `<p class="count"><strong>${deals.length}</strong> of ${total} deals shown &middot; sorted: ${escape(filters.sortLabel)}</p>
<div class="grid">${deals.length ? list : empty}</div>`;
}

export function detail(deal, sameProduct) {
  const pct = percentOff(deal);
  const others = sameProduct
    .filter((d) => d.id !== deal.id)
    .map(
      (d) =>
        `<li><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.store)}: ${usd(d.price)}</a> (usually ${usd(d.was)}, -${percentOff(d)}%)</li>`,
    )
    .join("");
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
<article class="detail">
  <div class="card-top">${badge(deal)}<span class="off">-${pct}%</span></div>
  <h1>${escape(deal.title)}</h1>
  <p class="meta">${escape(deal.store)} &middot; ${escape(deal.category)}</p>
  <p class="price big"><strong>${usd(deal.price)}</strong> <s>${usd(deal.was)}</s> <span class="save">save ${usd(saved(deal))} (${pct}% off)</span></p>
  <h2>Is it really a deal?</h2>
  <p>${escape(deal.evidence)}</p>
  <dl>
    <dt>Store</dt><dd>${escape(deal.store)}</dd>
    <dt>Sale price</dt><dd>${usd(deal.price)}</dd>
    <dt>Usual price</dt><dd>${usd(deal.was)}</dd>
    <dt>Discount</dt><dd>${pct}% off, saving ${usd(saved(deal))}</dd>
    <dt>Price checked</dt><dd>${checkTime(deal.checked)}</dd>
    <dt>Read in</dt><dd>${escape(deal.source)}</dd>
  </dl>
  ${others ? `<h2>Same product at another store</h2><ul class="compare">${others}</ul>` : ""}
  <p class="links"><a class="store-link" href="${escape(deal.url)}" rel="noopener" target="_blank">View it at ${escape(deal.store)} &nearr;</a></p>
  <p class="note">Prices move on Black Friday. Check the price at the store before you pay.</p>
</article>`;
}

export function missing() {
  return `<h1>Deal not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
