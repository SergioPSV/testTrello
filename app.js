window.TrelloPowerUp.initialize({
  "card-detail-badges": function (t, opts) {
    return t
      .card("name")
      .get("name")
      .then(function (cardName) {

        return [        
          {
            title: "Popup Detail Badge",
            text: "Створити тег",
            color: "green",
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
                                                  onConfirm: t => confirmNewTag(t, options.search),
                                                  confirmStyle: 'primary',
                                                }),
                        }]
                    } else {
                        return searchTag
                    }
                  }
                
                const confirmNewTag = async (t, tagName) => {
                        
                        t.alert({message: 'Зберігаю його для тебе ❤️', duration: 2})
                        
                       console.log("https://us-central1-trello-tags.cloudfunctions.net/createTag" + "?name='" + tagName + "'");
                                                          
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
