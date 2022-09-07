const GET_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTagByCard?cardId=';
const DELETE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/deleteTagCard';
const SAVE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/saveTagCard';
const GET_TAGS_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTags';
const CREATE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/createTag';
const HIDE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/hideTag';
const UNHIDE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/unhideTag';
const MODIFY_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/modifyTag';
const DEFAULT_TAG = 'Обрати тег';

let tags = [];
let currentTag = '';
let currentCardId = '';
let findIdTag = '';
let tagInCard = '';

const getTags = async () => {
  return await fetch(GET_TAGS_URL).then((response) => response.json())
};

fetch(GET_TAGS_URL)
  .then((response) => response.json())
  .then( async (data) => {

    tags = data;
    tags.unshift({ name: 'Видалити тег', id: 1, hidden: false });

    window.TrelloPowerUp.initialize({
      "card-badges": function (t, opts) {
        return t
          .card("id")
          .get("id")
          .then(function (cardId) {
            return [
              {
                dynamic: async () => {
                  let findCard = await fetch(GET_TAG_URL + cardId);
                  let tagInCard = '';

                  if (findCard.ok) {
                    const { errorCode, tagId } = await findCard.json();
                    tagInCard = !errorCode ? tags.find(t => t.id === tagId).name : "Need tag";
                  } else {
                    console.log("HTTP error: " + response.status);
                  }

                  if (tagInCard == 'Need tag') {
                    return {
                      text: tagInCard,
                      color: "red",
                      refresh: 60,
                    };
                  } else {
                    return {
                      text: tagInCard,
                      color: "green",
                      refresh: 60,
                    };
                  }
                },
              }
            ];
          });
      },
      'card-detail-badges': (t) => t.card('id')
        .get('id')
        .then((id) => ([
          {
            dynamic: () => getTagForCard(id, t),
          },
          {
            title: "Світ змінюється",
            text: "І тег зміню",
            color: "blue",
            callback: (tee) => badgeChangeTagCallback(tee),
          },
          {
            title: "Щось сховати? 🥷",
            text: "Хочу обрати",
            color: "blue",
            callback: (tee) => badgeHideCallback(tee),
          },
          {
            title: "Потаємне 🤫",
            text: "Показати",
            color: "blue",
            callback: (tee) => badgeHiddenTagsCallback(tee),
          },
        ])),
    });
  });

const getTagForCard = (cardId, t) => new Promise(async resolve => {
  console.log('cardId', cardId);

  if (!currentTag || currentCardId !== cardId) {
    let response = await fetch(GET_TAG_URL + cardId);

    if (response.ok) {
      const { errorCode, tagId } = await response.json();
      tagInCard = tags.find(t => t.id === tagId);

      if (tagInCard && tagInCard.hidden) {
        currentTag = !errorCode ? '🙈 ' + tagInCard.name : DEFAULT_TAG;
      } else {
        currentTag = !errorCode ? tagInCard.name : DEFAULT_TAG;
      }
    } else {
      console.log("HTTP error: " + response.status);
    }
  }

  currentCardId = cardId;

  t.hideAlert()

  resolve({
    title: 'Тег проблеми',
    text: currentTag,
    color: "yellow",
    refresh: 10,
    callback: (tee) => badgeClickCallback(tee, cardId),
  })
});

const saveTagForCard = async (tagName, cardId, t) => {
  t.alert({message: 'Кріплю тег до тікету...', duration: 10});

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
      tag.name.toLowerCase().includes(options.search.toLowerCase()) && !tag.hidden || tag.id === 1).map(tag => ({
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

    await fetch(CREATE_TAG + `?name=${tagName}`);
    tags = await getTags();

    findIdTag = tags.find( tag => tag.name == tagName);
    await saveTagForCard(findIdTag.name, cardId, t);

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

const badgeHiddenTagsCallback = (tee) => {

  const items = (_, options) => tags.filter(tag =>
    tag.name.toLowerCase().includes(options.search.toLowerCase()) && tag.id != 1 && tag.hidden ).map(tag => ({
      alwaysVisible: false,
      text: tag.name,
      callback: t => unhidingTag(tag.id, t),
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


const badgeHideCallback = (tee) => {
  const items = (_, options) => tags.filter(tag =>
    tag.name.toLowerCase().includes(options.search.toLowerCase()) && tag.id != 1 && !tag.hidden ).map(tag => ({
      alwaysVisible: false,
      text: tag.name,
      callback: t => hidingTag(tag.id, t),
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

const hidingTag = async (tagId, t) => {
  t.alert({message: 'Ховаю тег...', duration: 3});

  await fetch(HIDE_TAG + `?tagId=${tagId}`);
  tags = await getTags();

  t.closePopup();
};

const unhidingTag = async (tagId, t) => {
  t.alert({message: 'Тег знову в строю️', duration: 3});
  
  console.log('lists ', t.lists() );
  console.log('card   ', t.card() );
  console.log('t.member ', t.member() );
  console.log('memberCanWriteToModel ', t.memberCanWriteToModel() );
  console.log('isMemberSignedIn ', t.isMemberSignedIn() );

  await fetch(UNHIDE_TAG + `?tagId=${tagId}`);
  tags = await getTags();

  t.closePopup();
};


const badgeChangeTagCallback = (tee) => {
  const items = (_, options) => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(options.search.toLowerCase()) && !tag.hidden && tag.id != 1).map(tag => ({
        alwaysVisible: false,
        text: tag.name,
        callback: t => badgeNewNameTag(t, tag.name, tag.id),
      })
    );
  };


  const badgeNewNameTag = (tee, tagName, tagId) => {
    const items = (_, options) => {
      return [{
            alwaysVisible: true,
            text: options.search,
            callback: t => changeTagName(t, options.search, tagId),
          }]
    };

    return tee.popup({
      title: 'Редагувати тег',
      items,
      search: {
        count: 5,
        placeholder: 'Введи нове імʼя',
        empty: `Змінити тег "${tagName}" на:`
      }
    });
  };

  const changeTagName = async (t, newTagName, tagId) => {
    t.alert({message: `Вже змінюю...`, duration: 2});

    console.log(tagId, newTagName);

    await fetch(MODIFY_TAG + `?tagId=${tagId}&name=${newTagName}`);
    tags = await getTags();

    t.closePopup();
  };

  return tee.popup({
    title: 'Теги проблем',
    items,
    search: {
      count: 5,
      placeholder: 'Пошук...',
      empty: 'Нічого не знайдено'
    }
  });
};
