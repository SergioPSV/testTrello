let tags = ["first", "second", "three", "four"];

//var GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

// var btnCallback = function (t, opts) {
//   return t.popup({
//     title: 'Pull Requests',
//     items: [{
//       text: '#135 attempt to fix trello/api-docs#134',
//       callback: function (t, opts) { t.alert({message: 'Сохраняем тег...', duration: 10}); },
//       url: 'https://github.com/trello/api-docs/pull/135'
//     }, {
//       text: '#133 Removing duplicate `status` property',
//       callback: function (t, opts) { t.alert({message: 'Сохраняем тег...', duration: 10}); },
//       url: 'https://github.com/trello/api-docs/pull/133'
//     }, {
//       text: '#131 Update New Action Default',
//       callback: function (t, opts) { t.alert({message: 'Сохраняем тег...', duration: 10}); }
//       url: 'https://github.com/trello/api-docs/pull/131'
//     }, {
//       alwaysVisible: true, // non-search option, always shown
//       text: 'Choose a different repo...',
//       callback: function (t, opts) {  }
//     }],
//     search: {
//       count: 10, // number of items to display at a time
//       placeholder: 'Search pull requests',
//       empty: 'No pull requests found'
//     }
//   });
// };

// window.TrelloPowerUp.initialize({
//   'card-buttons': function (t, opts) {
//     return [{
//       text: 'GitHub',
//       callback: t.alert({message: 'Сохраняем тег...', duration: 10});
//     }];
//   }
// });


var GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

var onBtnClick = function (t, opts) {
  
  const items = (_, options) => {
    console.log(options.search);
    tags.push(options.search);
    
    tags.filter(tag =>
      tag.toLowerCase().includes(options.search.toLowerCase()) || tag == options.search).map(tag => ({
        alwaysVisible: tag == options.search,
        text: tag,
        callback: console.log(items),
      })
    );
  }
  
  
  return t.popup({
    title: 'Pull Requests',
    items,
    search: {
      count: 10, // number of items to display at a time
      placeholder: 'Search pull requests',
      empty: 'No pull requests found'
    }
  });
};

window.TrelloPowerUp.initialize({
  'card-buttons': function (t, opts) {
    return [{
      icon: GRAY_ICON, // don't use a colored icon here
      text: 'Создать тег',
      callback: onBtnClick,
      condition: 'edit'
    }];
  }
});
