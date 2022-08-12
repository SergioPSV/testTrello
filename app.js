window.TrelloPowerUp.initialize({
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
                color: "red",
                refresh: 10, // in seconds
              };
            },
          },
          {
            title: "Popup Detail Badge",
            text: "Создать тег",
            callback: function (t, opts) {
                let tags = ["first", "second", "three", "four"];
                
                const items = (_, options) => {
        
                    let searchTag = tags.filter(tag =>
                        tag.toLowerCase().includes(options.search.toLowerCase()) || tag == options.search).map(tag => ({
                            alwaysVisible: false,
                            text: tag,
                            callback: t => t.alert({message: 'Сохраняем тег...', duration: 10}),
                        })
                    );

                    if (!searchTag.length) {
                        return [{
                            alwaysVisible: true,
                            text: options.search,
                            callback: t => t.popup({
                                                  type: 'confirm',
                                                  title: "Створити тег?",
                                                  message: options.search,
                                                  confirmText: "Тааак!",
                                                  onConfirm: t => confirmNewTag(t),
                                                  confirmStyle: 'primary',
                                                }),
                        }]
                    } else {
                        return searchTag
                    }
                  }
                
                const confirmNewTag = async (t, opts) => {
                        
                        t.alert({message: 'Зберігаю його для тебе ❤️', duration: 2})
                        
                       
                                                          
                        t.closePopup();
                   
                  }

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
