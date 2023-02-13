const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

const btnCallbackFeedback = (t, opts) => {
  return t.popup({
    title: 'Leave feedback',
    url: './feedback.html',
    height: 500
  });
};

window.TrelloPowerUp.initialize({
  'card-buttons': (t, opts) => {
    return [{
      icon: GRAY_ICON,
      text: 'Feedback',
      callback: btnCallbackFeedback
    }];
  }
});
