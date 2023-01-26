const GET_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTagByCard?cardId=';
const DELETE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/deleteTagCard';
const SAVE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/saveTagCard';
const GET_TAGS_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTags';
const CREATE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/createTag';
const HIDE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/hideTag';
const UNHIDE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/unhideTag';
const MODIFY_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/modifyTag';
const DELETE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/deleteTag';
const DEFAULT_TAG = '🏷 Choose tag';

let tags = [];
let currentTag = '';
let currentCardId = '';
let findIdTag = '';
let tagInCard = '';
let memberName = '';
let shortLinkTrelloCard = '';

const getTags = async () => {
  return await fetch(GET_TAGS_URL).then((response) => response.json())
};

fetch(GET_TAGS_URL)
  .then((response) => response.json())
  .then( async (data) => {

    tags = data;
    tags.unshift({ name: '🧽 Revoke tag', id: 1, hidden: false });

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
                    
                    let namePerson = await t.member('fullName');
                    console.log(tags.find(t => t.id === tagId), namePerson);
                    
                    tagInCard = (!errorCode && namePerson.fullName == 'Serhiy Parkhomenko') ? tags.find(t => t.id === tagId).nameUA : !errorCode ? tags.find(t => t.id === tagId).name : "Need tag";
                  } else {
                    console.log("HTTP error: " + response.status);
                  }

                  return {
                    text: tagInCard,
                    color: tagInCard == 'Need tag' ? "red" : "green",
                    refresh: 60,
                  };
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
            title: "⁠",
            text: "⚙️ Change tag",
            color: "grey",
            callback: (tee) => actionsWithTags(tee),
          },
          {
            title: "",
            text: "Language",
            callback: (tee) => changeLanguage(tee),
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
    title: 'Problem tags',
    text: currentTag,
    color: "yellow",
    refresh: 10,
    callback: (tee) => badgeClickCallback(tee, cardId),
  })
});

const saveTagForCard = async (tagName, cardId, t) => {
  t.alert({message: 'Attach tag...', duration: 10});

  const {id:tagId} = tags.find(t => t.name === tagName);
  if (tagId === 1) {
    currentTag = DEFAULT_TAG;
    await fetch(DELETE_TAG_URL + `?cardId=${cardId}`);
  } else {
    currentTag = tagName;
    await fetch(SAVE_TAG_URL + `?cardId=${cardId}&tagId=${tagId}`);
  }

  t.closePopup();
};

const actionsWithTags = async (t, opts) =>  {
  return t.popup({
    title: 'Operations',
    items: [{
      text: '✏️ Edit',
      callback: (tee) => badgeChangeTagCallback(tee)
    }, {
      text: '🥷 Hide',
      callback: (tee) => badgeHiddenTagsCallback(tee, false, HIDE_TAG)
    }, {
      text: '🔦 Show',
      callback: (tee) => badgeHiddenTagsCallback(tee, true, UNHIDE_TAG)
    }, {
      text: '❌ Delete',
      callback: (tee) => badgeDeleteTagsCallback(tee, DELETE_TAG)
    }]
  });
};

const changeLanguage = async (t, opts) =>  {
  return t.popup({
    title: 'Languages',
    items: [{
      text: 'Ukrainian',
      callback: (tee) => changeLanguageCallback(tee, 'ua')
    }, {
      text: 'English',
      callback: (tee) => {
        tee.alert({
          message: 'Test'
        });
      }
    }, {
      text: 'Russian',
      callback: (tee) => changeLanguageCallback(tee, 'ru')
    }]
  });
};

const badgeClickCallback = (tee, cardId) => {
  const createTagCallback = (t, message) => t.popup({
    type: 'confirm',
    title: "Create tag?",
    message: message,
    confirmText: "Yes!",
    onConfirm: t => confirmNewTag(t, message),
    confirmStyle: 'primary',
  });

  const confirmNewTag = async (t, tagName) => {
    t.alert({message: 'I save it for you ❤️', duration: 2});

    memberName = await t.member('fullName');
    shortLinkTrelloCard = await t.card('shortLink');
    console.log(`${memberName.fullName} CREATE "${tagName}"`);

    await fetch(CREATE_TAG + `?name=${tagName}&memberName=${memberName.fullName}&link=${shortLinkTrelloCard}`);
    tags = await getTags();

    findIdTag = tags.find( tag => tag.name == tagName);
    await saveTagForCard(findIdTag.name, cardId, t);
  };

  const items = (_, options) => {
    let searchTags = tags.filter(tag =>
      tag.name.toLowerCase().includes(options.search.toLowerCase()) && !tag.hidden || tag.id === 1).map(tag => ({
        alwaysVisible: tag.id === 1,
        text: tag.name,
        callback: t => saveTagForCard(tag.name, cardId, t),
      })
    );

    return searchTags.length == 1 ? [{
      alwaysVisible: true,
      text: options.search,
      callback: t => createTagCallback(t, options.search),
    }] : searchTags;
  };

  return tee.popup({
    title: 'Problem tags',
    items,
    search: {
      count: 10,
      placeholder: 'Search...',
      empty: 'This tag needs to be created'
    }
  });
};

const badgeHiddenTagsCallback = (tee, rule, action) => {

  const items = (_, options) => tags.filter(tag =>
    tag.name.toLowerCase().includes(options.search.toLowerCase()) && tag.id != 1 && tag.hidden == rule ).map(tag => ({
      alwaysVisible: false,
      text: tag.name,
      callback: t => hideOrUnhideTag(tag.id, t, tag.name, action),
    })
  );

  return tee.popup({
    title: 'Problem tags',
    items,
    search: {
      count: 10,
      placeholder: 'Search...',
      empty: 'No results'
    }
  });
};

const hideOrUnhideTag = async (tagId, t, tagName, action) => {
  t.alert({message: 'Hide/Show tag', duration: 3});

  memberName = await t.member('fullName');
  shortLinkTrelloCard = await t.card('shortLink');
  console.log(`${memberName.fullName} ${shortLinkTrelloCard.shortLink}`);

  await fetch(action + `?tagId=${tagId}&memberName=${memberName.fullName}&tagName=${tagName}&link=${shortLinkTrelloCard}`);
  tags = await getTags();

  t.closePopup();
};

const badgeDeleteTagsCallback = (tee, action) => {

  const items = (_, options) => tags.filter(tag =>
    tag.name.toLowerCase().includes(options.search.toLowerCase()) && tag.id != 1 && tag.hidden == true ).map(tag => ({
      alwaysVisible: false,
      text: tag.name,
      callback: t => deleteTag(tag.id, t, tag.name, action),
    })
  );

  return tee.popup({
    title: 'Problem tags',
    items,
    search: {
      count: 15,
      placeholder: 'Search...',
      empty: 'No results'
    }
  });
};

const deleteTag = async (tagId, t, tagName, action) => {
  t.alert({message: 'Deleting tag', duration: 3});

  shortLinkTrelloCard = await t.card('shortLink');
  memberName = await t.member('fullName');

  await fetch(action + `?tagId=${tagId}&memberName=${memberName.fullName}&tagName=${tagName}&link=${shortLinkTrelloCard}`);
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
        callback: t => changeTagName(t, options.search, tagId, tagName),
      }]
    };

    return tee.popup({
      title: '✏️ Edit',
      items,
      search: {
        count: 5,
        placeholder: 'Enter new name',
        empty: `Edit tag "${tagName}" to:`
      }
    });
  };

  const changeTagName = async (t, newTagName, tagId, tagName) => {
    t.alert({message: `Changing tag...`, duration: 2});

    shortLinkTrelloCard = await t.card('shortLink');
    memberName = await t.member('fullName');
    console.log(`${memberName.fullName} UPDATE "${newTagName}" (${tagId}) ${shortLinkTrelloCard}`);

    await fetch(MODIFY_TAG + `?tagId=${tagId}&name=${newTagName}&memberName=${memberName.fullName}&link=${shortLinkTrelloCard}&previousName=${tagName}`);
    tags = await getTags();

    t.closePopup();
  };

  return tee.popup({
    title: 'Problem tags',
    items,
    search: {
      count: 5,
      placeholder: 'Search...',
      empty: 'No results'
    }
  });
};

const changeLanguageCallback = async (tee, rule, action) => {
  let personChangeLang = await tee.member('id', 'fullName');
  
  console.log(personChangeLang.fullName, personChangeLang.id);
  
    tee.alert({
    message: personChangeLang.fullName
  });
};
