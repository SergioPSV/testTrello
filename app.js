let tags = ["first", "second", "three", "four"];


var GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

const badgeClickCallback = (t, opts) => {
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
            callback: t => t.alert({message: 'Сохраняем тег...', duration: 10}),
        }]
    } else {
        return searchTag
    }
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
};


// var onBtnClick = function (t, opts) {
//   const items = (_, options) => {
//     //console.log(options.search);
//     //tags.push(options.search);
    
//     tags.filter(tag =>
//       tag.toLowerCase().includes(options.search.toLowerCase()) || tag == options.search).map(tag => ({
//         alwaysVisible: tag == options.search,
//         text: tag,
//         callback: t => t.alert({message: 'Сохраняем тег...', duration: 10}),
//       })
//     );
//   }
  
//     const items = (_, options) => tags.filter(tag =>
//       tag.toLowerCase().includes(options.search.toLowerCase()) || tag == 1).map(tag => ({
//         alwaysVisible: tag == 1,
//         text: tag,
//         callback: t => t.alert({message: 'Сохраняем тег...', duration: 10}),
//     })

  
  
//   return t.popup({
//     title: 'Теги',
//     items,
//     search: {
//       count: 10, // number of items to display at a time
//       placeholder: 'Search pull requests',
//       empty: 'Нужно добавить такой тег'
//     }
//   });
// };

window.TrelloPowerUp.initialize({
  'card-buttons': function (t, opts) {
    return [{
      icon: GRAY_ICON, // don't use a colored icon here
      text: 'Создать тег',
      callback: badgeClickCallback,
      condition: 'edit'
    }];
  }
});
