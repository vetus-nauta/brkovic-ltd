(function () {
  function init() {
    const modal = document.getElementById('gamePromoModal');
    const triggers = document.querySelectorAll('[data-game-promo-open]');
    if (!modal || !triggers.length) return;

    const panel = modal.querySelector('.game-promo-modal__panel');
    const closeNodes = modal.querySelectorAll('[data-game-promo-close]');
    let lastFocus = null;

    function openModal(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        }
      }
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('game-promo-modal-open');
      window.setTimeout(() => {
        const closeButton = modal.querySelector('.game-promo-modal__close');
        closeButton?.focus();
      }, 0);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('game-promo-modal-open');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }

    triggers.forEach((trigger) => trigger.addEventListener('click', openModal, true));
    closeNodes.forEach((node) => node.addEventListener('click', closeModal));

    document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        closeModal();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusables = Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
