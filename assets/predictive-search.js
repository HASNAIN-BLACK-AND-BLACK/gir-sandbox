class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.cachedResults = {};
    let SearchedProducts = [] ;
    this.SearchedProducts = []
    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector('[data-predictive-search]');
    this.isOpen = false;

    this.setupEventListeners();

    const elementToObserve = document.querySelector("body");
    const observer = new MutationObserver((changes) => {
      changes.forEach(function(change) {
        if($(change.target).hasClass('snize-ac-results-singlecolumn-list'))
        {
          SearchedProducts = [];
          $(change.target).find(".snize-product").each((index, item) => {
            let image = $(item).find(".snize-thumbnail img").attr("src");
            let title = $(item).find(".snize-title").text();
            let price = $(item).find(".snize-price-list .snize-price").text();
            let link = $(item).find("a.snize-item").attr('href');


            let singleProduct = {
              image,
              title,
              price,
              link,
            };
            SearchedProducts.push(singleProduct);
          });
        }
    });

    this.SearchedProducts = SearchedProducts
    });
    observer.observe(elementToObserve, { subtree: true, childList: true });

  }

  setupEventListeners() {
    const form = this.querySelector('form.search');
    form.addEventListener('submit', this.onFormSubmit.bind(this));

    this.input.addEventListener('input', debounce((event) => {
      this.onChange(event);
    }, 300).bind(this));
    this.input.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.addEventListener('keyup', this.onKeyup.bind(this));
    this.addEventListener('keydown', this.onKeydown.bind(this));
  }

  getQuery() {
    return this.input.value.trim();
  }

  onChange() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) {
      this.close(true);
      return;
    }

    this.getSearchResults(searchTerm);
  }

  onFormSubmit(event) {
    if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
  }

  onFocus() {
    const searchTerm = this.getQuery();

    if (!searchTerm.length) return;

    if (this.getAttribute('results') === 'true') {
      this.open();
    } else {
      this.getSearchResults(searchTerm);
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    })
  }

  onKeyup(event) {
    if (!this.getQuery().length) this.close(true);
    event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
        this.switchOption('up')
        break;
      case 'ArrowDown':
        this.switchOption('down');
        break;
      case 'Enter':
        this.selectOption();
        break;
    }
  }

  onKeydown(event) {
    // Prevent the cursor from moving in the input when using the up and down arrow keys
    if (
      event.code === 'ArrowUp' ||
      event.code === 'ArrowDown'
    ) {
      event.preventDefault();
    }
  }

  switchOption(direction) {
    if (!this.getAttribute('open')) return;

    const moveUp = direction === 'up';
    const selectedElement = this.querySelector('[aria-selected="true"]');
    const allElements = this.querySelectorAll('li');
    let activeElement = this.querySelector('li');

    if (moveUp && !selectedElement) return;

    this.statusElement.textContent = '';

    if (!moveUp && selectedElement) {
      activeElement = selectedElement.nextElementSibling || allElements[0];
    } else if (moveUp) {
      activeElement = selectedElement.previousElementSibling || allElements[allElements.length - 1];
    }

    if (activeElement === selectedElement) return;

    activeElement.setAttribute('aria-selected', true);
    if (selectedElement) selectedElement.setAttribute('aria-selected', false);

    this.setLiveRegionText(activeElement.textContent);
    this.input.setAttribute('aria-activedescendant', activeElement.id);
  }

  selectOption() {
    const selectedProduct = this.querySelector('[aria-selected="true"] a, [aria-selected="true"] button');

    if (selectedProduct) selectedProduct.click();
  }

  getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(" ", "-").toLowerCase();
    this.setLiveRegionLoadingState();

    if (this.cachedResults[queryKey]) {
      this.renderSearchResults(this.cachedResults[queryKey]);
      return;
    }

    // fetch(
    //   `${routes.predictive_search_url}?q=${encodeURIComponent(
    //     searchTerm
    //   )}&${encodeURIComponent("resources[type]")}=product&${encodeURIComponent(
    //     "resources[limit]"
    //   )}=6&section_id=predictive-search`
    // )
    //   .then((response) => {
    //     if (!response.ok) {
    //       var error = new Error(response.status);
    //       this.close();
    //       throw error;
    //     }

    //     return response.text();
    //   })
    //   .then((text) => {
    //     const resultsMarkup = new DOMParser()
    //       .parseFromString(text, "text/html")
    //       .querySelector("#shopify-section-predictive-search").innerHTML;
    //     this.cachedResults[queryKey] = resultsMarkup;
    //     this.renderSearchResults(resultsMarkup);
    //   })
    //   .catch((error) => {
    //     this.close();
    //     throw error;
    //   });

    setTimeout(()=>{
      this.SmartsearchProductResult()
    }, 800);

  }

  SmartsearchProductResult()
  {
    console.log( this.SearchedProducts)
    console.log( this.SearchedProducts.length)
    console.log(this.getQuery())

    

    if(this.getQuery().length && !this.SearchedProducts.length)
    { 
      $('header .predictive-search .suggested-search , header .predictive-search .suggested-search .predictive-search__loading-state').show();
      $('header .predictive-search').find('#predictive-nosearch-results-list').show()
      $('header .predictive-search #predictive-search-results').find('#predictive-search-results-list').empty();
      $('header .predictive-search #predictive-search-results').hide();
    }

    if(!this.SearchedProducts.length) return ;


    $('header .predictive-search .suggested-search , header .predictive-search .suggested-search .predictive-search__loading-state').hide();
    $('header .predictive-search #predictive-search-results').show();
    $('header .predictive-search').find('#predictive-nosearch-results-list').hide()
    $('header .predictive-search #predictive-search-results').find('.predictive-search-see-all').text(`SEE ALL RESULTS (${this.SearchedProducts.length})`);
    $('header .predictive-search #predictive-search-results').find('#predictive-search-results-list').empty();
  this.SearchedProducts.slice(0, 6).map((product,key) => {
    console.log("product.price: ", product.price);
    var noDecPrice = Math.floor(product.price);
    console.log("noDecPrice: ", noDecPrice);
   let Producthtml = `<li id="predictive-search-option-${key}" class="predictive-search__list-item" role="option" aria-selected="false"> <a href="${product.link}" class="predictive-search__item predictive-search__item--link link link--text" tabindex="-1"><div class="product-card-media media"> <div class="media-ratio ratio--1-1"> <img class="predictive-search__image media-asset" src="${product.image};width=250"> </div></div><div class="predictive-search__item-content"><div> <h3 class="predictive-search__item-heading h5">${product.title}</h3><h4 class="typography-font-3 product-subtitle">100% CASHMERE</h4> <span class="medium-hide large-up-hide typography-font-3 uppercase available-colors">1 color</span> </div><div class="price typography-font-3"> <div class="price__container"><div class="price__regular"> <span class="visually-hidden visually-hidden--inline">Regular price</span> <span class="price-item price-item--regular"> ${noDecPrice} </span> </div><div class="price__sale"> <span class="visually-hidden visually-hidden--inline">Regular price</span> <span> <s class="price-item price-item--regular"> ${noDecPrice} </s> </span><span class="visually-hidden visually-hidden--inline">Sale price</span> <span class="price-item price-item--sale price-item--last"> ${noDecPrice} </span> </div><small class="unit-price caption hidden"> <span class="visually-hidden">Unit price</span> <span class="price-item price-item--last"> <span></span> <span aria-hidden="true">/</span> <span class="visually-hidden">&nbsp;per&nbsp;</span> <span> </span> </span> </small> </div></div></div></a> </li>`
   $('header .predictive-search #predictive-search-results').find('#predictive-search-results-list').append(Producthtml) 
  })
  }


  setLiveRegionLoadingState() {
    this.statusElement = this.statusElement || this.querySelector('.predictive-search-status');
    this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

    this.setLiveRegionText(this.loadingText);
    this.setAttribute('loading', true);
  }

  setLiveRegionText(statusText) {
    this.statusElement.setAttribute('aria-hidden', 'false');
    this.statusElement.textContent = statusText;

    setTimeout(() => {
      this.statusElement.setAttribute('aria-hidden', 'true');
    }, 1000);
  }

  renderSearchResults(resultsMarkup) {
    // console.log(resultsMarkup);
    this.predictiveSearchResults.innerHTML = resultsMarkup;
    this.setAttribute("results", true);

    this.setLiveRegionResults();
    this.open();
  }

  setLiveRegionResults() {
    this.removeAttribute('loading');
    this.setLiveRegionText(this.querySelector('[data-predictive-search-live-region-count-value]').textContent);
  }

  getResultsMaxHeight() {
    this.resultsMaxHeight = window.innerHeight - document.getElementById('shopify-section-header').getBoundingClientRect().bottom;
    return this.resultsMaxHeight;
  }

  open() {
    this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
    this.setAttribute('open', true);
    this.input.setAttribute('aria-expanded', true);
    this.isOpen = true;
  }

  close(clearSearchTerm = false) {
    if (clearSearchTerm) {
      this.input.value = '';
      this.removeAttribute('results');
    }

    const selected = this.querySelector('[aria-selected="true"]');

    if (selected) selected.setAttribute('aria-selected', false);

    this.input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('open');
    this.input.setAttribute('aria-expanded', false);
    this.resultsMaxHeight = false
    this.predictiveSearchResults.removeAttribute('style');

    this.isOpen = false;
  }



}






customElements.define('predictive-search', PredictiveSearch);
