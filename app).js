
const DEFAULT_TAG = 'Обрати тег';

let tags = [];
let currentTag = '';
let currentCardId = '';

window.TrelloPowerUp.initialize({
      'card-detail-badges': (t) => t.card('id').get('id').then((id) => ([{
        dynamic: () => getTagForCard(id, t),
      }])),
    });

const getTagForCard = (cardId, t) => new Promise(async resolve => {
  console.log('cardId', cardId);

  if (!currentTag || currentCardId !== cardId) {
    let response = {'first', 'second'};

    if (response.ok) {
      const { errorCode, tagId } = await response.json();
      currentTag = !errorCode ? tags.find(t => t.id === tagId).name : DEFAULT_TAG;
    } else {
      console.log("HTTP error: " + response.status);
    }
  }

  currentCardId = cardId;

  t.hideAlert()

  resolve({
    title: 'Тег проблемы',
    text: currentTag,
    refresh: 10,
    callback: (tee) => badgeClickCallback(tee, cardId),
  })
});

const saveTagForCard = async (tagName, cardId, t) => {
  t.alert({message: 'Сохраняем тег...', duration: 10});

  const {id:tagId} = tags.find(t => t.name === tagName);
  if (tagId === 1) {
    currentTag = DEFAULT_TAG;
 
  } else {
    currentTag = tagName;
  }

  t.closePopup();
}

const badgeClickCallback = (tee, cardId) => {
  const items = (_, options) => tags.filter(tag =>
    tag.name.toLowerCase().includes(options.search.toLowerCase()) || tag.id === 1).map(tag => ({
      alwaysVisible: tag.id === 1,
      text: tag.name,
      callback: t => saveTagForCard(tag.name, cardId, t),
    })
  );

  return tee.popup({
    title: 'Теги проблем',
    items,
    search: {
      count: 10,
      placeholder: 'Пошук...',
      empty: 'Нема результатів'
    }
  });
};
