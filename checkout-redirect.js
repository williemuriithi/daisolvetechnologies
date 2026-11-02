/* Load in /home AFTER site.js:  <script src="/checkout-redirect.js"></script>
   Sends every checkout trigger to /checkout instead of opening the modal. */
(function () {
  var TARGET = '/checkout';
  var TRIGGERS = '[data-open="checkout-or-shop"], [data-checkout], #checkoutBtn, a[href="#cart"], a[href="#checkout"]';
  var TEXT = /\b(checkout|check out|proceed to (pay|checkout)|place order|complete order|pay now)\b/i;

  function go(e) {
    e.preventDefault();
    e.stopImmediatePropagation(); // stops site.js from opening the modal
    window.location.href = TARGET;
  }

  // Capture phase = runs before site.js's own click handlers
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    if (t.closest(TRIGGERS)) return go(e);
    var btn = t.closest('button, a');
    if (btn && !btn.classList.contains('add-cart-btn') && TEXT.test(btn.textContent || '')) go(e);
  }, true);
})();
