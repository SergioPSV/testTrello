let tags = ["first", "second", "three", "four"];

window.TrelloPowerUp.initialize({
  "card-detail-badges": function (t, opts) {
    return t
      .card("name")
      .get("name")
      .then(function (cardName) {
        console.log("We just loaded the card name for fun: " + cardName);

        return [
          {
            // dynamic badges can have their function rerun after a set number
            // of seconds defined by refresh. Minimum of 10 seconds.
            dynamic: function () {
              // we could also return a Promise that resolves to this
              // as well if we needed to do something async first
              return {
                title: "Detail Badge",
                text: "Dynamic " + (Math.random() * 100).toFixed(0).toString(),
                color: "red",
                refresh: 10, // in seconds
              };
            },
          },
          {
            // its best to use static badges unless you need your badges
            // to refresh you can mix and match between static and dynamic
            title: "Detail Badge",
            text: "Static1",
            color: "blue",
          },
          {
            // card detail badges (those that appear on the back of cards)
            // also support callback functions so that you can open for example
            // open a popup on click
            title: "Popup Detail Badge",
            text: "Создать тег",
            color: "green",
            callback: function (t, opts) {
              // function to run on click
              // do something
              
              //t.alert({message: 'Сохраняем тег...', duration: 10});
              
              
              
              const items = (_, options) => tags.filter(tag =>
                tag.toLowerCase().includes(options.search.toLowerCase()) || options.search).map(tag => ({
                  alwaysVisible: options.search,
                  text: options.search,
                  callback: t.alert({message: 'Сохраняем тег...', duration: 10}),
                })
              );
              
//               const items = (_, options) => {
//                   alwaysVisible: options.search,
//                   text: options.search,
//                   callback: t.alert({message: 'Сохраняем тег...', duration: 10}),
//               };
        

              return t.popup({
                title: 'Теги проблем',
                items,
                search: {
                  count: 10,
                  placeholder: 'Пошук...',
                  empty: 'Нема результатів'
                }
              });

          

              
            },
          },
          
        ];
      });
  },
});
  

