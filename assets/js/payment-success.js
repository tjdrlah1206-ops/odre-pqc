(function () {
  var allowed = ['transaction_id', 'subscription_id', 'plan', 'units'];
  var source = new URLSearchParams(location.search);
  var target = new URLSearchParams();
  allowed.forEach(function (key) { var value = source.get(key); if (value) target.set(key, value); });
  var recover = document.getElementById('recover');
  if (recover) recover.href = '/payment/register/' + (target.size ? '?' + target.toString() : '');
}());
