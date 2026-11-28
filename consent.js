/* Stagnum · consentimento e preparação para Google Consent Mode v2 / GTM.
 * Nenhum container de tags é carregado aqui. A identificação aleatória só é criada
 * após consentimento de analytics; não há fingerprinting de características do dispositivo.
 */
(() => {
  'use strict';
  const VERSION = 1;
  const CONSENT_COOKIE = 'stagnum_consent';
  const VISITOR_COOKIE = 'stagnum_visitor_id';
  const MAX_AGE = 60 * 60 * 24 * 180;
  const cookiePath = location.hostname.endsWith('.github.io') ? '/stagnum-website/' : '/';
  const expiry = `; Path=${cookiePath}; SameSite=Lax` + (location.protocol === 'https:' ? '; Secure' : '');
  const getCookie = name => document.cookie.split('; ').find(row => row.startsWith(name + '='))?.slice(name.length + 1) || '';
  const setCookie = (name, value) => { document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE}${expiry}`; };
  const deleteCookie = name => { document.cookie = `${name}=; Max-Age=0${expiry}`; };
  const parseConsent = () => {
    try {
      const p = JSON.parse(decodeURIComponent(getCookie(CONSENT_COOKIE)));
      return p?.v === VERSION && typeof p.analytics === 'boolean' && typeof p.marketing === 'boolean' ? p : null;
    } catch { return null; }
  };

  // Deve executar antes de qualquer inclusão futura do GTM/gtag.
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });

  const existing = parseConsent();
  const consentState = current => ({
    analytics_storage: current.analytics ? 'granted' : 'denied',
    ad_storage: current.marketing ? 'granted' : 'denied',
    ad_user_data: current.marketing ? 'granted' : 'denied',
    ad_personalization: current.marketing ? 'granted' : 'denied'
  });
  if (existing) window.gtag('consent', 'update', consentState(existing));

  function visitorId() {
    const prior = getCookie(VISITOR_COOKIE);
    if (prior) return decodeURIComponent(prior);
    if (!window.crypto?.randomUUID) return null;
    const id = crypto.randomUUID();
    setCookie(VISITOR_COOKIE, id);
    return id;
  }
  function syncVisitor(consent) {
    if (consent.analytics) return visitorId();
    deleteCookie(VISITOR_COOKIE);
    return null;
  }
  // Um consentimento salvo pode recuperar seu ID; sem consentimento, não é gerado.
  if (existing) {
    const id = syncVisitor(existing);
    if (id) window.dataLayer.push({ event: 'stagnum_visitor_ready', stagnum_visitor_id: id });
  }

  function save(analytics, marketing) {
    const consent = { v: VERSION, analytics: !!analytics, marketing: !!marketing, at: new Date().toISOString() };
    setCookie(CONSENT_COOKIE, JSON.stringify(consent));
    const id = syncVisitor(consent);
    window.gtag('consent', 'update', consentState(consent));
    window.dataLayer.push({ event: 'stagnum_consent_updated', consent_analytics: consent.analytics, consent_marketing: consent.marketing });
    if (id) window.dataLayer.push({ event: 'stagnum_visitor_ready', stagnum_visitor_id: id });
    // Integrações futuras podem ler window.StagnumPrivacy.getVisitorId() depois do opt-in.
    window.dispatchEvent(new CustomEvent('stagnum:consent', { detail: { analytics: consent.analytics, marketing: consent.marketing, hasVisitorId: !!id } }));
    banner.hidden = true;
    modal.hidden = true;
  }

  let banner, modal;
  function openPreferences() {
    const state = parseConsent();
    modal.querySelector('#stagnum-analytics').checked = !!state?.analytics;
    modal.querySelector('#stagnum-marketing').checked = !!state?.marketing;
    modal.hidden = false;
    modal.querySelector('#stagnum-analytics').focus();
  }
  function render() {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = 'consent.css';
    document.head.append(style);

    banner = document.createElement('aside');
    banner.id = 'stagnum-cookie-banner'; banner.className = 'stagnum-cookie-banner';
    banner.setAttribute('aria-label', 'Preferências de privacidade');
    banner.innerHTML = `<div class="stagnum-cookie-copy"><strong>Privacidade e cookies</strong><p>Utilizamos cookies necessários para lembrar suas escolhas. Com sua permissão, poderemos usar analytics e ferramentas de marketing no futuro. Nada disso está ativo agora.</p><a href="privacidade.html">Saiba como tratamos seus dados</a></div><div class="stagnum-cookie-actions"><button type="button" data-consent="reject">Rejeitar opcionais</button><button type="button" data-consent="settings">Personalizar</button><button type="button" class="stagnum-cookie-primary" data-consent="accept">Aceitar todos</button></div>`;

    modal = document.createElement('div');
    modal.id = 'stagnum-cookie-modal'; modal.className = 'stagnum-cookie-modal'; modal.hidden = true;
    modal.innerHTML = `<div class="stagnum-cookie-panel" role="dialog" aria-modal="true" aria-labelledby="stagnum-cookie-title"><h2 id="stagnum-cookie-title">Preferências de privacidade</h2><p>Você pode alterar sua decisão quando quiser. As opções de análise e marketing começam desativadas.</p><div class="stagnum-cookie-option"><span><strong>Necessários</strong><small>Guardar sua preferência de consentimento.</small></span><span class="stagnum-cookie-required">Sempre ativos</span></div><label class="stagnum-cookie-option"><span><strong>Estatísticas</strong><small>Permitem criar um ID aleatório de visitante, caso analytics seja ativado futuramente.</small></span><input id="stagnum-analytics" type="checkbox"></label><label class="stagnum-cookie-option"><span><strong>Marketing</strong><small>Autoriza futuras tags de publicidade e personalização.</small></span><input id="stagnum-marketing" type="checkbox"></label><div class="stagnum-cookie-actions"><button type="button" data-consent="cancel">Voltar</button><button type="button" data-consent="reject">Rejeitar opcionais</button><button class="stagnum-cookie-primary" type="button" data-consent="save">Salvar escolhas</button></div></div>`;

    document.body.append(banner, modal);
    banner.hidden = !!existing;
    document.querySelectorAll('[data-consent="accept"]').forEach(el => el.addEventListener('click', () => save(true, true)));
    document.querySelectorAll('[data-consent="reject"]').forEach(el => el.addEventListener('click', () => save(false, false)));
    document.querySelectorAll('[data-consent="settings"]').forEach(el => el.addEventListener('click', openPreferences));
    modal.querySelector('[data-consent="save"]').addEventListener('click', () => save(modal.querySelector('#stagnum-analytics').checked, modal.querySelector('#stagnum-marketing').checked));
    modal.querySelector('[data-consent="cancel"]').addEventListener('click', () => { modal.hidden = true; });
    modal.addEventListener('click', event => { if (event.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) modal.hidden = true; });

    const foot = document.querySelector('.footer-end, .site-footer, .seo-footer');
    if (foot) {
      const link = document.createElement('button');
      link.type = 'button'; link.className = 'stagnum-privacy-link'; link.textContent = 'Preferências de cookies';
      link.addEventListener('click', openPreferences);
      foot.append(link);
    }
  }
  window.StagnumPrivacy = Object.freeze({
    getConsent: () => parseConsent(),
    getVisitorId: () => parseConsent()?.analytics ? getCookie(VISITOR_COOKIE) && decodeURIComponent(getCookie(VISITOR_COOKIE)) : null,
    openPreferences
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
