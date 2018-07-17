/* eslint-disable */

function submitShop() {
  var shop = $('div.install-form input').val();
  if (shop.length > 1) {
    var q = 'shop=' + shop;
    document.location.search = q;
  }
}

function saveSettings() {
  var shop = $('body').data('shop');
  var formData = {
    shopName: shop
  };

  $('form.settings-form input').toArray().forEach(function(el) {
    var name = $(el).attr('name');
    var val = $(el).val();
    formData[name] = val;
  });

  $.ajax({
    url: '/settings',
    type: "post",
    data: formData,
    success: function (res) {
      if (res.success) {
        window.location = '/?shop=' + shop;
      }
    }
  });
}
