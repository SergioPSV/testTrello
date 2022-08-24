window.TrelloPowerUp.initialize({
    "card-badges": function (t, opts) {
      let cardAttachments = opts.attachments; // Trello passes you the attachments on the card
      return t
        .card("name")
        .get("name")
        .then(function (cardName) {
          return [
            {

              dynamic: function () {

                return {
                  text: "Dynamic " + (Math.random() * 100).toFixed(0).toString(),
                  color: "green",
                  refresh: 60, // in seconds
                };
              },
            },
            {
              text: "Static",
              color: null,
            },
          ];
        });
    },
  "card-detail-badges": function (t, opts) {
    return t
      .card("name")
      .get("name")
      .then(function (cardName) {
        console.log("We just loaded the card name for fun: " + cardName);

        return [
          {
            dynamic: function () {
              return {
                title: "Detail Badge",
                text: "Dynamic " + (Math.random() * 100).toFixed(0).toString(),
                color: "green",
                refresh: 10, // in seconds
              };
            },
          },
          {
            title: "Detail Badge",
            text: "Static",
            color: null,
          },
          {
            title: "Popup Detail Badge",
            text: "Popup",
            callback: function (t, opts) {},
          },
          {
            title: "URL Detail Badge",
            text: "URL",
            url: "https://trello.com/home",
            target: "Trello Landing Page", 
          },
        ];
      });
  }
  });
