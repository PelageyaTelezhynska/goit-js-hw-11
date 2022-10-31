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
  observer.unobserve(refs.guard);

  refs.gallery.innerHTML = '';
  page = 1;

  formData = e.currentTarget.elements.searchQuery.value.trim();
  if (!formData) {
    refs.gallery.innerHTML = '';
    onError();
    return;
  }

  e.target.reset();

  try {
    const result = await getDataForGallery(formData, page);

    if (result.hits.length >= 40) {
      observer.observe(refs.guard);
    }
    return result;
  } catch (error) {
    return;
  }
}

async function getDataForGallery(formData, page) {
  const result = await onSearch(formData, page);
  if (result.hits.length === 0) {
    onError();
    return;
  }

  Notify.success(`Hooray! We found ${result.totalHits} images.`);
  refs.gallery.insertAdjacentHTML('beforeend', marcupCard(result.hits));
  return result;
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
      onSearch(formData, page).then(data => {
        const markup = marcupCard(data.hits);
        refs.gallery.insertAdjacentHTML('beforeend', markup);

        if (page === 13) {
          Notify.info(
            'Great job! All of the images have been reviewed. Try looking for something else!'
          );
          observer.unobserve(refs.guard);
        }
      });
      gallerySimplebox.refresh();
    }
  });
}

function onGalleryClick(e) {
  e.preventDefault();
  if (!e.target.classList.contains('photo-card')) return;
  gallerySimplebox.open();
}
