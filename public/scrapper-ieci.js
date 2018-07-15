/* eslint-disable */

var Scrapper = {
  getPageData: function() {
    return $('.aaCenssacustlkupNavCustTbl').toArray()
      .map((contractor) => {
        return {
          name: this.getName(contractor),
          email: this.getEmail(contractor),
          phone: this.getPhone(contractor),
          address: this.getAddress(contractor),
          website: this.getWeb(contractor),
          source: 'ieci'
        }
      });
  },
  getEmail: function(contractor) {
    return $(contractor).find('.aaCenssacustlkupNavCustInnerTbl td.aaColData a').toArray()
      .map(function(link){
        return $(link).attr('href');
      })
      .filter(function(link){
        return link.indexOf('mailto') !== -1;
      })
      .reduce((result, link) => result += (link.split('mailto:')[1] + ' ') , '');
  },
  getName: function(contractor) {
    return $(contractor).find('.aaNavCol1 a').text().replace('&', 'and') || '';
  },
  getPhone: function(contractor) {
    var phone = $(contractor).find('.aaCenssacustlkupNavCustInnerTbl td.aaColData').get(1);
    return $(phone).text().trim() || '';
  },
  getWeb: function(contractor) {
    return $(contractor).find('.aaCenssacustlkupNavCustInnerTbl td.aaColData a').toArray()
      .map(function(link){
        return $(link).attr('href');
      })
      .filter(function(link){
        return link.indexOf('mailto') === -1;
      })
      .reduce((result, link) => result += (link + ' ') , '');
  },
  getAddress: function(contractor) {
    var address = $(contractor).find('.aaCenssacustlkupNavCustInnerTbl td.aaColData').get(0);
    return $(address).text().trim() || '';
  },
  getJSON: function() {
    return JSON.stringify(this.getPageData());
  },
  postPageData: function() {
    var url = 'https://5d818184.ngrok.io/api/add-contractors';
    var data = this.getJSON();
    console.log(data);
    $.ajax({
      type: "POST",
      url: url,
      data: {
        json: data
      },
      success: (result) => {
        console.log('data posted', result);
      }
    });
  }
}
