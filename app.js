const GET_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTagByCard?cardId=';
const DELETE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/deleteTagCard';
const SAVE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/saveTagCard';
const GET_TAGS_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTags';
const CREATE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/createTag';
const DEFAULT_TAG = 'Обрати тег';

let tags = [];
let currentTag = '';
let currentCardId = '';
let newTag = '';

fetch(GET_TAGS_URL)
  .then((response) => response.json())
  .then(data => {
    tags = data;
    tags.unshift({ name: 'Видалити тег', id: 1 });

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
      'card-detail-badges': (t) => t.card('id').get('id').then((id) => ([{
        dynamic: () => getTagForCard(id, t),
      }])),
    });
  });

const getTagForCard = (cardId, t) => new Promise(async resolve => {
  console.log('cardId', cardId);

  if (!currentTag || currentCardId !== cardId) {
    let response = await fetch(GET_TAG_URL + cardId);

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
    color: "yellow",
    refresh: 10,
    callback: (tee) => badgeClickCallback(tee, cardId),
  })
});

const saveTagForCard = async (tagName, cardId, t) => {
  t.alert({message: 'Сохраняем тег...', duration: 10});

  const {id:tagId} = tags.find(t => t.name === tagName);
  if (tagId === 1) {
    currentTag = DEFAULT_TAG;
    await fetch(DELETE_TAG_URL + `?cardId=${cardId}`);
  } else {
    currentTag = tagName;
    await fetch(SAVE_TAG_URL + `?cardId=${cardId}&tagId=${tagId}`);
  }

  t.closePopup();
}

const badgeClickCallback = (tee, cardId) => {
  const items = (_, options) => {
    let searchTags = tags.filter(tag =>
      tag.name.toLowerCase().includes(options.search.toLowerCase()) || tag.id === 1).map(tag => ({
        alwaysVisible: tag.id === 1,
        text: tag.name,
        callback: t => saveTagForCard(tag.name, cardId, t),
      })
    );

    if (searchTags.length == 1) {
      return [{
        alwaysVisible: true,
        text: options.search,
        callback: t => t.popup({
          type: 'confirm',
          title: "Створити тег?",
          message: options.search,
          confirmText: "Так!",
          onConfirm: t => confirmNewTag(t, options.search),
          confirmStyle: 'primary',
        }),
      }]
    } else {
      return searchTags;
    }
  };

  const confirmNewTag = async (t, tagName) => {
    t.alert({message: 'Зберігаю його для тебе ❤️', duration: 2});

    newTag = tagName;
    await fetch(CREATE_TAG + `?name=${newTag}`);

    t.closePopup();
  };

  return tee.popup({
    title: 'Теги проблем',
    items,
    search: {
      count: 10,
      placeholder: 'Пошук...',
      empty: 'Цей тег потрібно створити'
    }
  });
};
