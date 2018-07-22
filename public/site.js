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

  $('form.settings-form .form-control').toArray().forEach(function(el) {
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
        ShopifyApp.flashNotice("Saved successfully.");
      } else {
        ShopifyApp.flashError("ERROR: Could not save successfully.");
      }
      ShopifyApp.Bar.loadingOff();
    }
  });
}

$(function(){
  $('.setting-tabs .tab').on('click', function(){
    $('.setting-tabs .tab').removeClass('active');
    $('.setting-panel').removeClass('active');

    var target = $(this).data('target');
    $(this).addClass('active');
    $(target).addClass('active');
  });

});
