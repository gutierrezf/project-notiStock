function submitShop() {
  var shop = $("div.install-form input").val();
  if (shop.length > 1) {
    var q = "shop=" + shop;
    document.location.search = q;
  }
}
