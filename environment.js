const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
const params = {
  part: 'snippet, id',
  key: 'AIzaSyCCJIXC9eWHVKbPxdyocYR9uWK8041DeCw',
  maxResults: 15,
};
Object.keys(params).forEach(key => searchUrl.searchParams.append(key, params[key]));

const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
const videoParams = {
  part: 'snippet, statistics',
  key: 'AIzaSyCCJIXC9eWHVKbPxdyocYR9uWK8041DeCw',
};
Object.keys(videoParams).forEach(key => videosUrl.searchParams.append(key, videoParams[key]));

export { searchUrl, videosUrl };
