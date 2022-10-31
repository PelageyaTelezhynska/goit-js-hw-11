import { Notify } from 'notiflix/build/notiflix-notify-aio';
import marcupCard from './templates/photo-card.hbs';
import { onSearch } from './getData';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  guard: document.querySelector('.guard'),
};

const options = {
  root: null,
  rootMargin: '50px',
  threshold: 1,
};

const observer = new IntersectionObserver(onLoad, options);
const gallerySimplebox = new SimpleLightbox('.photo-link');

let page = 1;
let formData = '';

refs.form.addEventListener('submit', onSubmit);
refs.gallery.addEventListener('click', onGalleryClick);

async function onSubmit(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';
  formData = e.currentTarget.elements.searchQuery.value.trim();
  if (formData === '') {
    onError();
    return;
  }
  e.currentTarget.reset();
  const objForMarkup = await getDataForGallery();
  refs.gallery.insertAdjacentHTML('beforeend', marcupCard(objForMarkup));

  observer.observe(refs.guard);
}

async function getDataForGallery() {
  try {
    const result = await onSearch(formData, page);
    if (result.hits.length === 0) {
      throw new Error();
    }

    if (page === 1) {
      Notify.success(`Hooray! We found ${result.totalHits} images.`);
    }

    return result.hits;
  } catch {
    onError();
  }
}

function onError() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

async function onLoad(entries) {
  const infinityScroll = await entries.forEach(entry => {
    console.log(entry);
    if (entry.isIntersecting) {
      page += 1;
      const data = onSearch(formData, page);
      refs.gallery.insertAdjacentHTML('beforeend', marcupCard(data.hits));
      gallerySimplebox.refresh();

      if (page === 1 || page === 13) {
        observer.unobserve(guard);
      }
    }
    return;
  });
}

function onGalleryClick(e) {
  e.preventDefault();
  if (!e.target.classList.contains('photo-card')) return;
  gallerySimplebox.open();
}
