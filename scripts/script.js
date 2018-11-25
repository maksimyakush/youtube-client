import { searchUrl, videosUrl } from '../environment';

let nextPageToken;
let pageMaxNumber = 0;
let currentPage = 0;
let videosData = [];

let startPointX;
const pixelsForRerender = 10;


const prevBtn = document.createElement('button');
prevBtn.classList.add('btn');

prevBtn.classList.add('btn__prev-page');
prevBtn.textContent = 'Previous Page';
const nextBtn = document.createElement('button');
nextBtn.classList.add('btn');

nextBtn.classList.add('btn__next-page');
nextBtn.textContent = 'Next Page';
const pageNumber = document.createElement('div');
pageNumber.classList.add('round');

function setNewVideosData(newVideosData) {
  let structuredVideosData = [];

  newVideosData.items.forEach((video) => {
    structuredVideosData = [
      ...structuredVideosData,
      {
        id: video.id,
        title: video.snippet.title,
        publishedAt: video.snippet.publishedAt,
        views: video.statistics.viewCount,
        image: video.snippet.thumbnails.high.url,
        channelTitle: video.snippet.channelTitle,
      },
    ];
  });

  return structuredVideosData;
}

function destructureData(arr, itemLength) {
  const result = [];
  while (arr.length) {
    result.push(arr.splice(0, itemLength));
  }
  return result;
}

function mergeCurrentAndNewVideosDataForScreenSize(size, newVideosData = []) {
  let mergedData = videosData.reduce((acc, item) => acc.concat(item), []).concat(newVideosData);
  switch (size) {
    case 'large':
      mergedData = destructureData(mergedData, 4);
      return mergedData;

    case 'medium':
      mergedData = destructureData(mergedData, 2);

      return mergedData;

    case 'small':
      return mergedData.reduce((acc, item) => [...acc, [item]], []);

    default:
      return new Error('first argument must be called large medium or small');
  }
}

function setVideosData(newVideosData = []) {
  const clipDataLargeSize = mergeCurrentAndNewVideosDataForScreenSize('large', newVideosData);
  const clipDataMediumSize = mergeCurrentAndNewVideosDataForScreenSize('medium', newVideosData);
  const clipDataSmallSize = mergeCurrentAndNewVideosDataForScreenSize('small', newVideosData);
  if (window.matchMedia('(max-width: 600px)').matches) {
    return clipDataSmallSize;
  }
  if (window.matchMedia('(max-width: 1100px)').matches) {
    return clipDataMediumSize;
  }
  return clipDataLargeSize;
}

async function getInitialData(query) {
  console.time('start');
  videosData = [];
  currentPage = 0;
  pageMaxNumber = 0;
  searchUrl.searchParams.delete('q');
  searchUrl.searchParams.set('q', query);
  const responseSearchData = await fetch(searchUrl);
  const searchData = await responseSearchData.json();
  nextPageToken = searchData.nextPageToken;
  const searchDataIds = searchData.items
    .reduce((acc, item) => [...acc, item.id.videoId], [])
    .filter(item => item);

  videosUrl.searchParams.set('id', searchDataIds.join(','));

  const responseVideosData = await fetch(videosUrl);
  const responseVideosDataJSON = await responseVideosData.json();
  console.log(videosData);
  const newVideosData = setNewVideosData(responseVideosDataJSON);
  videosData = setVideosData(newVideosData);


  console.timeEnd('start');
}

async function getNewData(query) {
  console.log('Hello');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('pageToken', nextPageToken);

  const responseSearchData = await fetch(searchUrl);
  const searchData = await responseSearchData.json();
  nextPageToken = searchData.nextPageToken;

  const searchDataIds = searchData.items
    .reduce((acc, item) => [...acc, item.id.videoId], [])
    .filter(item => item);

  videosUrl.searchParams.set('id', searchDataIds.join(','));

  const responseVideosData = await fetch(videosUrl);
  const responseVideosDataJSON = await responseVideosData.json();
  console.log(videosData);

  const newVideosData = setNewVideosData(responseVideosDataJSON);
  videosData = setVideosData(newVideosData);
}


window.addEventListener('resize', () => {
  if (!videosData.length) return;

  videosData = setVideosData();
  renderPage();
  console.log(videosData);
});

window.matchMedia('(max-width: 600px)').onchange = function z() {
  if (window.matchMedia('(max-width: 600px)').matches) {
    currentPage = Math.floor(currentPage * 2);
  } else {
    currentPage = Math.floor(currentPage / 2);
  }
  console.log(currentPage);
};

window.matchMedia('(min-width: 1100px)').onchange = function z() {
  if (window.matchMedia('(min-width: 1100px)').matches) {
    currentPage = Math.floor(currentPage / 2);
  } else {
    currentPage = Math.floor(currentPage * 2);
    console.log(currentPage);
  }
};

function renderPage(animation = '') {

  const clipsHTML = videosData[currentPage]
    .map(
      video => `<div class='clip ${animation}'>
                    <a href='https://www.youtube.com/watch?v=${video.id}' target='_blank'>
                      <img src='${video.image}' class="clip__img" />
                    </a>
                    <a href='https://www.youtube.com/watch?v=${
  video.id
}' class="clip__name">${(video.title.length > 40 ? `${video.title.slice(0, 40)}...` : video.title)}</a>
                    <ul class='clip__details'>
                        <li class='channel'>${video.channelTitle}</li>
                        <li class='published'>${video.publishedAt.slice(0, 10)}</li>
                        <li class='views'>${Number(video.views).toLocaleString()}<li>
                    </ul>
                  </div>`,
    )
    .join('');
    document.querySelector('.clips').innerHTML = clipsHTML;
  document.querySelector('.controllers').appendChild(prevBtn);
  document.querySelector('.controllers').appendChild(pageNumber);
  pageNumber.textContent = currentPage + 1;
  document.querySelector('.controllers').appendChild(nextBtn);
  prevBtn.disabled = currentPage === 0;
}



nextBtn.addEventListener('click', () => {
  currentPage += 1;
  if (currentPage > pageMaxNumber) {
    pageMaxNumber = currentPage;
    getNewData(document.querySelector('input').value);
  }
  document.querySelectorAll('.clip').forEach(clip => clip.classList.toggle('to-left-out'));
      document.querySelector('.clip').addEventListener('transitionend', (e) => {
        renderPage('to-left-in');
      })
});

prevBtn.addEventListener('click', () => {
  currentPage -= 1;
  document.querySelectorAll('.clip').forEach(clip => clip.classList.toggle('to-right-out'));
      document.querySelector('.clip').addEventListener('transitionend', (e) => {
        renderPage('to-right-in');
      })

});

document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();
    await getInitialData(document.querySelector('input').value);
    renderPage();

});
function isTouchDevice() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}
 function handleDragEnd(e) {
  if(!videosData.length) return;
  let endPoint;
  if(isTouchDevice()) endPoint = e.changedTouches[0].pageX
  else endPoint = e.clientX;

  if (endPoint < startPointX - pixelsForRerender) {
      currentPage += 1;
      if (currentPage > pageMaxNumber) {
          pageMaxNumber = currentPage;
           getNewData(document.querySelector('input').value);
      }
      document.querySelectorAll('.clip').forEach(clip => clip.classList.toggle('to-left-out'));
      // document.querySelector('.clips').classList.toggle('show');

      document.querySelector('.clip').addEventListener('transitionend', (e) => {

        renderPage('to-left-in');
      })
  } else if (endPoint > startPointX + pixelsForRerender && currentPage > 0) {

      currentPage -= 1;
      document.querySelectorAll('.clip').forEach(clip => clip.classList.toggle('to-right-out'));
      document.querySelector('.clip').addEventListener('transitionend', (e) => {
        renderPage('to-right-in');
      })

  }
}
document.querySelector('.clips').addEventListener('dragstart', (e) => e.preventDefault());
document.querySelector('.clips').addEventListener('mousedown', function(e) {
  if(!videosData) return;
  startPointX = e.clientX;
  this.addEventListener('mouseup', handleDragEnd);
} );


document.querySelector('.clips').addEventListener('touchstart', (e) => {

  e.preventDefault();
  e.stopPropagation();
  startPointX = e.changedTouches[0].pageX;
  // mousePosition = e.clientX;
});
document.querySelector('.clips').addEventListener('touchend', handleDragEnd);
