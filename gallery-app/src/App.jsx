import React from 'react';
import Unsplash from "unsplash-js";
import './App.css';

const imgurClientID = "5b439a3ef4793a3";
const pixabayKey = "13861070-a1e2d0e3eb62e8aa3037589d4";
const unsplash = new Unsplash({
  applicationId: "c4f5fabfff24f47c014261d3f5b025ad3ef602dad297e8046815e571123ac699",
  secret: "fd3e4fb5879caaec1c864818c41fa8506cf4d3acde62daef73fc68bb6be45d93"
});

class App extends React.Component {

  componentDidMount() {
    // Begin with custom search
    document.querySelector("#searchBox").value = "New Zealand";
    document.querySelector("#pixabayRadio").checked = true;
    this.newSearch();
  }

  state = {
    images: [],
    popupURL: ""
  };

  page = 1;

  newSearch = () => {
    this.setState({
      images: []
    }, async () => {
      this.page = 1;
      this.setState({
        images: await this.searchData()
      });
    });
  };

  newPage = async () => {
    this.page++;
    let moreImages = await this.searchData();
    this.setState({
      images: this.state.images.concat(moreImages)
    });
  };

  searchData = async () => {
    let searchValue = document.querySelector("#searchBox").value;
    if (!searchValue) return [];

    let imageList = [];

    if (document.querySelector("#imgurRadio").checked) {
      imageList = await this.getImgurImages(this.page, searchValue);
    } else if (document.querySelector("#pixabayRadio").checked) {
      imageList = await this.getPixabayImages(this.page, searchValue);
    } else if (document.querySelector("#unsplashRadio").checked) {
      imageList = await this.getUnsplashImages(this.page, searchValue);
    }

    return imageList;
  };

  getImgurImages = async (page, search) => {
    let res = await fetch(
      `https://api.imgur.com/3/gallery/search/${page}?q=${search}&q_type=png`,
      {
        method: "get",
        headers: new Headers({
          Authorization: `Client-ID ${imgurClientID}`
        })
      }
    );
    res = await res.json();
    return res.data.map(data => {
      if (!data.images) return data.link;
      else return data.images[0].link;
    });
  };

  getPixabayImages = async (page, search) => {
    let res = await fetch(
      `https://pixabay.com/api/?key=${pixabayKey}&q=${search}&image_type=photo&per_page=12&page=${page}`
    );
    res = await res.json();
    return res.hits.map(data => data.largeImageURL);
  };

  getUnsplashImages = async (page, search) => {
    let res = await unsplash.search.photos(search, page, 12);
    res = await res.json();
    return res.results.map(data => data.urls.regular);
  };

  openImage = e => {
    this.setState({
      popupURL: e.target.src
    });
  };

  closePopup = () => {
    this.setState({
      popupURL: ""
    });
  }

  openFullImage = e => {
    try {
      // For electron
      let imageWindow = new window.remote.BrowserWindow({
        width: window.remote.screen.getPrimaryDisplay().size.width,
        height: window.remote.screen.getPrimaryDisplay().size.height,
        backgroundColor: '#2e2c29',
      });

      imageWindow.setMenuBarVisibility(false);
      imageWindow.setAutoHideMenuBar(true);
      imageWindow.loadURL(e.target.src);
    } catch {
      // For browsers
      window.open(e.target.src, "_blank");
    }
  }

  render() {
    return (
      <div className="App">
        {/* Search */}
        <header className="App-header">
          <div className="searchForm">
            <div>
              <label className="heading" htmlFor="search">Start Typing To Search</label>
            </div>
            <div>
              <input
                type="text"
                name="search"
                id="searchBox"
                onChange={this.newSearch}
              />
            </div>
            <label>
              <input
                type="radio"
                name="sites"
                value="imgur"
                id="imgurRadio"
                onClick={this.newSearch}
                defaultChecked
              />
              Imgur
            </label>
            <label>
              <input
                type="radio"
                name="sites"
                value="pixabay"
                id="pixabayRadio"
                onClick={this.newSearch}
              />
              Pixabay
            </label>
            <label>
              <input
                type="radio"
                name="sites"
                value="unsplash"
                id="unsplashRadio"
                onClick={this.newSearch}
              />
              Unsplash
            </label>
          </div>
        </header>

        {/* Images */}
        <main>
          <div className="imageList">
            {this.state.images.map((data, idx) => (
              <div key={idx} className="imageWrapper">
                <img
                  key={idx}
                  className="images"
                  alt="gallery item"
                  src={data}
                  onClick={this.openImage}
                />
              </div>
            ))}
          </div>
          {this.state.images.length > 0 ? (
            <button className="moreImages" onClick={this.newPage}>
              More Images
            </button>
          ) : null}
        </main>

        {/* Popup */}
        {this.state.popupURL !== "" ? (
          <div className="popup">
            <div onClick={this.closePopup} className="outerBox"></div>
            <div className="selectedImage">
              <div onClick={this.closePopup} className="closeBtn">
                &times;
              </div>
              <img
                alt="selected item"
                src={this.state.popupURL}
                onClick={this.openFullImage}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
