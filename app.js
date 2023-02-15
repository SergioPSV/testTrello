const GET_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTagByCard?cardId=';
const DELETE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/deleteTagCard';
const SAVE_TAG_URL = 'https://us-central1-trello-tags.cloudfunctions.net/saveTagCard';
const GET_TAGS_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getTags';
const GET_SELECTED_LANGUAGES_URL = 'https://us-central1-trello-tags.cloudfunctions.net/getSelectedLanguages';
const SAVE_MEMBER_LANGUAGE = 'https://us-central1-trello-tags.cloudfunctions.net/saveMemberLanguage';
const CREATE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/createTag';
const HIDE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/hideTag';
const UNHIDE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/unhideTag';
const MODIFY_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/modifyTag';
const DELETE_TAG = 'https://us-central1-trello-tags.cloudfunctions.net/deleteTag';
const DEFAULT_TAG = '🏷 Choose tag';
const ICON_FEDDBACK = './icons/feedback-svgrepo-com.svg';
const ICON_CONFIGURATION = './icons/configuration.svg';
const ICON_LANGUAGE = './icons/language.svg';

loadTally = () => {
        const { onLoadTallyError } = this.props;
        const script = document.createElement('script');
        script.src = 'https://tally.so/widgets/embed.js';
        script.id = 'tally';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
            // eslint-disable-next-line no-undef
            try {
                Tally.loadEmbeds();
            } catch (error) {
                onLoadTallyError(error);
            }
        };
        script.onerror = onLoadTallyError;
    }

let tags = [];
let selectedLanguages = [];
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
    selectedLanguages = await fetch(GET_SELECTED_LANGUAGES_URL).then((response) => response.json());

    window.TrelloPowerUp.initialize({
      'card-buttons': function (t, opts) {
        return [{
          icon: ICON_LANGUAGE,
          text: 'Change language',
          callback: tee => { 
          
          
      
      var d=document,
      test=function(){
           Tally.openPopup('n0VNqN');
      },
      w="https://tally.so/widgets/embed.js",
      v=function(){
            "undefined"!=typeof Tally?Tally.loadEmbeds():'https://tally.so/embed/n0VNqN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';
      };
      if("undefined"!=typeof Tally)v();
      else if(d.querySelector('script[src="'+w+'"]')==null){
        var s=d.createElement("script");
        s.src=w,
        s.onload=v,
        s.onload=test,
        s.onerror=v,
        d.body.appendChild(s);
          
          
          
          
          }  //{ tee.alert({message: 'Coming soon...'}) } //(tee) => changeLanguage(tee)
        }, {
          icon: ICON_CONFIGURATION,
          text: "Change tag",
          callback: (tee) => actionsWithTags(tee),
        }, {
          icon: ICON_FEDDBACK,
          text: 'Feedback',
          callback: btnCallbackFeedback
        }];
      },
      'card-badges': function (t, opts) {
        return t
          .card("id")
          .get("id")
          .then(function (cardId) {
            return [
              {
                dynamic: async () => {
                  let findCard = await fetch(GET_TAG_URL + cardId);
                  let idPerson = await t.member('id');
                  let tagInCard = '';

                  if (findCard.ok) {
                    const { errorCode, tagId } = await findCard.json();
                    let memberLanguage = selectedLanguages.find( member => member.id == idPerson.id)
                    let tagsLanguages = tags.find(t => t.id === tagId);
                    
                    tagInCard = (!errorCode && memberLanguage && tagsLanguages[memberLanguage.lang] != '') ? tagsLanguages[memberLanguage.lang] : !errorCode ? tagsLanguages.name : "Need tag";
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
        ])),
    });
  });

const getTagForCard = (cardId, t) => new Promise(async resolve => {
  let personId = await t.member('id');
  let memberLanguage = selectedLanguages.find( member => member.id == personId.id)
  console.log('cardId', cardId);

  if (!currentTag || currentCardId !== cardId) {
    let response = await fetch(GET_TAG_URL + cardId);

    if (response.ok) {
      const { errorCode, tagId } = await response.json();
      tagInCard = tags.find(t => t.id === tagId);

      if (tagInCard && tagInCard.hidden) {
        currentTag = !errorCode ? '🙈 ' + tagInCard.name : DEFAULT_TAG;
      } else {
        currentTag = !errorCode && memberLanguage && tagInCard[memberLanguage.lang] != '' ? tagInCard[memberLanguage.lang] : !errorCode ? tagInCard.name : DEFAULT_TAG;
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
    callback: (tee) => badgeClickCallback(tee, cardId, personId),
  })
});

const saveTagForCard = async (tagName, cardId, t, memberLang) => {
  t.alert({message: 'Attach tag...', duration: 10});

  const {id:tagId} = tags.find(t => t.name === tagName);
  if (tagId === 1) {
    currentTag = DEFAULT_TAG;
    await fetch(DELETE_TAG_URL + `?cardId=${cardId}`);
  } else {
    let tagsLanguages = tags.find(t => t.name === tagName);
    currentTag = tagsLanguages[memberLang] ? tagsLanguages[memberLang] : tagName;
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
      callback: (tee) => changeLanguageCallback(tee, 'nameUA')
    }, {
      text: 'English',
      callback: (tee) => changeLanguageCallback(tee, 'nameEN')
    }, {
      text: 'Russian',
      callback: (tee) => changeLanguageCallback(tee, 'name')
    }]
  });
};

const badgeClickCallback = (tee, cardId, personId) => {
  let memberLanguage = selectedLanguages.find( member => member.id === personId.id);
  
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

    await fetch(CREATE_TAG + `?name=${tagName}&memberName=${memberName.fullName}&link=${shortLinkTrelloCard}`);
    tags = await getTags();

    findIdTag = tags.find( tag => tag.name == tagName);
    await saveTagForCard(findIdTag.name, cardId, t);
  };

  const items = async (_, options) => {
    let searchTags;
    
    if (memberLanguage) {
      searchTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(options.search.toLowerCase()) && !tag.hidden || tag.id === 1 || (tag[memberLanguage.lang].toLowerCase().includes(options.search.toLowerCase()) && !tag.hidden) ).map(tag => ({
          alwaysVisible: tag.id === 1,
          text: tag[memberLanguage.lang] ? tag[memberLanguage.lang] : tag.name,
          callback: t => saveTagForCard(tag.name, cardId, t, memberLanguage.lang),
        })
      );
    } else {
      searchTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(options.search.toLowerCase()) && !tag.hidden || tag.id === 1).map(tag => ({
          alwaysVisible: tag.id === 1,
          text: tag.name,
          callback: t => saveTagForCard(tag.name, cardId, t, 'name'),
        })
      ); 
    }
    

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

const changeLanguageCallback = async (tee, language) => {
  let personChangeLang = await tee.member('id', 'fullName');
  
  await fetch(SAVE_MEMBER_LANGUAGE + `?memberId=${personChangeLang.id}&memberName=${personChangeLang.fullName}&language=${language}`);
  
  console.log(personChangeLang.fullName, personChangeLang.id, language);
  
  tee.alert({
    message: "Language changed"
  });
  
};

const btnCallbackFeedback = (t, opts) => {
  return t.popup({
    title: 'Leave feedback',
    url: t.signUrl('./feedback.html', {
            args: {trello_url: 1234, trello_card_id: 456789}
          }),
    height: 500,
  });
};

