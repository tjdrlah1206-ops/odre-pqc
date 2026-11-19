/* Owner-authorized retirement: diagnostic purchase entry disabled. */
window.ODRE_PQC_ACTIONS_DISABLED = true;
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('button').forEach(function (button) {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    button.title = 'Purchases are unavailable.';
  });
});
