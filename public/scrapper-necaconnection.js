/* eslint-disable */

var Scrapper = {
  getPageData: function() {
    return $('.search-results').first().find('.col-sm-4.ng-scope').toArray()
      .map((contractor) => {
        return {
          name: this.getName(contractor),
          email: this.getEmail(contractor),
          phone: this.getPhone(contractor),
          address: this.getAddress(contractor),
          website: this.getWeb(contractor),
          state: this.getState(),
          source: 'necaconnection'
        }
      });
  },
  getState: function() {
    return $('.criteria-list li').text().trim() || '';
  },
  getEmail: function(contractor) {
    return $(contractor).find('.member-data__actions a').attr('href').split('mailto:')[1] || '';
  },
  getName: function(contractor) {
    return $(contractor).find('.member-data__name a').text().replace('&', 'and') || '';
  },
  getPhone: function(contractor) {
    return $(contractor).find('.member-data__phone a').text() || '';
  },
  getWeb: function(contractor) {
    return $(contractor).find('.member-data__website a').text() || '';
  },
  getAddress: function(contractor) {
    return $(contractor).find('.member-data__address span').toArray()
      .reduce((result, span) => result += ($(span).text() + ' ') , '');
  },
  getJSON: function() {
    return JSON.stringify(this.getPageData());
  },
  nextPage: function() {
    var oldpage = $(".pagination").first().find('li.active a').text();
    $(".pagination").first().find('a').last().click();
    var that = this;

    console.log('current page: ' + oldpage);

    setTimeout(function() {
      var newcurrent = $(".pagination").first().find('li.active a').text();
      console.log('3 seconds, new page: ' + newcurrent);

      if (newcurrent != oldpage) {
        that.postPageData();
      } else {
        alert('scrap done');
      }
    }, 3000);


  },
  postPageData: function() {
    var url = 'https://c413aa17.ngrok.io/api/add-contractors';
    var data = this.getJSON();
    $.ajax({
      type: "POST",
      url: url,
      data: {
        json: data
      },
      success: (result) => {
        console.log('data posted', result);
        this.nextPage();
      }
    });
  }
}
