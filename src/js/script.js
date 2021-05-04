'use strict';

/**
 * Wrapps the fetch API to return text or JSON responses
 * @param {string} url 
 * @param {string} responseType 
 * @returns 
 */
const fetchWrapper = async (url, responseType = 'json') => {
    let response = await fetch(url);

    if(!response.ok){
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }

    if(responseType === 'json') return await response.json()
    else return await response.text()
}

/**
 * Parse XML text to Document element
 * @param {string} text 
 * @returns 
 */
const parseXML = text => {
    if(window.DOMParser){
        let parser = new DOMParser();
        return parser.parseFromString(text, 'application/xml');
    } 
    console.error('Your browser does not support DOMParser');
}

/**
 * Extracts the value of a child nodes property
 * @param {XMLNode} node 
 * @param {string} property 
 * @returns 
 */
const extratNodeValues = (node, property) => {
    if(node?.getElementsByTagName(property)[0]?.childNodes[0]?.nodeValue) return node.getElementsByTagName(property)[0].childNodes[0].nodeValue;
    else return '';
}

/**
 * Goes through an XML document and adds articles to an array
 * @param {XMLDocument} xmlDoc 
 * @param {array} aggregatedArray 
 */
const aggregateRSS = (xmlDoc, aggregatedArray) => {
    console.log(xmlDoc);
    let channel = xmlDoc.getElementsByTagName('channel')[0];
    let channelTitle = extratNodeValues(channel, 'title');
    let channelLink = extratNodeValues(channel, 'link');
    let channelDescription = extratNodeValues(channel, 'description');
    let channelLanguage = extratNodeValues(channel, 'language');
    let channelImage = channel.getElementsByTagName('image')[0]
    let channelImageTitle = extratNodeValues(channelImage, 'title');
    let channelImageURL = extratNodeValues(channelImage, 'url');
    let channelImageLink = extratNodeValues(channelImage, 'link');
    let channelItems = [];
    let rawChannelItems = [...channel.getElementsByTagName('item')]; // Deconstructed HTML node collection to allow looping with forEach
    rawChannelItems.forEach(item => {
        let itemContentMedia = item.getElementsByTagName('media:content')[0];
        let imageURL = itemContentMedia?.getAttribute('url');
        channelItems.push({
            author: extratNodeValues(item, 'dc:creator'),
            title: extratNodeValues(item, 'title'),
            link: extratNodeValues(item, 'link'),
            description: extratNodeValues(item, 'description'),
            guid: extratNodeValues(item, 'guid'),
            pubDate: extratNodeValues(item, 'pubDate'),
            image: imageURL,
            imageDescription: extratNodeValues(itemContentMedia, 'media:description'),
            imageAuthor: extratNodeValues(itemContentMedia, 'media:credit'),
            channelTitle: channelTitle,
            channelLink: channelLink,
            channelImage: channelImage,
            channelLanguage: channelLanguage,
        });
    });


    // Used for eventual further development
    aggregatedArray.push({
        channel: channelTitle,
        link: channelLink,
        description: channelDescription,
        language: channelLanguage,
        image: {
            url: channelImageURL,
            title: channelImageTitle,
            link: channelImageLink,
        },
        items: channelItems
    });
}

/**
 * Sorts array by field name and remove duplicates
 * @param {XMLNode} channels 
 * @param {string} sortField 
 * @param {int} limit 
 * @returns 
 */
const sortItems = (channels, sortField = 'pubDate', limit = 10) => {
    let allItems = [];
    channels.forEach(channel => {
        channel.items.forEach(item => allItems.push(item));
    });

    allItems.sort((a, b) => {
        let fieldA = new Date(a[sortField]); // Further implementation needed for other fields
        let fieldB = new Date(b[sortField]);
        if(fieldA < fieldB) return 1;
        else if(fieldA > fieldB) return -1;
        else return 0;
    });

    let uniqueItems = [...new Map(allItems.map(item => [item['guid'], item])).values()]

    return uniqueItems.slice(0, limit);
}

/**
 * Builds a simple OL list
 * @param {array} feeds 
 */
const renderFeeds = feeds => {
    let container = document.querySelector('div#latest-feeds');
    container.innerHTML = '';
    container.classList.remove('grid');
    let list = document.createElement('div');
    let listHTML = '<ol>';
    feeds.forEach(feed => {
        listHTML += `<li>
            <a href="${feed.link}">${feed.title}</a>
        </li>`;
    });
    listHTML += '</ol>'
    list.innerHTML = listHTML
    container.appendChild(list);
}

/**
 * builds a card UI
 * @param {array} feeds 
 */
const renderFeedCards = feeds => {
    let container = document.querySelector('div#latest-feeds');
    container.innerHTML = '';
    container.classList.add('grid');
    feeds.forEach(feed => {
        let card = buildFeedCard(feed);
        container.appendChild(card);
    });
}

/**
 * Builds a card based on an item
 * @param {object} feed 
 * @returns 
 */
const buildFeedCard = feed => {
    console.log(feed);
    let card = document.createElement('div');
    let cardHTML = `
        <div class="card">
            ${feed.image ? `<img src="${feed.image}"/>` : ``}
            <div class="channel-banner"><a href="${feed.channelLink}">${feed.channelTitle}</a></div>
            <div class="content">
                <div class="header">
                    <h1><a href="${feed.link}">${feed.title}</a></h1>
                    <small>${feed.author}</small>
                    <small>${feed.pubDate}</small>
                </div>
                ${feed.description.trim() ? `<hr/>` : ``}
                <div class="description">
                    <p>${feed.description}</p>
                </div>
            </div>
        </div>
    `;
    card.innerHTML = cardHTML;

    return card;
}

/**
 * Fetches RSS feeds from an array of URLs. Uses a proxy to go around CORS policy problems in development environment
 * @param {array} urls 
 * @param {string} proxy 
 */
const fetchFeeds =  (urls, proxy = '') => {
    let counter = 0;
    urls.forEach((url) => {
         fetchWrapper(proxy+url, 'text')
        .then(content => {
            let xmlDoc = parseXML(content);
            aggregateRSS(xmlDoc, feedsArray);
            if(counter == urls.length - 1){
                latestFeeds = sortItems(feedsArray);
                renderFeeds(latestFeeds);
                console.log(latestFeeds);
            } else counter ++;
        })
        .catch(e => console.log(e))
    });
}


const CORS_PROXY = "https://cors-anywhere.herokuapp.com/" 
const feedsURL = 'assets/feeds.json';
const localFeedsURL = 'assets/localFeeds.json';
let feedsArray = [];
let latestFeeds = [];
let lFeeds = document.querySelector('button.local');
let iFeeds = document.querySelector('button.internet');
let tView = document.querySelector('button.toggle');

lFeeds.addEventListener('click', function(e) {
    e.preventDefault();
    fetchWrapper(localFeedsURL, 'json')
    .then(json => {
        fetchFeeds(json.feeds);
    });
});

iFeeds.addEventListener('click', function(e){
    e.preventDefault();
    fetchWrapper(feedsURL, 'json')
    .then(json => {
        fetchFeeds(json.feeds, CORS_PROXY);
    });
})

tView.addEventListener('click', function(e){
    e.preventDefault();
    console.log(latestFeeds);

    renderFeedCards(latestFeeds);
});