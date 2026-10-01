(() => {
  'use strict';

  const API = 'https://api.mrwang.com/whois.php?domain=';

  const $ = (selector) => document.querySelector(selector);

  function normalizeDomain(input) {
    let value = String(input || '').trim().toLowerCase();
    if (!value) return '';
    value = value.replace(/^https?:\/\//i, '').replace(/^\/\//, '');
    value = value.split('/')[0].split('?')[0].split('#')[0];
    value = value.replace(/^www\./, '').replace(/\.+$/, '');
    try { value = decodeURIComponent(value); } catch (_) {}
    return value;
  }

  function isValidDomain(domain) {
    if (!domain || domain.length > 253 || domain.includes(' ')) return false;
    if (domain === 'localhost') return false;
    return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(domain) || /^xn--[a-z0-9-]+(?:\.xn--[a-z0-9-]+)+$/i.test(domain);
  }

  function goToDomain(raw) {
    const domain = normalizeDomain(raw);
    const error = $('#form-error');
    if (!isValidDomain(domain)) {
      if (error) {
        error.textContent = 'Please enter a valid domain, such as example.com.';
        error.hidden = false;
      }
      return;
    }
    location.href = '/' + encodeURI(domain);
  }

  function bindSearch() {
    const form = $('#lookup-form');
    const input = $('#domain-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        goToDomain(input.value);
      });
      input.addEventListener('input', () => {
        const error = $('#form-error');
        if (error) error.hidden = true;
      });
    }
    document.querySelectorAll('[data-domain]').forEach((btn) => {
      btn.addEventListener('click', () => goToDomain(btn.dataset.domain));
    });
  }

  function pathDomain() {
    const path = location.pathname.replace(/^\/+|\/+$/g, '');
    if (!path || path === '404.html') return '';
    return normalizeDomain(path);
  }

  function formatDate(value) {
    if (!value) return 'Not available';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      const simple = String(value).match(/^\d{4}-\d{2}-\d{2}/);
      return simple ? simple[0] : String(value);
    }
    return new Intl.DateTimeFormat('en', {year:'numeric',month:'short',day:'2-digit'}).format(d);
  }

  function humanAgeFromSeconds(seconds) {
    if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '';
    let days = Math.floor(Number(seconds) / 86400);
    const years = Math.floor(days / 365.2425);
    days -= Math.floor(years * 365.2425);
    const months = Math.floor(days / 30.44);
    days -= Math.floor(months * 30.44);
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (!years && !months && days >= 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    return parts.slice(0, 2).join(' ');
  }

  function readableDuration(apiValue, seconds, mode) {
    const precise = humanAgeFromSeconds(seconds);
    if (precise) {
      if (mode === 'age') return precise;
      if (mode === 'expires') return `${precise} remaining`;
      if (mode === 'updated') return `${precise} ago`;
    }
    if (!apiValue) return 'Not available';
    return apiValue;
  }

  function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || 'Not available';
  }

  function safeUrl(raw) {
    if (!raw) return '';
    try {
      const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
    } catch (_) { return ''; }
  }

  function renderDetailLink(id, raw) {
    const el = document.getElementById(id);
    if (!el) return;
    const url = safeUrl(raw);
    if (!url) {
      el.textContent = raw || 'Not available';
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer nofollow';
    a.textContent = raw.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    el.replaceChildren(a);
  }

  function setDynamicMeta(domain, data) {
    document.title = `${domain} WHOIS — Domain Age, Registrar & Expiry`;
    const description = `${domain} WHOIS lookup: registration date, domain age, expiration date, registrar, nameservers, DNSSEC and domain status.`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);

    // GitHub Pages serves this through 404.html, so avoid presenting it as a true indexable 200 page.
    const robots = $('#robots-meta');
    if (robots) robots.setAttribute('content', 'noindex,follow');
  }

  function renderResult(data) {
    const domain = String(data.domain || pathDomain()).toLowerCase();
    const registered = data.registered !== false;
    setDynamicMeta(domain, data);

    text('domain-title', domain);
    text('detail-domain', domain);

    const statusPill = $('#registration-status');
    if (statusPill) {
      statusPill.textContent = registered ? 'Registered' : 'Available / Unregistered';
      statusPill.classList.toggle('unregistered', !registered);
    }

    const age = readableDuration(data.createdAgo, data.createdAgoSeconds, 'age');
    text('domain-age', age);
    text('domain-age-summary', registered ? `${age} old` : 'No active registration found');
    text('created-date-small', data.creationDate ? `Since ${formatDate(data.creationDateISO8601 || data.creationDate)}` : 'Registration date unavailable');

    text('creation-date', formatDate(data.creationDateISO8601 || data.creationDate));
    text('creation-relative', data.createdAgoSeconds != null ? `${humanAgeFromSeconds(data.createdAgoSeconds)} ago` : (data.createdAgo || 'Not available'));

    text('expiration-date', formatDate(data.expirationDateISO8601 || data.expirationDate));
    text('expiration-relative', readableDuration(data.expiresIn, data.expiresInSeconds, 'expires'));

    text('updated-date', formatDate(data.updatedDateISO8601 || data.updatedDate));
    text('updated-relative', readableDuration(data.updatedAgo, data.updatedAgoSeconds, 'updated'));

    text('registrar', data.registrar);
    text('registrar-iana', data.registrarIANAId);
    text('whois-server', data.registrarWHOISServer || data.registryWHOISServer);
    renderDetailLink('registrar-url', data.registrarURL);

    let dnssec = 'Not available';
    if (data.dnssecSigned === true) dnssec = 'Signed';
    else if (data.dnssecSigned === false) dnssec = 'Unsigned';
    text('dnssec', dnssec);

    const nsBox = $('#nameservers');
    if (nsBox) {
      nsBox.replaceChildren();
      const servers = Array.isArray(data.nameServers) ? data.nameServers : [];
      if (!servers.length) {
        const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'No nameservers returned.'; nsBox.appendChild(empty);
      } else servers.forEach((ns) => {
        const chip = document.createElement('div'); chip.className = 'chip'; chip.textContent = ns; nsBox.appendChild(chip);
      });
    }

    const statusBox = $('#status-list');
    if (statusBox) {
      statusBox.replaceChildren();
      const statuses = Array.isArray(data.status) ? data.status : [];
      if (!statuses.length) {
        const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'No registry status returned.'; statusBox.appendChild(empty);
      } else statuses.forEach((item) => {
        const row = document.createElement('div'); row.className = 'status-item';
        const label = document.createElement('strong'); label.textContent = item && item.text ? item.text : String(item || 'Unknown');
        row.appendChild(label);
        const url = item && item.url ? safeUrl(item.url) : '';
        if (url) {
          const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer nofollow'; a.textContent = 'About status'; row.appendChild(a);
        }
        statusBox.appendChild(row);
      });
    }

    text('raw-whois', data.whoisData || 'Raw WHOIS data is not available for this domain.');

    const copyWhois = $('#copy-whois');
    if (copyWhois) copyWhois.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(data.whoisData || '');
        const old = copyWhois.textContent; copyWhois.textContent = 'Copied'; setTimeout(() => copyWhois.textContent = old, 1300);
      } catch (_) {}
    });

    const copyLink = $('#copy-link');
    if (copyLink) copyLink.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        const old = copyLink.textContent; copyLink.textContent = 'Copied'; setTimeout(() => copyLink.textContent = old, 1300);
      } catch (_) {}
    });
  }

  function showError(title, message) {
    const loading = $('#loading-state');
    const result = $('#result-view');
    const error = $('#error-view');
    if (loading) loading.hidden = true;
    if (result) result.hidden = true;
    if (error) error.hidden = false;
    text('error-title', title);
    text('error-message', message);
  }

  async function loadDomain() {
    const result = $('#result-view');
    if (!result) return;

    const domain = pathDomain();
    const input = $('#domain-input');
    if (input) input.value = domain;

    if (!isValidDomain(domain)) {
      showError('Invalid domain', 'The URL does not contain a valid domain name.');
      return;
    }

    try {
      const response = await fetch(API + encodeURIComponent(domain), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!json || json.code !== 0 || !json.data) {
        throw new Error(json && json.msg ? json.msg : 'WHOIS query failed');
      }
      renderResult(json.data);
      const loading = $('#loading-state');
      if (loading) loading.hidden = true;
      result.hidden = false;
    } catch (err) {
      showError('Lookup unavailable', 'The WHOIS service could not return data right now. Please try again later or search another domain.');
    }
  }

  bindSearch();
  loadDomain();
})();
