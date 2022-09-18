const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filterMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  //title,image
  data.forEach(item => {
    rawHTML +=
      ` <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
          </div>
        </div>
      </div >`
  });

  dataPanel.innerHTML = rawHTML
}

//要先知道電影有幾部，才知道要分幾頁(無條件進位)
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 1. 所有movies的頁數  2. 篩選出來的電影頁數filterMovies
function getMoviesByPage(page) {
  // page1 -> movie 0~11
  // page2--> movie 12~23

  //當filterMovies陣列 > 0，表示有人在搜尋，若filterMovies是空陣列，那就給我movies
  const data = filterMovies.length ? filterMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = `Release date: ` + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster"
    class="image-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //當左邊回傳false就會回傳右邊的空陣列
  //JSON.parse會將字串變成javascrips的陣列
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) { //單純尋找
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  // const jsonString = JSON.stringify(list)// 把javascrips資料變成JSON字串 (用[]把資料包起來)
  // console.log('json string:', jsonString)
  // console.log('json object:', JSON.parse(jsonString))
  console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))


}

dataPanel.addEventListener('click', function onPanelClicked(event) { //用匿名function會使除錯時較難找到問題
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatoeClicked(event) {
  if (event.target.tagName !== 'A') return  //當點的不是<a></a>，就跳出
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


searchForm.addEventListener('submit', function onSearchFromSubmitted(event) {
  event.preventDefault() //讓瀏覽器不要重整
  const keyword = searchInput.value.trim().toLowerCase() //一律換小寫+去掉空白


  //filter方法
  filterMovies = movies.filter(movies => movies.title.toLowerCase().includes(keyword))
  if (filterMovies.length === 0) {
    return alert('Cannot find movie wth keyword: ' + keyword)
  }


  //迴圈方法，當for-of從movies中找到keyword，並將資料放進filter陣列，並用filter覆蓋掉renderMovieList
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filterMovies.push(movie)
  //   }
  // }
  renderPaginator(filterMovies.length)
  renderMovieList(getMoviesByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})

// localStorage.setItem("default_language", JSON.strngify) //放的value只能字串
