console.log('Hola');

(async function load (){


  //Obtiene datos
  async function getData(url){
    const response = await fetch (url);           //Trae datos de la API
    const data = await response.json();           //Guarda la promesa obtenida en una variable
    if (data.data.movie_count > 0){
      return data;                                  //Devuelve promesa
    }
    throw new Error ('No se encontró ningún resultado');
    
  }

  const $form = document.getElementById('form');
  const $home = document.getElementById('home');

  const $featuringContainer = document.getElementById ('featuring');
  function setAttributes($element, attributes){
    for (const attribute in attributes){
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }
  const BASE_API = 'https://yts.mx/api/v2/';

  function featuringTemplate(peli){
    return (
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      `
    )
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const $loader = document.createElement('img');
    $home.classList.add('search-active');
    setAttributes ($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })
    $featuringContainer.append($loader);

    const data = new FormData($form);

    try{
      const{
        data:{
          movies: pelis
        }
      } = await getData (`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;
    } catch (error){
      alert (error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  })

  //Template
function videoItemTemplate (movie, category) {
  return(
  `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category=${category}>
    <div class="primaryPlaylistItem-image">
      <img src="${movie.medium_cover_image}">
    </div>
    <h4 class="primaryPlaylistItem-title">
      ${movie.title}
    </h4>
  </div>`
  )
}

function createTemplate (HTMLString){
  const $html = document.implementation.createHTMLDocument();
  $html.body.innerHTML = HTMLString;
  return $html.body.children[0];
}

function addEventClick ($element){
  $element.addEventListener ('click', () => { 
    showModal($element);
  })
}

function renderMovies (list, $container, category){
  $container.children[0].remove();
  list.forEach((movie) => {
    const HTMLString = videoItemTemplate (movie, category);
    const movieElement = createTemplate(HTMLString);
    $container.append(movieElement);
    const image = movieElement.querySelector('img');
    image.addEventListener ('load', () =>{   //Escucha cuando termina de cargar
      event.srcElement.classList.add ('fadeIn');
    }) 
    addEventClick (movieElement);
  });
}

async function cacheExist (category){
  listName = `${category}List`
  const cacheList = window.localStorage.getItem('listName');
  if (cacheList != null ){
    debugger
    return JSON.parse(cacheList);
  }
  
  const {data:{movies: data}} = await getData(`${BASE_API}list_movies.json?genre=${category}`);
  window.localStorage.setItem(listName, JSON.stringify(data))

  return data;
}

const actionList = await cacheExist('action');
const $actionContainer = document.querySelector('#action');
renderMovies (actionList, $actionContainer, 'action');

const dramaList = await cacheExist('drama');
const $dramaContainer = document.querySelector('#drama');
renderMovies (dramaList, $dramaContainer, 'drama');

const animationList = await cacheExist('animation');
const $animationContainer = document.querySelector('#animation');
renderMovies (animationList, $animationContainer, 'animation');


//Es indistinto usar querySelector - getElementById - getElementByClass
  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');
  const $modalTitle = $modal.querySelector('h1');
  const $modalDescription = $modal.querySelector('p');
  const $modalImage = $modal.querySelector('img');

  function findById (list, id){
    return list.find (movie => movie.id == parseInt(id, 10));
  }

  function findMovie (id, category){

    switch (category){
      case 'action':{
        return findById(actionList, id);
      }
      case 'drama':{
        return findById(dramaList, id);
      }
      case 'animation':{
        return findById(animationList, id);
      }
      default: {
        console.log("La categoria no es correcta")
      }
    }
  }

  function showModal($element){
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id =$element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie (id, category);

    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent =data.description_full;
  }

  $hideModal.addEventListener ('click', hideModal);
  function hideModal (){
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

})()
