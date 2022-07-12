import Moment from 'moment';
import * as QueryString from "query-string";

export const getQueryParam = (name, props) => {
  if (props && props.location && props.location.search) {
    const params = QueryString.parse(props.location.search);
    return params[name];
  } else {
    return undefined;
  }
}

export const getFilepath = () => {
  var filepath = sessionStorage.getItem('filepath');
  if (filepath.indexOf("https") >= 0) {
    return filepath;
  } else {
    return window.origin + '/api/v1/screenshots/';
  }
}

export const formatPercentToWords = (percentage) => {
  var words = percentage + "%";
  if (percentage === 0) {
    words = "No Change";
  } else if (percentage >= 0 && percentage <= 5) {
    words = "Small change";
  } else if (percentage > 5 && percentage <= 20) {
    words = "Medium change";
  } else if (percentage > 20) {
    words = "Major change";
  }
  return words;
}

export const formatWordsToPercent = (words) => {
  var percent = 5;
  switch (words) {
    case 'all':
      percent = 0;
      break;
    case 'small':
      percent = 5;
      break;
    case 'medium':
      percent = 20;
      break;
    case 'large':
      percent = 50;
      break;
    default:
      break;
  }
  return percent;
}

export const validURL = (str) => {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}

export const recentFormatter = (date) => {
  if (date !== null) {
    return Moment(date).local().fromNow();
  } else {
    return ""
  }
}

export const minuteFormatter = (minutes) => {
  var result;
  if (minutes >= 0 && minutes < 60) {
    result = minutes + ' Minutes';
  } else if (minutes > 60 && minutes < 1440) {
    var hours = Number(minutes / 60).toFixed(2);
    result = hours + ' Hours';
  } else {
    var days = Number(minutes / 1440).toFixed(2);
    result = days + ' Days';
  }
  return result;
}