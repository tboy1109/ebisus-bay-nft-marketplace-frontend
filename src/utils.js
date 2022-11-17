import moment from 'moment';
import config from './Assets/networks/rpc_config.json';
export const drops = config.drops;
export const collections = config.known_contracts;

export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
}

export function isMobile() {
  if (window) {
    return window.matchMedia(`(max-width: 767px)`).matches;
  }
  return false;
}

export function isMdScreen() {
  if (window) {
    return window.matchMedia(`(max-width: 1199px)`).matches;
  }
  return false;
}

function currentYPosition() {
  if (!window) {
    return;
  }
  // Firefox, Chrome, Opera, Safari
  if (window.pageYOffset) return window.pageYOffset;
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop) return document.documentElement.scrollTop;
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop;
  return 0;
}

function elmYPosition(elm) {
  var y = elm.offsetTop;
  var node = elm;
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent;
    y += node.offsetTop;
  }
  return y;
}

export function scrollTo(scrollableElement, elmID) {
  var elm = document.getElementById(elmID);
  if (!elmID || !elm) {
    return;
  }
  var startY = currentYPosition();
  var stopY = elmYPosition(elm);
  var distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY);
    return;
  }
  var speed = Math.round(distance / 50);
  if (speed >= 20) speed = 20;
  var step = Math.round(distance / 25);
  var leapY = stopY > startY ? startY + step : startY - step;
  var timer = 0;
  if (stopY > startY) {
    for (var i = startY; i < stopY; i += step) {
      setTimeout(
        (function (leapY) {
          return () => {
            scrollableElement.scrollTo(0, leapY);
          };
        })(leapY),
        timer * speed
      );
      leapY += step;
      if (leapY > stopY) leapY = stopY;
      timer++;
    }
    return;
  }
  for (let i = startY; i > stopY; i -= step) {
    setTimeout(
      (function (leapY) {
        return () => {
          scrollableElement.scrollTo(0, leapY);
        };
      })(leapY),
      timer * speed
    );
    leapY -= step;
    if (leapY < stopY) leapY = stopY;
    timer++;
  }
  return false;
}

export function getTimeDifference(date) {
  let difference = moment(new Date(), 'DD/MM/YYYY HH:mm:ss').diff(moment(date, 'DD/MM/YYYY HH:mm:ss')) / 1000;

  if (difference < 60) return `${Math.floor(difference)} seconds`;
  else if (difference < 3600) return `${Math.floor(difference / 60)} minutes`;
  else if (difference < 86400) return `${Math.floor(difference / 3660)} hours`;
  else if (difference < 86400 * 30) return `${Math.floor(difference / 86400)} days`;
  else if (difference < 86400 * 30 * 12) return `${Math.floor(difference / 86400 / 30)} months`;
  else return `${(difference / 86400 / 30 / 12).toFixed(1)} years`;
}

export function generateRandomId() {
  let tempId = Math.random().toString();
  let uid = tempId.substr(2, tempId.length - 1);
  return uid;
}

export function getQueryParam(prop) {
  var params = {};
  var search = decodeURIComponent(window.location.href.slice(window.location.href.indexOf('?') + 1));
  var definitions = search.split('&');
  definitions.forEach(function (val, key) {
    var parts = val.split('=', 2);
    params[parts[0]] = parts[1];
  });
  return prop && prop in params ? params[prop] : params;
}

export function classList(classes) {
  return Object.entries(classes)
    .filter((entry) => entry[1])
    .map((entry) => entry[0])
    .join(' ');
}

/**
 * Takes a string and makes it human readable
 * Removes underscores, adds spaces, etc...
 *
 * @param str
 * @returns {string}
 */
export function humanize(str) {
  let i,
    frags = str
      .toString()
      .split(/(?=[A-Z])/)
      .join(' ')
      .split('_');
  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
  }
  return frags.join(' ');
}

/**
 * Converts a number to use SI prefixed notation
 *
 * @param num
 * @returns {string|number}
 */
export function siPrefixedNumber(num) {
  // Nine Zeroes for Billions
  return Math.abs(Number(num)) >= 1.0e9
    ? (Math.abs(Number(num)) / 1.0e9).toFixed(2) + 'B'
    : // Six Zeroes for Millions
    Math.abs(Number(num)) >= 1.0e6
    ? (Math.abs(Number(num)) / 1.0e6).toFixed(2) + 'M'
    : // Three Zeroes for Thousands
    Math.abs(Number(num)) >= 1.0e3
    ? (Math.abs(Number(num)) / 1.0e3).toFixed(2) + 'K'
    : Math.abs(Number(num));
}

export function shortAddress(address) {
  return `${address.substring(0, 4)}...${address.substring(address.length - 3, address.length)}`;
}

export function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
}

/**
 * @description returns a 7 character from start and end of id to print.
 * @param id  0x0000000000000000000000000000000000000000
 * @returns {string} 0x00...000
 */
export function getShortIdForView(id = '') {
  return `${id.substring(0, 4)}...${id.substring(id.length - 3, id.length)}`;
}

/**
 * @description create explorer url.
 * @param transactionHash 0x000
 */
export function openWithCronosExplorer(transactionHash = '') {
  window.open(`https://cronoscan.com/tx/${transactionHash}`, '_blank');
}

export function createSuccessfulTransactionToastContent(transactionHash) {
  return (
    <span>
      Success!
      <a
        className="link-primary"
        style={{ paddingLeft: '1rem' }}
        onClick={() => openWithCronosExplorer(transactionHash)}
      >
        ${getShortIdForView(transactionHash)}
      </a>
    </span>
  );
}

/**
 *
 * Case insensitive comparison
 *
 * @param str1
 * @param str2
 * @returns {boolean}
 */
export function caseInsensitiveCompare(str1, str2) {
  return str1?.toLowerCase() === str2?.toLowerCase();
}

export function newlineText(text) {
  return text.split('\n').map((str) => <p>{str}</p>);
}

export const isCroniesDrop = (address) => {
  return isDrop(address, 'cronies');
};

export const isFounderDrop = (address) => {
  return isDrop(address, 'founding-member');
};

export const isFounderCollection = (address) => {
  const collection = collections.find((c) => caseInsensitiveCompare(c.address, address));
  return collection && ['vip-founding-member', 'founding-member'].includes(collection.slug);
};

export const isCrognomesDrop = (address) => {
  return isDrop(address, 'crognomes-member');
};

export const isCrognomidesDrop = (address) => {
  return isDrop(address, 'crognomides');
};

export const isMagBrewVikingsDrop = (address) => {
  return isDrop(address, 'mag-brew-vikings');
};

export const isCreaturesDrop = (address) => {
  return isDrop(address, 'creatures');
};

export const isFounderVipDrop = (address) => {
  return isDrop(address, 'vip-founding-member');
};

export const isCrosmocraftsPartsDrop = (address) => {
  return isDrop(address, 'crosmocrafts-parts');
};

export const isDrop = (address, slug) => {
  const drop = drops.find((d) => d.slug === slug);
  return drop && caseInsensitiveCompare(drop.address, address);
};

export const isCollection = (address, slug) => {
  const collection = collections.find((c) => c.slug === slug);
  return collection && caseInsensitiveCompare(collection.address, address);
};

export const isCroCrowCollection = (address) => {
  return isCollection(address, 'cro-crow');
};

export const isMetapixelsCollection = (address) => {
  return isCollection(address, 'metapixels');
};

export const isSouthSideAntsCollection = (address) => {
  return isCollection(address, 'south-side-ants');
};

export const isCrosmocraftsPartsCollection = (address) => {
  return isCollection(address, 'crosmocrafts-parts');
};

export const isCrosmocraftsCollection = (address) => {
  return isCollection(address, 'crosmocrafts');
};

export const percentage = (partialValue, totalValue) => {
  if (!totalValue || totalValue === 0) return 0;
  return Math.floor((100 * partialValue) / totalValue);
};

export const relativePrecision = (num) => {
  if (num < 0.001) {
    return Math.round(num * 10000) / 100;
  } else if (num < 0.01) {
    return Math.round(num * 1000) / 10;
  }
  return Math.round(num * 100);
};

export const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

/**
 * Lookup a collection by address instead of slug
 *
 * @param address
 * @param tokenId
 * @returns {*}
 */
export const findCollectionByAddress = (address, tokenId) => {
  return collections.find((c) => {
    const matchesAddress = caseInsensitiveCompare(c.address, address);
    if (!tokenId) return matchesAddress;

    const matchesTokenIf1155 = !c.multiToken || (tokenId && c.id == tokenId);
    return matchesAddress && matchesTokenIf1155;
  });
}