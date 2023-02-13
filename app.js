const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';
const ICON_FEDDBACK = './feedback-svgrepo-com.svg';
const ICON_CONFIGURATION = './configuration.svg';
const ICON_LANGUAGE = './language.svg';

const btnCallbackFeedback = (t, opts) => {
  return t.popup({
    title: 'Leave feedback',
    url: './feedback.html',
    height: 500,
  });
};

window.TrelloPowerUp.initialize({
  'card-buttons': (t, opts) => {
    return [{
      icon: ICON_FEDDBACK,
      text: 'Feedback',
      callback: btnCallbackFeedback
    },{
      icon: ICON_CONFIGURATION,
      text: 'Change tag',
      callback: btnCallbackFeedback
    },{
      icon: ICON_LANGUAGE,
      text: 'Languages',
      callback: t => { t.alert({message: 'Coming soon...'}) }
    }];
  }
});
