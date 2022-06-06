import axios from 'axios';
import './css/styles.css';
import Notiflix from 'notiflix';
// import SimpleLightbox from 'simplelightbox/dist/simple-lightbox.esm';
// import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  btnMore: document.querySelector('.load-more'),
};

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '27848247-ce78afbd89c0e4185f88b7a39';
const LIMIT = 40;
let NUMBER_OF_PAGE = 1;

refs.form.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  NUMBER_OF_PAGE = 1;

  const query = e.currentTarget.elements.searchQuery.value.trim();
  const decodeQuery = decodeURIComponent(query.replace(' ', '+'));
  if (decodeQuery) {
    getData(decodeQuery);
  }

  e.currentTarget.elements.searchQuery.value = '';
}

async function getData(decodeQuery) {
  const params = new URLSearchParams({
    per_page: LIMIT,
    page: NUMBER_OF_PAGE,
  });
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${decodeQuery}&image_type=photo&${params}&orientation=horizontal&safesearch=true`
    );

    if (NUMBER_OF_PAGE === 1 && response.data.totalHits !== 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }
    NUMBER_OF_PAGE += 1;
    cardMarkup(response.data.hits);

    if (!(response.data.hits.length < LIMIT)) {
      infinityScroll(
        document.querySelector('.card-thumb:last-child'),
        decodeQuery
      );
    }
    if (response.data.hits.length < LIMIT && response.data.totalHits !== 0) {
      const message =
        "We're sorry, but you've reached the end of search results.";
      Notiflix.Notify.info(message);
    }
    if (response.data.totalHits == 0) {
      const message =
        'Sorry, there are no images matching your search query. Please try again.';
      Notiflix.Notify.failure(message);
    }
  } catch (error) {
    console.log(error);
  }
}

function cardMarkup(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href='${largeImageURL}' class='card-thumb'>
      <div class="photo-card">
        <dv class="thumb"><img src=${webformatURL} alt=${tags} loading="lazy"/></dv>
        <div class="info">
        <p class="info-item">
          <b>Likes <br>${likes}</b>
        </p>
        <p class="info-item">
          <b>Views <br>${views}</b>
        </p>
        <p class="info-item">
          <b>Comments <br>${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads <br>${downloads}</b>
        </p>
        </div>
      </div>
      </a>
      `;
      }
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function infinityScroll(lastElement, decodeQuery) {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          getData(decodeQuery);
        }
      });
    },
    {
      threshold: 0.8,
    }
  );
  observer.observe(lastElement);
}

// const gallery = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });
